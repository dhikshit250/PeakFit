/** Default destination after sign-in when no safe `redirect_url` is present. */
export const POST_AUTH_DEFAULT = "/dashboard";

const AUTH_PATH_PREFIXES = ["/sign-in", "/sign-up"] as const;

/** Relative in-app paths only — blocks open redirects and auth loops. */
export function isSafeRelativeRedirect(url: string | null | undefined): url is string {
  if (!url || typeof url !== "string") return false;
  const path = url.split("?")[0] ?? url;
  if (!path.startsWith("/") || path.startsWith("//")) return false;
  if (AUTH_PATH_PREFIXES.some((prefix) => path === prefix || path.startsWith(`${prefix}/`))) return false;
  return true;
}

export function sanitizeRedirectUrl(
  url: string | null | undefined,
  fallback: string = POST_AUTH_DEFAULT,
): string {
  return isSafeRelativeRedirect(url) ? url : fallback;
}