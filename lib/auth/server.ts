import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";

import { db } from "@/lib/db/client";

// Server-side auth instance. Reads BETTER_AUTH_SECRET and BETTER_AUTH_URL from env.
// The auth tables are generated into lib/db/schema.ts in the schema step
// (`pnpm auth:generate`), after which they get wired into the drizzle adapter.
export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: "pg" }),
  emailAndPassword: { enabled: true },
});
