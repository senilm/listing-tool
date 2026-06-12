// Centralised eBay REST endpoint builders, mirroring lib/api-routes.ts for our
// own API. These are paths relative to the configured eBay base URL — callers
// (ebayRequest, oauth, identity) prefix the right base themselves.

export const ebayInventoryItemRoute = (sku: string) =>
  `/sell/inventory/v1/inventory_item/${sku}`;
export const ebayOffersRoute = () => "/sell/inventory/v1/offer";
export const ebayPublishOfferRoute = (offerId: string) =>
  `/sell/inventory/v1/offer/${offerId}/publish`;

export const ebayLocationsRoute = () => "/sell/inventory/v1/location";
export const ebayLocationRoute = (merchantLocationKey: string) =>
  `/sell/inventory/v1/location/${merchantLocationKey}`;

export const ebayProgramOptInRoute = () => "/sell/account/v1/program/opt_in";
export const ebayPaymentPolicyRoute = () => "/sell/account/v1/payment_policy";
export const ebayReturnPolicyRoute = () => "/sell/account/v1/return_policy";
export const ebayFulfillmentPolicyRoute = () =>
  "/sell/account/v1/fulfillment_policy";

export const ebayIdentityUserRoute = () => "/commerce/identity/v1/user/";

export const ebayOAuthTokenRoute = () => "/identity/v1/oauth2/token";
export const ebayOAuthAuthorizeRoute = () => "/oauth2/authorize";
