import react from "@vitejs/plugin-react-swc";
import path from "path";
import { defineConfig, type PluginOption } from "vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig(({ mode }) => {
  const plugins: PluginOption[] = [react()];

  // Component tagger is only for development and optional
  if (mode === "development") {
    // Skip lovable-tagger for now to avoid import issues
    console.log("Development mode: component tagging disabled");
  }

  // Add PWA plugin for production builds
  plugins.push(
    VitePWA({
      registerType: "autoUpdate",
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff,woff2}"],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/.*\.onrender\.com\/api\//,
            handler: "NetworkFirst",
            options: {
              cacheName: "api-cache",
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24, // 24 hours
              },
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\//,
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: "google-fonts-stylesheets",
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\//,
            handler: "CacheFirst",
            options: {
              cacheName: "google-fonts-webfonts",
              expiration: {
                maxEntries: 30,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
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
        start_url: "/",
        scope: "/",
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
    })
  );

  return {
    // Development server configuration
    server: {
      host: "0.0.0.0",
      port: parseInt(process.env.VITE_PORT ?? process.env.PORT ?? "10000", 10),
      proxy: {
        "/socket.io": {
          target: process.env.VITE_BACKEND_URL || "http://localhost:3000",
          ws: true,
          changeOrigin: true,
        },
      },
    },

    // Production preview server configuration
    preview: {
      host: "0.0.0.0",
      port: parseInt(process.env.PORT ?? "10000", 10),
    },

    // Build configuration
    build: {
      outDir: "dist",
      sourcemap: mode === "development",
      minify: mode === "production" ? "esbuild" : false,
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ["react", "react-dom"],
            ui: ["@radix-ui/react-dialog", "@radix-ui/react-dropdown-menu"],
          },
        },
      },
    },

    // Plugin configuration
    plugins,

    // Path resolution
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },

    // Test configuration
    test: {
      globals: true,
      environment: "jsdom",
      setupFiles: ["./src/setupTests.ts"],
      css: true,
    },

    // Environment variables
    define: {
      __DEV__: mode === "development",
    },
  };
});
