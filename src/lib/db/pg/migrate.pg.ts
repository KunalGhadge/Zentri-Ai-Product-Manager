import { migrate } from "drizzle-orm/node-postgres/migrator";
import { join } from "path";
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";

export const runMigrate = async () => {
  console.log("⏳ Running PostgreSQL migrations...");

  const client = new pg.Client({
    connectionString: process.env.POSTGRES_URL,
  });

  try {
    await client.connect();
    const db = drizzle(client);

    const start = Date.now();
    await migrate(db, {
      migrationsFolder: join(process.cwd(), "src/lib/db/migrations/pg"),
    });
    const end = Date.now();

    console.log("✅ PostgreSQL migrations completed in", end - start, "ms");
  } catch (err) {
    console.error(`❌ PostgreSQL migrations failed.`, err);
    throw err;
  } finally {
    await client.end();
  }
};
