import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Synchronous plugins array — avoids async issues during build
const plugins = [react(), runtimeErrorOverlay()];

// Only include cartographer if running in Replit and not production
if (process.env.NODE_ENV !== "production" && process.env.REPL_ID) {
  import("@replit/vite-plugin-cartographer")
    .then(({ cartographer }) => plugins.push(cartographer()))
    .catch((err) => console.warn("Cartographer plugin failed to load:", err));
}

export default defineConfig({
  plugins,
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "client/src"),
      "@shared": path.resolve(__dirname, "shared"),
      "@assets": path.resolve(__dirname, "attached_assets"),
    },
  },
  root: path.resolve(__dirname, "client"),
  build: {
    outDir: path.resolve(__dirname, "dist/server/public"),
    emptyOutDir: true,
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
});
