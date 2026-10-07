import { defineMiddleware } from "astro:middleware";
import { getSession } from "@zitadel/astro-auth/server";

import authConfig from "../auth.config.mjs";

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

  return next();
});
