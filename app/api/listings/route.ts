import { type NextRequest } from "next/server";

import { publishListing, type ListingInput } from "@/lib/ebay/listing";

// POST a listing to the connected eBay account. An empty body publishes a
// sample jewellery listing; send a JSON body to override any field.
export const POST = async (request: NextRequest) => {
  let input: ListingInput = {};
  try {
    const text = await request.text();
    if (text) input = JSON.parse(text) as ListingInput;
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  try {
    const result = await publishListing(input);
    return Response.json(result);
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Listing failed" },
      { status: 500 },
    );
  }
};
