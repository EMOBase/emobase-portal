import { signIn, signOut } from "@zitadel/astro-auth/client";

import { useSessionStore } from "@/states/sessionStore";

/**
 * A hook to access the current session from the client side.
 * Uses a global Zustand store to cache the session and prevent redundant API calls.
 */
export function useSession() {
  const { session, loading, fetchSession } = useSessionStore();

  const refresh = () => {
    fetchSession(true);
  };

  const login = () => signIn("keycloak", { callbackUrl: "/admin" });

  const logout = () => signOut({ callbackUrl: "/" });

  return {
    session,
    loading,
    isLoggedIn: !!session,
    user: session?.user,
    refresh,
    login,
    logout,
  };
}
