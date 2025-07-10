import { defineConfig, type PluginOption } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(async ({ mode }) => {
	const plugins: PluginOption[] = [react()];

	if (mode === 'development') {
		try {
			const { componentTagger } = await import('lovable-tagger');
			plugins.push(componentTagger());
		} catch {
			console.warn('lovable-tagger not installed; skipping component tagging');
		}
	}

	plugins.push(
		VitePWA({
			registerType: 'autoUpdate',
			workbox: {
				globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
				runtimeCaching: [
					{
						urlPattern: /^https:\/\/api\./,
						handler: 'NetworkFirst',
						options: {
							cacheName: 'api-cache',
							expiration: {
								maxEntries: 100,
								maxAgeSeconds: 60 * 60 * 24,
							},
						},
					},
				],
			},
			manifest: {
				name: 'Dr. Fintan Virtual Care Hub',
				short_name: 'Dr. Fintan',
				description: 'Professional virtual healthcare consultations',
				theme_color: '#1A5F7A',
				background_color: '#ffffff',
				display: 'standalone',
				icons: [
					{ src: 'icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
					{ src: 'icons/icon-512x512.png', sizes: '512x512', type: 'image/png' },
				],
			},
		})
	);

	return {
		server: {
			host: '0.0.0.0',
			port: parseInt(process.env.VITE_PORT ?? process.env.PORT ?? '10000', 10),
		},
		plugins,
		resolve: {
			alias: {
				'@': path.resolve(__dirname, './src'),
			},
		},
		test: {
			globals: true,
			environment: 'jsdom',
			setupFiles: ['./src/setupTests.ts'],
			css: true,
		},
	};
});

  server: {
    host: "0.0.0.0",
    port: parseInt(process.env.VITE_PORT || process.env.PORT || '10000', 10),
  },
  const plugins = [react()];
    if (mode === 'development') {
      try {
        const { componentTagger } = await import('lovable-tagger');
        plugins.push(componentTagger());
      } catch {
        console.warn('lovable-tagger not installed; skipping component tagging');
      }
    }
    plugins.push(
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\./,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24, // 24 hours
              },
            },
          },
        ],
      },
      manifest: {
        name: 'Dr. Fintan Virtual Care Hub',
        short_name: 'Dr. Fintan',
        description: 'Professional virtual healthcare consultations',
        theme_color: '#1A5F7A',
        background_color: '#ffffff',
        display: 'standalone',
        icons: [
          {
            src: 'icons/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
    }),
  ]    );
  return {
  server: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/setupTests.ts'],
    css: true,
  },
};

