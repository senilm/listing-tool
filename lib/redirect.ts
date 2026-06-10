// The query param carrying the post-login destination, e.g.
// /login?redirect=/products.
export const REDIRECT_PARAM = "redirect";

// Only allow root-relative internal paths. Rejects absolute URLs and
// protocol-relative ("//evil.com", "/\\evil.com") values to prevent open
// redirects.
export const getSafeRedirectPath = (
  path: string | null | undefined,
): string | null => {
  if (!path?.startsWith("/")) return null;
  if (path[1] === "/" || path[1] === "\\") return null;
  return path;
};

// Appends a safe `redirect` param to a path; returns the path unchanged when
// there is no valid destination to preserve.
export const withRedirectParam = (
  path: string,
  redirect: string | null | undefined,
): string => {
  const safe = getSafeRedirectPath(redirect);
  if (!safe) return path;
  const params = new URLSearchParams({ [REDIRECT_PARAM]: safe });
  return `${path}?${params.toString()}`;
};
