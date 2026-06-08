// Centralised API endpoint builders. Page/navigation routes live in
// lib/routes.ts — keep the two concerns separate.

export const ebayAccountConnectApiRoute = () => "/api/ebay/accounts/connect";
export const ebayAccountApiRoute = (id: string) => `/api/ebay/accounts/${id}`;
