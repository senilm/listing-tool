// Centralised API endpoint builders. Page/navigation routes live in
// lib/routes.ts — keep the two concerns separate.

export const ebayAccountsApiRoute = () => "/api/ebay/accounts";
export const ebayAccountConnectApiRoute = () => "/api/ebay/accounts/connect";
export const ebayAccountApiRoute = (id: string) => `/api/ebay/accounts/${id}`;
export const ebayAccountListingOptionsApiRoute = (id: string) =>
  `/api/ebay/accounts/${id}/listing-options`;
export const ebayAccountTestPoliciesApiRoute = (id: string) =>
  `/api/ebay/accounts/${id}/test-policies`;

export const productsApiRoute = () => "/api/products";
export const productApiRoute = (id: string) => `/api/products/${id}`;

export const publicationsApiRoute = () => "/api/publications";

export const searchApiRoute = () => "/api/search";
