import { defineMiddleware } from "astro:middleware";
import { getSession } from "@zitadel/astro-auth/server";

import authConfig from "../auth.config.mjs";
import { VERSION_COOKIE_NAME } from "@/utils/cookie";
import { runWithVersionContext } from "@/utils/version";

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
  const overrideVersion = context.url.searchParams.get("version") || undefined;
  const selectedVersion = context.cookies.get(VERSION_COOKIE_NAME)?.value;

  return runWithVersionContext({ overrideVersion, selectedVersion }, () =>
    next(),
  );
});
