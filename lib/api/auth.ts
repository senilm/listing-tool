import { type NextRequest } from "next/server";

import { UnauthorizedError } from "@/lib/api/errors";
import { auth } from "@/lib/auth/server";

export type Session = NonNullable<
  Awaited<ReturnType<typeof auth.api.getSession>>
>;

// Session guard for JSON API routes: returns the session, or throws an
// UnauthorizedError for withApi to convert into a 401. Redirect-based routes
// (OAuth flows) should keep their own check.
export const requireSession = async (
  request: NextRequest,
): Promise<Session> => {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) {
    throw new UnauthorizedError();
  }
  return session;
};
