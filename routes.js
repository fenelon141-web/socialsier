export async function registerRoutes(app) {
  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", uptime: process.uptime() });
  });

  // Example test route
  app.get("/api/hello", (req, res) => {
    res.json({ message: "Hello from Socialiser-4 backend!" });
  });
}

