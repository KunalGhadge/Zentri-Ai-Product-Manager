import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";

const pool = new pg.Pool({
  connectionString: process.env.POSTGRES_URL,
  max: 1, // Crucial for Vercel serverless: each instance gets its own pool
  // Close idle connections almost immediately so long-running AI streams (like Web Search)
  // don't hold the DB connection open and exhaust the Neon/Supabase pool limit.
  idleTimeoutMillis: 100,
  connectionTimeoutMillis: 10000,
  allowExitOnIdle: true,
});

export const pgDb = drizzle(pool);
