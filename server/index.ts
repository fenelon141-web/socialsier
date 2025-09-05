// ------------------------
// External imports
// ------------------------
import 'dotenv/config'; // <-- ensures .env variables are loaded
import express, { type Request, Response, NextFunction } from "express";
import cors from "cors";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// ------------------------
// Supabase setup
// ------------------------
const SUPABASE_URL = process.env.SUPABASE_URL || "https://pjociaiucneerhcsqduy.supabase.co";
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_ANON_KEY) {
  throw new Error("SUPABASE_ANON_KEY is missing in your environment variables");
}

export const supabase: SupabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ------------------------
// Express setup
// ------------------------
const app = express();
const port = parseInt(process.env.PORT || "3000", 10); // Fly.io expects 3000

// ------------------------
// Middleware
// ------------------------
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Origin", "X-Requested-With", "Content-Type", "Accept", "Authorization"],
  credentials: true
}));

// Simple CORS handling for OPTIONS
app.use((req, res, next) => {
  if (req.method === "OPTIONS") return res.sendStatus(200);
  next();
});

// Request logging
app.use((req, _res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// ------------------------
// Health check
// ------------------------
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: Date.now() });
});

// ------------------------
// Supabase auth endpoints
// ------------------------
app.post("/api/signup", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
    res.json(data);
  } catch (err) {
    next(err);
  }
});

app.post("/api/login", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    res.json(data);
  } catch (err) {
    next(err);
  }
});

// ------------------------
// Global error handler
// ------------------------
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  res.status(status).json({ message });
  console.error(err);
});

// ------------------------
// Start server
// ------------------------
app.listen(port, "0.0.0.0", () => {
  console.log(`Backend running on port ${port}`);
});
