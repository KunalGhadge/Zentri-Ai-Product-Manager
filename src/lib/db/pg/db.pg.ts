import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";

const pool = new pg.Pool({
  connectionString: process.env.POSTGRES_URL,
  max: 1, // Crucial for Vercel serverless: each instance gets its own pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

export const pgDb = drizzle(pool);
