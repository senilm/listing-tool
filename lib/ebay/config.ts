type EbayEnv = "sandbox" | "production";

const ENV = (process.env.EBAY_ENV ?? "sandbox") as EbayEnv;

const HOSTS = {
  sandbox: {
    api: "https://api.sandbox.ebay.com",
    identity: "https://apiz.sandbox.ebay.com",
    auth: "https://auth.sandbox.ebay.com",
    web: "https://sandbox.ebay.com",
    media: "https://apim.sandbox.ebay.com",
  },
  production: {
    api: "https://api.ebay.com",
    identity: "https://apiz.ebay.com",
    auth: "https://auth.ebay.com",
    web: "https://www.ebay.com",
    media: "https://apim.ebay.com",
  },
} as const;

export const ebayConfig = {
  env: ENV,
  apiBase: HOSTS[ENV].api,
  identityBase: HOSTS[ENV].identity,
  authBase: HOSTS[ENV].auth,
  webBase: HOSTS[ENV].web,
  mediaBase: HOSTS[ENV].media,
  clientId: process.env.EBAY_CLIENT_ID ?? "",
  clientSecret: process.env.EBAY_CLIENT_SECRET ?? "",
  ruName: process.env.EBAY_RU_NAME ?? "",
  deletionVerificationToken: process.env.EBAY_DELETION_VERIFICATION_TOKEN ?? "",
  deletionEndpointUrl: process.env.EBAY_DELETION_ENDPOINT_URL ?? "",
};

// Scope identifiers always use the api.ebay.com literal, even in sandbox.
export const EBAY_SCOPES = [
  "https://api.ebay.com/oauth/api_scope/sell.inventory",
  "https://api.ebay.com/oauth/api_scope/sell.account",
];

// Lets us read the seller's immutable user ID right after linking (our dedup
// key). Requested only at consent time; the refresh path keeps EBAY_SCOPES.
export const EBAY_IDENTITY_SCOPE =
  "https://api.ebay.com/oauth/api_scope/commerce.identity.readonly";

export const EBAY_CONSENT_SCOPES = [...EBAY_SCOPES, EBAY_IDENTITY_SCOPE];
