import { useCallback } from "react";

import { apiFetch } from "@/utils/apiFetch";
import { useSessionStore } from "@/states/sessionStore";

/* Api fetch with jwt access token attached */
const useApiFetch = () => {
  return useCallback(async <T>(...params: Parameters<typeof apiFetch<T>>) => {
    const { isFetched } = useSessionStore.getState();

    /* Safety net: normally the session is already populated from SSR or a prior
       fetchSession call, so this only runs for non-admin pages or edge cases
       where the store hasn't been hydrated yet. */
    if (!isFetched && typeof window !== "undefined") {
      await Promise.race([
        new Promise<void>((resolve) => {
          const unsub = useSessionStore.subscribe((s) => {
            if (s.isFetched) {
              unsub();
              resolve();
            }
          });
        }),
        new Promise<void>((_, reject) =>
          setTimeout(
            () => reject(new Error("Session fetch timed out")),
            15_000,
          ),
        ),
      ]);
    }

    const { session: currentSession } = useSessionStore.getState();

    if (currentSession?.user?.accessToken) {
      if (!params[2]) params[2] = {};
      const opts = params[2];
      opts.authorization = `Bearer ${currentSession.user.accessToken}`;
    }

    return await apiFetch<T>(...params);
  }, []);
};

export default useApiFetch;
