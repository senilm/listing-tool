import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";

import { auth } from "@/lib/auth/server";
import { loginRoute } from "@/lib/routes";

// Request-deduped session lookup (React cache): calling this in the layout guard
// and again in a page reads Better Auth only once per request.
export const getSession = cache(async () =>
  auth.api.getSession({ headers: await headers() }),
);

// Server-side guard. Redirects to login when there's no session, otherwise
// returns the (non-null) session. The (app) layout calls this to protect every
// authenticated page; pages reuse it to read the current user for free.
export const requireSession = cache(async () => {
  const session = await getSession();
  if (!session) {
    redirect(loginRoute());
  }
  return session;
});
