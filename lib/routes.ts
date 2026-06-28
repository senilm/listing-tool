// Centralised route builders. Keep paths here so the sidebar, breadcrumb, and
// header search all agree on the canonical URL for each module.

export const homeRoute = () => "/";

export const loginRoute = () => "/login";
export const registerRoute = () => "/register";

export const dashboardRoute = () => "/dashboard";

export const productsRoute = () => "/products";
export const productCreateRoute = (fromId?: string) =>
  fromId ? `/products/create?from=${fromId}` : "/products/create";
export const productDetailRoute = (id: string) => `/products/${id}`;

export const ebayAccountsRoute = () => "/ebay-accounts";
export const ebayAccountDetailRoute = (id: string) => `/ebay-accounts/${id}`;

export const publicationsRoute = () => "/publications";

export const settingsRoute = () => "/settings";

export const privacyPolicyRoute = () => "/privacy-policy";
