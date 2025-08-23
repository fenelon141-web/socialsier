import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";
import * as schema from "../shared/schema.js"; // ✅ must include .js in ESM

// Assign WebSocket constructor for Neon
neonConfig.webSocketConstructor = ws;

// Ensure DATABASE_URL exists
if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?"
  );
}

// Create Neon pool
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Initialize Drizzle ORM with schema
export const db = drizzle({
  client: pool,
  schema,
});
