import { type NextRequest, NextResponse } from "next/server";

import { auth } from "@/lib/auth/server";

type Session = NonNullable<Awaited<ReturnType<typeof auth.api.getSession>>>;

type RequireSessionResult =
  | { session: Session; response: null }
  | { session: null; response: NextResponse };

// Session guard for JSON API routes: returns the session, or a ready-made 401
// response for the handler to return. Redirect-based routes (OAuth flows)
// should keep their own check.
export const requireSession = async (
  request: NextRequest,
): Promise<RequireSessionResult> => {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) {
    return {
      session: null,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }
  return { session, response: null };
};
