import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

// NeoDemanda frontend build config.
// The dev server proxies /api/** to the Java backend so the browser
// never needs CORS configuration during local development. In
// production, set VITE_API_BASE_URL to the deployed Java API origin
// and the app will call it directly (see src/lib/api.js).
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const target = env.VITE_API_PROXY_TARGET || "http://localhost:8080";

  return {
    plugins: [react()],
    server: {
      port: 5173,
      proxy: {
        "/api": {
          target,
          changeOrigin: true,
        },
      },
    },
  };
});
