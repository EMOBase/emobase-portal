/**
 * Temporary server-side session for the demo login.
 *
 * This file simulates an authenticated session by storing a JSON user object
 * in an httpOnly cookie.
 *
 * TODO: Remove this file and all its usages when adopting real auth (Keycloak).
 * At that point the user will be derived from a validated token instead of this
 * bespoke cookie.
 */

export interface SessionUser {
  email: string;
  name: string;
}

/** TODO: Remove when adopting real auth (Keycloak). */
export const SESSION_COOKIE = "emobase.session";

/** TODO: Remove — the single hardcoded user used for every demo login. */
export const ADMIN_USER: SessionUser = {
  email: "admin@emobase.org",
  name: "EMOBase Admin",
};

/** TODO: Remove when adopting real auth (Keycloak). */
export function userFromCookie(value: string | undefined): SessionUser | null {
  if (!value) return null;
  try {
    return JSON.parse(value) as SessionUser;
  } catch {
    return null;
  }
}

/** TODO: Remove when adopting real auth (Keycloak). */
export function serializeUser(user: SessionUser): string {
  return JSON.stringify(user);
}
