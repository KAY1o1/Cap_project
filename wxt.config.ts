import { defineConfig } from "wxt";

export default defineConfig({
  modules: ["@wxt-dev/module-react"],

  manifest: {
    permissions: [
      "identity",
      "storage",
    ],

    host_permissions: [
      "https://*.youtube.com/*",
      "https://*.supabase.co/*",
    ],
  },
});