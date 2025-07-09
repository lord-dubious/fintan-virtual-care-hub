// Environment configuration
export const config = {
  app: {
    environment: import.meta.env.MODE || "development",
    name: "Dr. Fintan Virtual Care Hub",
    version: "1.0.0",
  },
  api: {
    baseUrl: (() => {
      // HIGHEST PRIORITY: Full URL override
      if (import.meta.env.VITE_BACKEND_URL) {
        return `${import.meta.env.VITE_BACKEND_URL}/api`;
      }

      // SECOND PRIORITY: Host + Port configuration
      if (import.meta.env.VITE_BACKEND_HOST) {
        const host = import.meta.env.VITE_BACKEND_HOST;
        const port = import.meta.env.VITE_BACKEND_PORT || "3000";
        const protocol =
          host.includes("localhost") ||
          host.includes("127.0.0.1") ||
          /^\d+\.\d+\.\d+\.\d+$/.test(host)
            ? "http"
            : "https";

        if (host.startsWith("http")) {
          return `${host}/api`;
        }

        if (
          host.includes("localhost") ||
          host.includes("127.0.0.1") ||
          /^\d+\.\d+\.\d+\.\d+$/.test(host)
        ) {
          return `${protocol}://${host}:${port}/api`;
        }

        return `${protocol}://${host}/api`;
      }

      // Auto-detect from current window location
      if (typeof window !== "undefined") {
        const currentHost = window.location.hostname;
        const currentProtocol = window.location.protocol;

        if (
          currentHost.includes("localhost") ||
          currentHost.includes("127.0.0.1") ||
          /^\d+\.\d+\.\d+\.\d+$/.test(currentHost)
        ) {
          return `${currentProtocol}//${currentHost}:3000/api`;
        }

        return `${currentProtocol}//${currentHost}/api`;
      }

      return import.meta.env.VITE_BACKEND_URL
        ? `${import.meta.env.VITE_BACKEND_URL}/api`
        : "http://0.0.0.0:3000/api";
    })(),
    timeout: 30000,
  },
  features: {
    videoCalls: import.meta.env.VITE_ENABLE_VIDEO_CALLS === "true",
    audioCalls: import.meta.env.VITE_ENABLE_AUDIO_CALLS === "true",
    payments: import.meta.env.VITE_ENABLE_PAYMENTS === "true",
  },
  daily: {
    domain: import.meta.env.VITE_DAILY_DOMAIN || "",
  },
  stripe: {
    publishableKey: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || "",
  },
} as const;
