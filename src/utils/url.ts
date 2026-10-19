import { getEnv } from "./env";
import { type ApiService } from "./constants/api";

export const directusUrl = getEnv("PUBLIC_DIRECTUS_URL");
export const keycloakIssuerUrl = getEnv("KEYCLOAK_ISSUER");
export const apiBaseUrl = getEnv("PUBLIC_APIS_BASE_URL");
export const jbrowseBaseUrl = getEnv("PUBLIC_UI_PAGE_GENOMEBROWSER");
export const publicServerUrl = getEnv("PUBLIC_SERVER");
export const downloadBaseUrl = getEnv("PUBLIC_DOWNLOAD_URL");

const ASSEMBLY_IMAGE_PATH_PREFIX = "public/uploads/";

export const downloadUrl = (path: string): string => {
  const origin = publicServerUrl.replace(/\/+$/, "");
  const download = downloadBaseUrl.startsWith("/")
    ? downloadBaseUrl
    : `/${downloadBaseUrl}`;
  const base = download.endsWith("/") ? download : `${download}/`;
  return `${origin}${base}${path.replace(/^\/+/, "")}`;
};

export const assemblyImageUrl = (
  imagePath?: string | null,
): string | undefined => {
  if (!imagePath) return undefined;
  const normalized = imagePath.replace(/^\/+/, "");
  const rel = normalized.startsWith(ASSEMBLY_IMAGE_PATH_PREFIX)
    ? normalized.slice(ASSEMBLY_IMAGE_PATH_PREFIX.length)
    : normalized;
  return downloadUrl(`emobase-genomics/${rel}`);
};

export const getKeyCloakBaseUrl = (issuerUrl: string) => {
  const ibbIndex = issuerUrl.indexOf("/ibb/keycloak/");
  return ibbIndex !== -1 ? issuerUrl.substring(0, ibbIndex) : "";
};

export const keycloakBaseUrl = getKeyCloakBaseUrl(keycloakIssuerUrl);

/**
 * Resolves base URLs for server-to-server communication within Docker.
 */
export const resolveBaseUrl = (
  type: "directus" | "keycloak" | "api" | "jbrowse",
  service?: ApiService,
): string => {
  const isServer = typeof window === "undefined";
  const isProd = import.meta.env.PROD || process.env.NODE_ENV === "production";
  const isDocker = isProd && getEnv("INTERNAL_API_NETWORKING") === "true";

  if (!isServer || !isDocker)
    return {
      directus: directusUrl,
      keycloak: keycloakBaseUrl,
      api: `${apiBaseUrl}/${service}/v1`,
      jbrowse: jbrowseBaseUrl,
    }[type];

  if (type === "directus") {
    return "http://directus:8055";
  }

  if (type === "keycloak") {
    return `http://keycloak:8080`;
  }

  if (type === "jbrowse") {
    return jbrowseBaseUrl.replace(/^https?:\/\/[^/]+/, "http://nginx:80");
  }

  // Case type == 'api'
  return `http://${service}:8080`;
};
