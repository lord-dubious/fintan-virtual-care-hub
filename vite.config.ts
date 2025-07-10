import react from "@vitejs/plugin-react-swc";
import path from "path";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

// Conditional import for lovable-tagger (only in development)
let componentTagger: (() => any) | null = null;
try {
  if (process.env.NODE_ENV !== "production") {
    componentTagger = require("lovable-tagger").componentTagger;
  }
} catch {
  // lovable-tagger not available, skip it
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "0.0.0.0",
    port: parseInt(process.env.VITE_PORT || process.env.PORT || "10000", 10),
    allowedHosts: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      }
    }
  },
  preview: {
    host: "0.0.0.0",
    port: parseInt(process.env.PORT || "10000", 10),
    allowedHosts: true,
  },
  plugins: [
    react(),
    mode === "development" && componentTagger && componentTagger(),
    VitePWA({
      registerType: "autoUpdate",
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg}"],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\./,
            handler: "NetworkFirst",
            options: {
              cacheName: "api-cache",
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24, // 24 hours
              },
            },
          },
        ],
      },
      manifest: {
        name: "Dr. Fintan Virtual Care Hub",
        short_name: "Dr. Fintan",
        description: "Professional virtual healthcare consultations",
        theme_color: "#1A5F7A",
        background_color: "#ffffff",
        display: "standalone",
        icons: [
          {
            src: "icons/icon-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "icons/icon-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
        ],
      },
    }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/setupTests.ts"],
    css: true,
  },
}));
