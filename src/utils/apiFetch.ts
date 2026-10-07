import qs from "qs";

import { API_SERVICE_ENVS, type ApiService } from "./constants/api";

import { apiBaseUrl, resolveBaseUrl } from "./url";
import { getEnv } from "./env";

export const apiFetch = async <T>(
  service: ApiService,
  request: string,
  opts?: Omit<RequestInit, "headers" | "body"> & {
    responseType?: "json" | "text" | "blob" | "formData" | "arrayBuffer";
    body?: any;
    query?: Record<string, string | string[] | null | undefined>;
    authorization?: string;
  },
) => {
  const isServer = typeof window === "undefined";

  try {
    const {
      responseType,
      body: bodyOpt,
      query,
      authorization = "",
      ...restOpts
    } = opts ?? {};

    const baseURL = getApiBaseUrl(service);
    // Ensure no double slashes when joining baseURL and request
    const sanitizedBaseURL = baseURL.endsWith("/")
      ? baseURL.slice(0, -1)
      : baseURL;
    const sanitizedRequest = request.startsWith("/") ? request : `/${request}`;

    const url =
      sanitizedBaseURL +
      sanitizedRequest +
      (query ? `?${qs.stringify(query, { arrayFormat: "repeat" })}` : "");

    const [headers, body] = !bodyOpt
      ? [null, null]
      : bodyOpt instanceof FormData
        ? [null, bodyOpt]
        : [
            {
              "Content-Type": "application/json",
            },
            JSON.stringify(bodyOpt),
          ];

    const response = await fetch(url, {
      headers: {
        ...headers,
        Authorization: authorization,
      },
      body,
      ...restOpts,
    });

    if (!response.ok) {
      const errorText = await response.text();
      if (isServer) {
        console.error(
          `[Server Fetch Error] ${response.status} ${url}: ${errorText}`,
        );
      }
      throw new Error(`API ${response.status} on ${url}: ${errorText}`);
    }

    if (responseType) return response[responseType]() as T;

    const contentType = response.headers.get("Content-Type") ?? "";
    if (contentType.includes("application/json")) {
      return response.json() as T;
    } else if (contentType.includes("image/")) {
      return response.blob() as T;
    } else {
      return response.text() as T;
    }
  } catch (err: any) {
    if (isServer) {
      console.error(
        `[Server Fetch Exception] Service: ${service}: ${err.message || err}`,
      );
    }
    throw err;
  }
};

const getServiceEnvOverride = (service: ApiService) =>
  getEnv(API_SERVICE_ENVS[service]);

export const getApiBaseUrl = (service: ApiService) =>
  getServiceEnvOverride(service) || resolveBaseUrl("api", service);

export const getPublicApiBaseUrl = (service: ApiService) =>
  getServiceEnvOverride(service) || `${apiBaseUrl}/${service}/v1`;
