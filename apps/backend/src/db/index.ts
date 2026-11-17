import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/asterisk";

const isAwsRds = connectionString.includes("rds.amazonaws.com") || connectionString.includes("sslmode=require");

export const client = postgres(connectionString, {
  max: 10,
  idle_timeout: 20,
  connect_timeout: 15,
  ssl: isAwsRds ? "require" : undefined,
});

export const db = drizzle(client, { schema });
