// @ts-check
import { defineConfig } from "astro/config";

import tailwindcss from "@tailwindcss/vite";

import react from "@astrojs/react";

import node from "@astrojs/node";

// https://astro.build/config
export default defineConfig({
  output: "server",

  adapter: node({
    mode: "standalone",
  }),

  // TODO: Revisit when adopting real auth (Keycloak). The demo disables the
  // origin check via DISABLE_ORIGIN_CHECK because Astro's CSRF check misfires
  // behind Render's TLS-terminating proxy (browser Origin https vs internal
  // http). Prod/Keycloak deploys get protection by default unless the env var
  // is explicitly set — with real auth the action endpoints become stateful,
  // so rely on the OIDC state/PKCE protection rather than disabling this.
  security: {
    checkOrigin: process.env.DISABLE_ORIGIN_CHECK !== "true",
  },

  vite: {
    plugins: [tailwindcss()],
  },

  integrations: [react()],
});
