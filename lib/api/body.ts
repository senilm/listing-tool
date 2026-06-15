import { type NextRequest } from "next/server";
import type { ZodType } from "zod";

import { BadRequestError } from "@/lib/api/errors";

// Reads and validates the JSON body: returns the parsed data, or throws a
// BadRequestError (carrying errorMessage) for withApi to convert into a 400.
export const parseBody = async <T>(
  request: NextRequest,
  schema: ZodType<T>,
  errorMessage: string,
): Promise<T> => {
  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    throw new BadRequestError(errorMessage);
  }
  return parsed.data;
};
