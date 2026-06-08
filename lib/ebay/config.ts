type EbayEnv = "sandbox" | "production";

const ENV = (process.env.EBAY_ENV ?? "sandbox") as EbayEnv;

const HOSTS = {
  sandbox: {
    api: "https://api.sandbox.ebay.com",
    auth: "https://auth.sandbox.ebay.com",
    web: "https://sandbox.ebay.com",
  },
  production: {
    api: "https://api.ebay.com",
    auth: "https://auth.ebay.com",
    web: "https://www.ebay.com",
  },
} as const;

export const ebayConfig = {
  env: ENV,
  apiBase: HOSTS[ENV].api,
  authBase: HOSTS[ENV].auth,
  webBase: HOSTS[ENV].web,
  clientId: process.env.EBAY_CLIENT_ID ?? "",
  clientSecret: process.env.EBAY_CLIENT_SECRET ?? "",
  ruName: process.env.EBAY_RU_NAME ?? "",
};

// Scope identifiers always use the api.ebay.com literal, even in sandbox.
export const EBAY_SCOPES = [
  "https://api.ebay.com/oauth/api_scope/sell.inventory",
  "https://api.ebay.com/oauth/api_scope/sell.account",
];

// Lets us read the seller's username right after linking.
export const EBAY_IDENTITY_SCOPE =
  "https://api.ebay.com/oauth/api_scope/commerce.identity.readonly";

// Scopes requested at consent time. Broader than EBAY_SCOPES (adds identity) so
// the access token returned by the code exchange can read the username. The
// refresh path keeps the narrower EBAY_SCOPES.
export const EBAY_CONSENT_SCOPES = [...EBAY_SCOPES, EBAY_IDENTITY_SCOPE];
