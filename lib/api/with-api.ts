import { type NextRequest, NextResponse } from "next/server";

import { requireSession, type Session } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/errors";

type Handler<T> = (
  request: NextRequest,
  context: T,
  session: Session,
) => Promise<Response>;

// Wraps a JSON route handler: runs auth, passes the session through, and
// converts thrown ApiErrors into their status + JSON. Anything else becomes a
// generic 500.
export const withApi =
  <T>(handler: Handler<T>) =>
  async (request: NextRequest, context: T) => {
    try {
      const session = await requireSession(request);
      return await handler(request, context, session);
    } catch (error) {
      if (error instanceof ApiError) {
        return NextResponse.json(
          { error: error.message },
          { status: error.status },
        );
      }
      return NextResponse.json(
        { error: "Internal Server Error" },
        { status: 500 },
      );
    }
  };
