import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";

const connectionString =
  process.env.DATABASE_URL ||
  "postgresql://postgres:AsteriskDev2026SecurePass@asterisk-db.reycannavaro.dev:5432/asterisk?sslmode=require";

const maskedUrl = connectionString.replace(/:[^:@]+@/, ":••••••••@");
console.log(`[Asterisk DB Migration] Connecting to target database: ${maskedUrl}`);

const migrationClient = postgres(connectionString, {
  max: 1,
  ssl: connectionString.includes("sslmode=require") ? "require" : undefined,
});

async function runMigrations(): Promise<void> {
  const db = drizzle(migrationClient);
  console.log("[Asterisk DB Migration] Applying Drizzle schema migrations...");

  await migrate(db, { migrationsFolder: "./drizzle" });

  console.log("[Asterisk DB Migration] ✓ All migrations applied successfully!");
  await migrationClient.end();
  process.exit(0);
}

runMigrations().catch(async (error: unknown) => {
  console.error("[Asterisk DB Migration] ✗ Migration execution failed:", error);
  await migrationClient.end();
  process.exit(1);
});
