import { del, list } from "@vercel/blob";
import { NextResponse, type NextRequest } from "next/server";

import { db } from "@/lib/db/client";
import { product } from "@/lib/db/schema/product";
import { publication } from "@/lib/db/schema/publication";

// Blobs younger than this are spared even when unreferenced, so a just-uploaded
// image whose form isn't submitted yet survives — lets us skip a "pending
// uploads" table.
const GRACE_PERIOD_MS = 24 * 60 * 60 * 1000;
const LIST_PAGE_SIZE = 1000;

// Scopes the sweep to the uploader's prefix, so other blobs sharing this store
// are never deletion candidates.
const PRODUCT_IMAGE_PREFIX = "products/";

// Daily orphan sweep (vercel.json): deletes blobs no product or publication
// references that are older than the grace period. Auth'd by the CRON_SECRET
// bearer Vercel Cron sends.
export const GET = async (request: NextRequest): Promise<NextResponse> => {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [products, publications] = await Promise.all([
    db.select({ images: product.images }).from(product),
    db.select({ images: publication.images }).from(publication),
  ]);

  const referenced = new Set<string>();
  for (const row of [...products, ...publications]) {
    for (const url of row.images ?? []) referenced.add(url);
  }

  const cutoff = Date.now() - GRACE_PERIOD_MS;
  const orphans: string[] = [];
  let cursor: string | undefined;
  do {
    const page = await list({
      cursor,
      limit: LIST_PAGE_SIZE,
      prefix: PRODUCT_IMAGE_PREFIX,
    });
    for (const blob of page.blobs) {
      if (!referenced.has(blob.url) && blob.uploadedAt.getTime() < cutoff) {
        orphans.push(blob.url);
      }
    }
    cursor = page.cursor;
  } while (cursor);

  if (orphans.length > 0) await del(orphans);

  return NextResponse.json({ deleted: orphans.length });
};
