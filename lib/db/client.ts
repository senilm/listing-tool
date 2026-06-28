import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

import * as auditLogSchema from "@/lib/db/schema/audit-log";
import * as authSchema from "@/lib/db/schema/auth";
import * as ebayAccountSchema from "@/lib/db/schema/ebay-account";
import * as productSchema from "@/lib/db/schema/product";
import * as publicationSchema from "@/lib/db/schema/publication";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    "DATABASE_URL is not set — add it to .env.local (see .env.example).",
  );
}

const sql = neon(connectionString);

export const db = drizzle({
  client: sql,
  schema: {
    ...auditLogSchema,
    ...authSchema,
    ...ebayAccountSchema,
    ...productSchema,
    ...publicationSchema,
  },
});
