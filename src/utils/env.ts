const defaultValues: Record<string, string> = {
  PUBLIC_APIS_BASE_URL: "/ibb/api",
  PUBLIC_DOWNLOAD_URL: "/download/",

  PUBLIC_UI_PAGE_GENOMEBROWSER: "/ibb/jbrowse2/",
  PUBLIC_UI_PAGE_ONTOSCOPE: "/ibb/ontoscope",
  PUBLIC_UI_PAGE_BLAST: "/ibb/blast/",
  PUBLIC_UI_PAGE_API_DOC: "/ibb/swagger-ui/",

  AUTH_TRUST_HOST: "true",

  KEYCLOAK_ISSUER: "/ibb/keycloak/realms/ibb",
  KEYCLOAK_CLIENT_ID: "ibb-client",

  PUBLIC_DIRECTUS_URL: "/ibb/directus",
};

/**
 * Utility to access environment variables consistently on both server and client side.
 * In SSR mode, it supports reading variables injected into window.__ENV__ at runtime.
 */
export const getEnv = (key: string): string => {
  try {
    if (typeof window !== "undefined") {
      // Client-side: try runtime-injected env first, then fall back to build-time env
      return (
        (window as any).__ENV__?.[key] ||
        (import.meta.env as any)?.[key] ||
        defaultValues[key] ||
        ""
      );
    }

    // Server-side: Use process.env for reliable runtime access with dynamic keys.
    // We also check import.meta.env as a fallback for Astro-specific behavior.
    const processEnv = typeof process !== "undefined" ? process.env : {};
    return (processEnv?.[key] ||
      (import.meta.env as any)?.[key] ||
      defaultValues[key] ||
      "") as string;
  } catch (err) {
    console.error(`[getEnv Error] Failed to get key ${key}:`, err);
    return "";
  }
};
