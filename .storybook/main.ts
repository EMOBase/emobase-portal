import { fileURLToPath } from "node:url";

import tailwindcss from "@tailwindcss/vite";
import type { StorybookConfig } from "@storybook/react-vite";

const config: StorybookConfig = {
  stories: ["../src/**/*.stories.@(ts|tsx)"],
  framework: {
    name: "@storybook/react-vite",
    options: {},
  },
  viteFinal: async (viteConfig) => {
    viteConfig.plugins = [...(viteConfig.plugins ?? []), tailwindcss()];
    viteConfig.resolve = {
      ...viteConfig.resolve,
      alias: {
        ...(viteConfig.resolve?.alias as Record<string, string> | undefined),
        // Mirror the `@/*` -> `src/*` alias from tsconfig.json / astro.config.
        "@": fileURLToPath(new URL("../src", import.meta.url)),
      },
      // Keep a single copy of React across the preview and optimized deps.
      dedupe: [
        ...((viteConfig.resolve?.dedupe as string[] | undefined) ?? []),
        "react",
        "react-dom",
        "react/jsx-runtime",
      ],
    };
    // Vite 8's Rolldown dep optimizer does not pre-bundle bare `react` for
    // Storybook's own (non-optimized) browser chunks, so `import React from
    // "react"` fell back to the raw CJS file and failed ("does not provide an
    // export named 'default'"). Forcing explicit entries fixes the interop.
    // See vitejs/vite#23030.
    viteConfig.optimizeDeps = {
      ...viteConfig.optimizeDeps,
      include: [
        ...(viteConfig.optimizeDeps?.include ?? []),
        "react",
        "react-dom",
        "react-dom/client",
        "react/jsx-runtime",
        "react/jsx-dev-runtime",
      ],
    };
    return viteConfig;
  },
};

export default config;
