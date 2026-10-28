import type { AsyncLocalStorage } from "node:async_hooks";

import { VERSION_COOKIE_NAME, getCookie } from "@/utils/cookie";

export type VersionInfo = { name: string; isDefault?: boolean };

// The `versionsPromise` is a per-request cache of the public versions fetch,
// so every resolver created during one SSR render shares a single network call.
export type VersionContext = {
  overrideVersion?: string;
  selectedVersion?: string;
  versionsPromise?: Promise<VersionInfo[]>;
};

let versionStorage: AsyncLocalStorage<VersionContext> | undefined;
let versionStoragePromise:
  Promise<AsyncLocalStorage<VersionContext>> | undefined;

// `AsyncLocalStorage` is Node-only. It's created lazily on the server so this
// module stays evaluable in the client bundle, where `node:async_hooks` is
// externalized for the browser. The lazy path is never triggered on the client.
const getVersionStorage = (): Promise<AsyncLocalStorage<VersionContext>> => {
  if (!versionStoragePromise) {
    versionStoragePromise = import("node:async_hooks").then(
      ({ AsyncLocalStorage }) => {
        versionStorage = new AsyncLocalStorage<VersionContext>();
        return versionStorage;
      },
    );
  }
  return versionStoragePromise;
};

export const getVersionContext = (): VersionContext | undefined =>
  versionStorage?.getStore();

/**
 * A `version` URL parameter is a temporary viewing override from a shared
 * link. It is deliberately independent from the user's saved cookie choice.
 */
export const getVersionOverride = (): string | undefined => {
  if (typeof window === "undefined") return undefined;
  return new URL(window.location.href).searchParams.get("version") || undefined;
};

export const runWithVersionContext = async <T>(
  selection: Pick<VersionContext, "overrideVersion" | "selectedVersion">,
  fn: () => T | Promise<T>,
): Promise<T> => {
  const storage = await getVersionStorage();
  return await storage.run(selection, fn);
};

export type ResolverOptions = {
  /** Fall back to the default version when none is selected. */
  fallback?: boolean;
};

/**
 * Creates a resolver for the viewed version. A URL override wins when valid;
 * an invalid override falls back to the saved selection, then to the default
 * when `fallback` is enabled. The result is memoized per resolver instance;
 * server resolvers in one request share a `/public/versions` fetch.
 */
export const createVersionResolver = (
  fetchVersions: () => Promise<VersionInfo[]>,
  options: ResolverOptions = {},
): (() => Promise<string | undefined>) => {
  const { fallback = false } = options;
  let resolvedVersion: Promise<string | undefined> | undefined;
  return (): Promise<string | undefined> => {
    if (!resolvedVersion) {
      resolvedVersion = (async (): Promise<string | undefined> => {
        const store = getVersionContext();
        let overrideVersion: string | undefined;
        let selectedVersion: string | undefined;
        if (store) {
          overrideVersion = store.overrideVersion;
          selectedVersion = store.selectedVersion;
        } else if (typeof document !== "undefined") {
          overrideVersion = getVersionOverride();
          selectedVersion = getCookie(VERSION_COOKIE_NAME) ?? undefined;
        }

        // Inside a request context, share one fetch across all resolvers;
        // on failure drop the cache so a later resolver can retry.
        const fetchVersionsOnce = (): Promise<VersionInfo[]> => {
          if (!store) return fetchVersions();
          const cached = store.versionsPromise;
          if (cached) return cached;
          const promise = fetchVersions();
          store.versionsPromise = promise;
          promise.catch(() => {
            if (store.versionsPromise === promise) delete store.versionsPromise;
          });
          return promise;
        };

        let versions: VersionInfo[] | undefined;

        if (overrideVersion || selectedVersion) {
          versions = await fetchVersionsOnce();
          if (
            overrideVersion &&
            versions.some((v) => v.name === overrideVersion)
          )
            return overrideVersion;
          if (
            selectedVersion &&
            versions.some((v) => v.name === selectedVersion)
          )
            return selectedVersion;
        }

        if (!fallback) return undefined;

        versions ??= await fetchVersionsOnce();
        return versions.find((v) => v.isDefault)?.name || versions[0]?.name;
      })();
    }
    return resolvedVersion;
  };
};
