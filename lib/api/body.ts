import { type NextRequest, NextResponse } from "next/server";
import type { ZodType } from "zod";

type ParseBodyResult<T> =
  | { data: T; response: null }
  | { data: null; response: NextResponse };

// Reads and validates the JSON body: returns the parsed data, or a ready-made
// 400 response carrying errorMessage for the handler to return.
export const parseBody = async <T>(
  request: NextRequest,
  schema: ZodType<T>,
  errorMessage: string,
): Promise<ParseBodyResult<T>> => {
  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return {
      data: null,
      response: NextResponse.json({ error: errorMessage }, { status: 400 }),
    };
  }
  return { data: parsed.data, response: null };
};
