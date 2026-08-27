/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

// TODO: Replace `SessionUser` with the real user type (e.g. Keycloak token
// claims) when adopting real auth. Remove the src/auth/session.ts import.
import type { SessionUser } from "@/auth/session";

declare global {
  namespace App {
    interface Locals {
      /** The authenticated user, or null when logged out. */
      user: SessionUser | null;
    }
  }
}
