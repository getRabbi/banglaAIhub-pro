export const ADMIN_SESSION_COOKIE = "bah_admin_session";

export function getAdminSecret() {
  return process.env.ADMIN_SECRET_KEY || process.env.ANALYTICS_SECRET_KEY || "";
}

export async function getAdminSessionToken(secret: string) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(secret));
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}
