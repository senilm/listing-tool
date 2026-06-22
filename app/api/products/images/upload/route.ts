import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse, type NextRequest } from "next/server";

import { withApi } from "@/lib/api/with-api";
import { MAX_IMAGE_BYTES } from "@/validations/product";

const ALLOWED_CONTENT_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/bmp",
  "image/tiff",
];

// Mints client-upload tokens so the browser uploads straight to Blob, bypassing
// Vercel's 4.5 MB request-body limit (hi-res photos exceed it). withApi gates
// this — without auth the store would accept anonymous uploads.
export const POST = withApi(async (request: NextRequest, _context, session) => {
  const body = (await request.json()) as HandleUploadBody;

  const result = await handleUpload({
    request,
    body,
    onBeforeGenerateToken: async () => ({
      allowedContentTypes: ALLOWED_CONTENT_TYPES,
      maximumSizeInBytes: MAX_IMAGE_BYTES,
      addRandomSuffix: true,
      tokenPayload: JSON.stringify({ userId: session.user.id }),
    }),
    // Fired server-to-server by Blob after upload (never on localhost). We
    // persist URLs on form submit, so nothing should depend on this callback.
    onUploadCompleted: async () => {},
  });

  return NextResponse.json(result);
});
