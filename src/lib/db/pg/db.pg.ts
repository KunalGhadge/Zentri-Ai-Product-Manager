import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";

const pool = new pg.Pool({
  connectionString: process.env.POSTGRES_URL,
  max: 10, // Limit connections for Neon/session mode
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

export const pgDb = drizzle(pool);
