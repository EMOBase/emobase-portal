/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

import type { Session } from "@auth/core/types";

declare global {
  namespace App {
    interface Locals {
      /** The Auth.js session, or null when signed out. */
      session: Session | null;
      /** Convenience projection of `session.user` used by layouts. */
      user: { email: string; name: string } | null;
    }
  }
}

declare global {
  interface Window {
    /** Hydrated from the admin layout so the client skips a /api/auth/session call. */
    __SESSION__?: Session;
  }
}

export {};
