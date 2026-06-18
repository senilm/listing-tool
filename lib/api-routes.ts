// Centralised API endpoint builders. Page/navigation routes live in
// lib/routes.ts — keep the two concerns separate.

export const ebayAccountsApiRoute = () => "/api/ebay/accounts";
export const ebayAccountsExportApiRoute = () => "/api/ebay/accounts/export";
export const ebayAccountConnectApiRoute = () => "/api/ebay/accounts/connect";
export const ebayAccountApiRoute = (id: string) => `/api/ebay/accounts/${id}`;
export const ebayAccountListingOptionsApiRoute = (id: string) =>
  `/api/ebay/accounts/${id}/listing-options`;
export const ebayAccountTestPoliciesApiRoute = (id: string) =>
  `/api/ebay/accounts/${id}/test-policies`;

export const productsApiRoute = () => "/api/products";
export const productsExportApiRoute = () => "/api/products/export";
export const productApiRoute = (id: string) => `/api/products/${id}`;

export const publicationsApiRoute = () => "/api/publications";
export const publicationsExportApiRoute = () => "/api/publications/export";

export const searchApiRoute = () => "/api/search";

export const dashboardStatsApiRoute = () => "/api/dashboard/stats";
