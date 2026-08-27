import { defineAction } from "astro:actions";

// TODO: Remove with src/auth/session.ts when adopting real auth (Keycloak).
import { ADMIN_USER, SESSION_COOKIE, serializeUser } from "@/auth/session";

export const server = {
  /**
   * TODO: Replace with a Keycloak / server-side API login flow.
   * Currently there is no credential check — it always logs in the single
   * ADMIN_USER.
   */
  login: defineAction({
    handler: async (_input, { cookies }) => {
      // TODO: Remove — writes the hardcoded user into the demo session cookie.
      cookies.set(SESSION_COOKIE, serializeUser(ADMIN_USER), {
        path: "/",
        httpOnly: true,
        secure: import.meta.env.PROD,
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7,
      });
      return ADMIN_USER;
    },
  }),
  logout: defineAction({
    handler: async (_input, { cookies }) => {
      // TODO: Replace with a Keycloak / server-side API logout when adopted.
      cookies.delete(SESSION_COOKIE, { path: "/" });
      return { success: true };
    },
  }),
};
