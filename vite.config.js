import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"

export default defineConfig({
  plugins: [react()],
  server: {
    // In development the API runs in `wrangler dev` on :8787.
    proxy: { "/api": "http://localhost:8787" },
  },
  // Never inline assets as data: URIs — the Content-Security-Policy only allows same-origin fonts.
  build: { sourcemap: false, assetsInlineLimit: 0 },
  test: {
    environment: "jsdom",
    setupFiles: ["./test/setup.js"],
    include: ["test/**/*.test.{js,jsx}"],
    testTimeout: 20_000,
  },
})
