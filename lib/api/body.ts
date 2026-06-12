import { type NextRequest, type NextResponse } from "next/server";
import type { ZodType } from "zod";

import { badRequest } from "@/lib/api/responses";

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
    return { data: null, response: badRequest(errorMessage) };
  }
  return { data: parsed.data, response: null };
};
