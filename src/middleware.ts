import { defineMiddleware } from "astro:middleware";
import { getSession } from "@zitadel/astro-auth/server";

import authConfig from "../auth.config.mjs";
import { VERSION_COOKIE_NAME } from "@/utils/cookie";
import genomicsService from "@/utils/services/genomics";
import { runWithVersionContext } from "@/utils/version";

const shouldSkipVersionCleanup = (pathname: string) =>
  pathname.startsWith("/api") ||
  pathname.startsWith("/_astro") ||
  pathname.startsWith("/assets") ||
  pathname.includes("."); // Check for files with extension, e.g. favicon.ico, logo.png, .etc

export const onRequest = defineMiddleware(async (context, next) => {
  // Auth.js sessions are JWTs, so this is a local cookie decode — no network
  // round trip, even on every public page.
  const session = await getSession(context.request, authConfig);

  context.locals.session = session;
  context.locals.user = session?.user?.email
    ? {
        email: session.user.email,
        name: session.user.name ?? session.user.email,
      }
    : null;

  // A URL parameter wins for the current view only. Do not write it into the
  // cookie: a shared portal link must not silently replace the user's choice.
  const rawOverride = context.url.searchParams.get("version");
  const selectedVersion = context.cookies.get(VERSION_COOKIE_NAME)?.value;
  let overrideVersion: string | undefined = undefined;

  if (rawOverride !== null && !shouldSkipVersionCleanup(context.url.pathname)) {
    const trimmed = rawOverride.trim();
    if (trimmed === "") {
      const url = new URL(context.url);
      url.searchParams.delete("version");
      return context.redirect(`${url.pathname}${url.search}${url.hash}`, 302);
    }

    try {
      const { fetchPublicVersions } = genomicsService();
      const versions = await fetchPublicVersions();
      const isValid = versions.some((v) => v.name === trimmed);
      if (!isValid) {
        const url = new URL(context.url);
        url.searchParams.delete("version");
        return context.redirect(`${url.pathname}${url.search}${url.hash}`, 302);
      }
      overrideVersion = trimmed;
    } catch {
      // If versions cannot be fetched, let the resolver handle validation.
      overrideVersion = trimmed || undefined;
    }
  } else if (rawOverride !== null) {
    const trimmed = rawOverride.trim();
    overrideVersion = trimmed || undefined;
  }

  return runWithVersionContext({ overrideVersion, selectedVersion }, () =>
    next(),
  );
});
