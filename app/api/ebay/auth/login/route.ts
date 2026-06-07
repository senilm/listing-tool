import { redirect } from "next/navigation";

import { buildConsentUrl } from "@/lib/ebay/oauth";

// Visit this in a browser to start the eBay consent flow for a seller account.
export const GET = async () => {
  redirect(buildConsentUrl("poc"));
};
