import type { AuthUserType } from "./types";
/** When false, pool/head flows should only offer External (non–platform-admin with External session user). */
export function sessionMayPickInternalUserScope(
  isPlatformAdmin: boolean,
  sessionUserType: AuthUserType | undefined,
): boolean {
  return isPlatformAdmin || sessionUserType !== "External";
}
