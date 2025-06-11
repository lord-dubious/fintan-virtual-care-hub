import express from 'express';
import compression from 'compression';
import helmet from 'helmet';
import path from 'path';
import { fileURLToPath } from 'url';
// __dirname / __filename equivalents in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Determine the correct path to the 'dist' directory, which is two levels up
// from the compiled server file's location (dist-server/server/index.js)
const distDir = path.join(__dirname, '..', '..', 'dist');
// ---------------------------------------------------------------------------
// Express App Setup
// ---------------------------------------------------------------------------
const app = express();
// Standard PORT detection fallback
const PORT = process.env.PORT ? Number.parseInt(process.env.PORT, 10) : 3000;
// ---------------------------------------------------------------------------
// Global Middlewares
// ---------------------------------------------------------------------------
// Compress responses
app.use(compression());
// Add a simple request logger
app.use((req, _res, next) => {
    console.log(`[REQUEST] ${req.method} ${req.originalUrl}`);
    next();
});
// Harden security headers
app.use(helmet({
    // Temporarily disable CSP to debug blank screen issue.
    // If this fixes it, we need to configure the directives properly.
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: false,
    crossOriginEmbedderPolicy: false,
    crossOriginOpenerPolicy: false,
}));
// Serve static assets from Vite build output
app.use(express.static(distDir, {
    maxAge: '1d', // Cache static assets
}));
// ---------------------------------------------------------------------------
// Vite Development Server (middleware mode)
// ---------------------------------------------------------------------------
if (process.env.NODE_ENV !== 'production') {
    /*
     * In development we leverage Vite's dev server in middlewareMode. This allows us
     * to use a single Express instance for both API endpoints and hot-reloading
     * React pages. Vite serves files from memory, so skipping a separate `vite dev`
     * CLI keeps DX tight.
     */
    import('vite').then(async ({ createServer: createViteServer }) => {
        const vite = await createViteServer({
            appType: 'custom', // we are handling HTML ourselves
            server: { middlewareMode: true },
        });
        app.use(vite.middlewares);
        // HTML fallback handled via Vite to inject HMR.
        app.use('*', async (req, res, next) => {
            try {
                const url = req.originalUrl;
                const fs = await import('fs/promises');
                let template = await fs.readFile(path.resolve(process.cwd(), 'index.html'), 'utf-8');
                template = await vite.transformIndexHtml(url, template);
                res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
            }
            catch (err) {
                vite.ssrFixStacktrace(err);
                next(err);
            }
        });
    });
}
else {
    // Production fallback: serve pre-built static assets.
    app.get('*', (req, res) => {
        console.log(`[REQUEST] Fallback for ${req.originalUrl}: sending index.html`);
        res.sendFile(path.join(distDir, 'index.html'));
    });
}
// ---------------------------------------------------------------------------
// Start Server
// ---------------------------------------------------------------------------
app.listen(PORT, () => {
    console.log(`🚀 Express server running on port ${PORT} (${process.env.NODE_ENV ?? 'development'})`);
});
