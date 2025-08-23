// ------------------------
// External imports
// ------------------------
import express, { type Request, Response, NextFunction } from "express";
import cors from "cors";

// ------------------------
// Local imports
// ------------------------
import { registerRoutes } from "./routes.js";   // ✅ added .js
import { setupVite, serveStatic, log } from "./vite.js";  // ✅ added .js

const app = express();

// ------------------------
// CORS setup
// ------------------------
app.use(cors({
  origin: '*', // Allow all origins for testing
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization'],
  credentials: true
}));

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// ------------------------
// Body parsing
// ------------------------
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// ------------------------
// Request logging
// ------------------------
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) logLine = logLine.slice(0, 79) + "…";
      log(logLine);
    }
  });

  next();
});

// ------------------------
// Server setup
// ------------------------
(async () => {
  const server = await registerRoutes(app);

  // Fallback for missing endpoints
  app.use((req, res, next) => {
    if (req.path.startsWith('/upload-') || req.path.startsWith('/api/') || req.path.startsWith('/public-objects/')) {
      console.log(`API route attempt: ${req.method} ${req.path}`);
      if (!res.headersSent) {
        return res.status(404).json({
          error: 'API endpoint not found',
          path: req.path,
          method: req.method
        });
      }
    }
    next();
  });

  // Global error handler
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });

  // Dev vs prod
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // Port
  const port = parseInt(process.env.PORT || "5000", 10);
  server.listen(port, "0.0.0.0", () => {
    log(`Server running on port ${port}`);
  });
})();
