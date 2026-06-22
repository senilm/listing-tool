import { ebayConfig } from "@/lib/ebay/config";

// eBay Commerce Media API: createImageFromUrl tells eBay to fetch a public image
// and stage its own EPS copy; getImage returns the EPS URL. Uses the
// sell.inventory scope we already hold — no extra consent.
const CREATE_IMAGE_FROM_URL_ROUTE =
  "/commerce/media/v1_beta/image/create_image_from_url";

type GetImageResponse = { imageUrl?: string; expirationDate?: string };

// eBay ingests the image asynchronously, so getImage can return before imageUrl
// is ready (likelier for large photos). Poll with backoff before giving up.
const GET_IMAGE_MAX_ATTEMPTS = 5;
const GET_IMAGE_BASE_DELAY_MS = 500;

const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

// Returns the getImage URI from the Location header (a 201 with no body is the
// success signal).
const createEbayImageFromUrl = async (
  accessToken: string,
  imageUrl: string,
): Promise<string> => {
  const res = await fetch(
    `${ebayConfig.mediaBase}${CREATE_IMAGE_FROM_URL_ROUTE}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ imageUrl }),
    },
  );
  if (!res.ok) {
    throw new Error(
      `eBay createImageFromUrl failed: ${res.status} ${await res.text()}`,
    );
  }
  const location = res.headers.get("location");
  if (!location) {
    throw new Error("eBay createImageFromUrl returned no Location header");
  }
  return location;
};

const getEbayImageUrl = async (
  accessToken: string,
  getImageUri: string,
): Promise<string> => {
  let lastError = "eBay getImage returned no imageUrl";

  for (let attempt = 0; attempt < GET_IMAGE_MAX_ATTEMPTS; attempt++) {
    if (attempt > 0) {
      await sleep(GET_IMAGE_BASE_DELAY_MS * 2 ** (attempt - 1));
    }

    const res = await fetch(getImageUri, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
      },
    });

    // Non-OK can mean "not ready yet" — keep polling; surface the last status
    // only if every attempt fails.
    if (!res.ok) {
      lastError = `eBay getImage failed: ${res.status} ${await res.text()}`;
      continue;
    }

    const data = (await res.json()) as GetImageResponse;
    if (data.imageUrl) return data.imageUrl;
  }

  throw new Error(lastError);
};

// Re-hosts each image onto this account's EPS, preserving order (first =
// gallery image). Run per account so every account gets its own eBay-hosted
// copy — accounts never share an image URL, which keeps them unlinked.
export const uploadImagesToEps = async (
  accessToken: string,
  sourceUrls: string[],
): Promise<string[]> => {
  const epsUrls: string[] = [];
  for (const sourceUrl of sourceUrls) {
    const getImageUri = await createEbayImageFromUrl(accessToken, sourceUrl);
    epsUrls.push(await getEbayImageUrl(accessToken, getImageUri));
  }
  return epsUrls;
};
