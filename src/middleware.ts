import { defineMiddleware } from "astro:middleware";

// TODO: Remove with src/auth/session.ts when adopting real auth (Keycloak).
import { SESSION_COOKIE, userFromCookie } from "@/auth/session";

export const onRequest = defineMiddleware((context, next) => {
  // TODO: Replace with resolving the user from a real Keycloak session/token.
  const cookie = context.cookies.get(SESSION_COOKIE)?.value;
  context.locals.user = userFromCookie(cookie);
  return next();
});
