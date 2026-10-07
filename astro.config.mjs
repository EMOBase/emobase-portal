// @ts-check
import { defineConfig } from "astro/config";

import tailwindcss from "@tailwindcss/vite";

import react from "@astrojs/react";

import authAstro from "@zitadel/astro-auth";

import node from "@astrojs/node";

// https://astro.build/config
export default defineConfig({
  output: "server",

  adapter: node({
    mode: "standalone",
  }),

  // Auth.js is driven from ./auth.config.mjs; its own endpoints are disabled in
  // favour of src/pages/api/auth/[...auth].ts, which adds the TLS-proxy rewrite
  // and the Keycloak RP-initiated logout.
  integrations: [react(), authAstro({ configFile: "./auth.config.mjs", injectEndpoints: false })],

  // The demo comment about real auth no longer applies — Keycloak handles
  // redirects via OIDC state/PKCE. Origin check stays on unless explicitly
  // opted out for a TLS-terminating proxy, where Astro's check misfires
  // (browser Origin https vs internal http).
  security: {
    checkOrigin: process.env.DISABLE_ORIGIN_CHECK !== "true",
  },

  vite: {
    plugins: [tailwindcss()],
  },
});
