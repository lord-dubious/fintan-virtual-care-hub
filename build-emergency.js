const { build } = require('vite');

async function buildApp() {
  try {
    console.log('Building with Vite (skipping TypeScript checks)...');
    await build({
      build: {
        outDir: 'dist',
        emptyOutDir: true,
      },
      esbuild: {
        target: 'es2020',
        format: 'esm',
      },
    });
    console.log('Build completed successfully!');
  } catch (error) {
    console.error('Build failed:', error);
    process.exit(1);
  }
}

buildApp();
