import { del } from "@vercel/blob";

const MANAGED_BLOB_HOST_SUFFIX = ".public.blob.vercel-storage.com";

// True only for URLs in our own Blob store — guards against deleting a URL we
// don't own (e.g. an eBay EPS URL on a publication snapshot).
export const isManagedBlobUrl = (url: string): boolean => {
  try {
    return new URL(url).hostname.endsWith(MANAGED_BLOB_HOST_SUFFIX);
  } catch {
    return false;
  }
};

// Best-effort: skips non-managed URLs and never throws, so a cleanup failure
// can't break its caller. Misses are reclaimed by the cron sweep.
export const deleteManagedBlobs = async (urls: string[]): Promise<void> => {
  const managed = urls.filter(isManagedBlobUrl);
  if (managed.length === 0) return;
  try {
    await del(managed);
  } catch {
    // Reclaimed later by the cron sweep.
  }
};
