import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Frontend-only development: no backend/proxy is required.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
  },
});
