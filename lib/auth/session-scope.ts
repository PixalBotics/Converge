import type { AuthUserType } from "./types";

/** When false, pool/head flows should only offer External (non–platform-admin with External session user). */
export function sessionMayPickInternalUserScope(
  isPlatformAdmin: boolean,
  sessionUserType: AuthUserType | undefined,
): boolean {
  return isPlatformAdmin || sessionUserType !== "External";
}

/**
 * Company setup POC step: show "Pick from list" for department and designation.
 * Internal platform admins creating a **new** reseller should only create new dept/designation rows (no prior host lists).
 */
export function sessionShowPocDeptDesignationPickFromList(
  isPlatformAdmin: boolean,
  sessionUserType: AuthUserType | undefined,
  companySetupKind: "new_reseller" | "existing_reseller",
): boolean {
  if (companySetupKind !== "new_reseller") return true;
  if (!isPlatformAdmin) return true;
  if (sessionUserType === undefined) return true;
  return sessionUserType !== "Internal";
}
