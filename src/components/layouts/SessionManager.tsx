import { useEffect } from "react";
import { parseISO, isBefore, addMinutes } from "date-fns";
import { useSessionStore } from "@/states/sessionStore";
import { useSession } from "@/hooks/session/useSession";

/**
 * SessionManager component handles global side effects related to user sessions,
 * such as initial fetching, periodic token refresh, and session expiration checks.
 * This component should be rendered once in the application layout.
 */
export default function SessionManager() {
  const { session, fetchSession } = useSessionStore();
  const { logout, refresh } = useSession();

  useEffect(() => {
    const state = useSessionStore.getState();
    if (!state.isFetched) {
      fetchSession();
    }
  }, [fetchSession]);

  useEffect(() => {
    if (session?.error) {
      logout();
      return;
    }

    const handleFocus = () => {
      // Logout user if token has expired
      if (session && isBefore(parseISO(session.expires), Date.now())) {
        logout();
      }
    };

    window.addEventListener("focus", handleFocus);

    const intervalId = setInterval(() => {
      // Refresh token if it will expire in 1 min
      if (
        session &&
        isBefore(parseISO(session.expires), addMinutes(Date.now(), 1))
      ) {
        refresh();
      }
    }, 1000 * 30);

    return () => {
      window.removeEventListener("focus", handleFocus);
      clearInterval(intervalId);
    };
  }, [session, fetchSession, logout, refresh]);

  return null;
}
