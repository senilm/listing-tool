import { neon } from "@neondatabase/serverless";
import { config } from "dotenv";

// Wipes the entire `public` schema (every table, type, and enum) so the next
// `pnpm db:push` recreates the database from scratch. Destructive by design —
// only meant for dev/test data. Run with: pnpm db:reset --yes
config({ path: ".env.local" });

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("DATABASE_URL is not set — add it to .env.local first.");
  process.exit(1);
}

const host = new URL(connectionString).host;

if (!process.argv.includes("--yes")) {
  console.error(
    [
      `Refusing to wipe ${host} without confirmation.`,
      "This DROPs the entire public schema (all tables + data).",
      "Re-run with --yes if you're sure:",
      "  pnpm db:reset --yes",
    ].join("\n"),
  );
  process.exit(1);
}

const sql = neon(connectionString);

console.log(`Wiping public schema on ${host}...`);
await sql`DROP SCHEMA public CASCADE`;
await sql`CREATE SCHEMA public`;
console.log("Done. Run `pnpm db:push` to recreate the schema.");
