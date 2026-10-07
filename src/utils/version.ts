import type { AsyncLocalStorage } from "node:async_hooks";

import { VERSION_COOKIE_NAME, getCookie } from "@/utils/cookie";

export type VersionInfo = { name: string; isDefault?: boolean };

// The `versionsPromise` is a per-request cache of the public versions fetch,
// so every resolver created during one SSR render shares a single network call.
export type VersionContext = {
  version?: string;
  versionsPromise?: Promise<VersionInfo[]>;
};

let versionStorage: AsyncLocalStorage<VersionContext> | undefined;
let versionStoragePromise: Promise<AsyncLocalStorage<VersionContext>> | undefined;

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

export const runWithVersionContext = async <T>(
  version: string | undefined,
  fn: () => T | Promise<T>,
): Promise<T> => {
  const storage = await getVersionStorage();
  return await storage.run({ version }, fn);
};

export type ResolverOptions = {
  /** Fall back to the default version when none is selected. */
  fallback?: boolean;
};

/**
 * Creates a version resolver that returns the currently selected version
 * (from the SSR-injected cookie context on the server, or `emobase-version`
 * cookie on the client), validated against the given versions list. When
 * `fallback` is set, an unset or invalid selection resolves to the default
 * version instead of `undefined`. The result is memoized per resolver
 * instance; on the server, resolvers in the same request share one
 * `/public/versions` fetch via the request context.
 */
export const createVersionResolver =
  (
    fetchVersions: () => Promise<VersionInfo[]>,
    options: ResolverOptions = {},
  ): (() => Promise<string | undefined>) => {
    const { fallback = false } = options;
    let resolvedVersion: Promise<string | undefined> | undefined;
    return (): Promise<string | undefined> => {
      if (!resolvedVersion) {
        resolvedVersion = (async (): Promise<string | undefined> => {
          const store = getVersionContext();
          let cookieVersion: string | undefined;
          if (store) {
            cookieVersion = store.version;
          } else if (typeof document !== "undefined") {
            cookieVersion = getCookie(VERSION_COOKIE_NAME) ?? undefined;
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
              if (store.versionsPromise === promise)
                delete store.versionsPromise;
            });
            return promise;
          };

          let versions: VersionInfo[] | undefined;

          if (cookieVersion) {
            versions = await fetchVersionsOnce();
            if (versions.find((v) => v.name === cookieVersion))
              return cookieVersion;
          }

          if (!fallback) return undefined;

          versions ??= await fetchVersionsOnce();
          return versions.find((v) => v.isDefault)?.name || versions[0]?.name;
        })();
      }
      return resolvedVersion;
    };
  };