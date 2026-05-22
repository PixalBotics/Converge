/** Role names that grant the full permission catalog (platform operator). */
export const PLATFORM_ADMIN_ROLE_NAMES = ["Platform Admin", "SuperAdmin"] as const;

export type InternalAdminScope = "standard" | "platform_admin";
export type ExternalAdminScope = "parent_company" | "wide_reseller";

export function isPlatformAdminRoleName(name: string): boolean {
  const n = name.trim();
  return (PLATFORM_ADMIN_ROLE_NAMES as readonly string[]).includes(n);
}

export function findPlatformAdminRoleId(
  roles: ReadonlyArray<{ value: string; label: string }>,
): string | null {
  for (const name of PLATFORM_ADMIN_ROLE_NAMES) {
    const hit = roles.find((r) => r.label.trim() === name);
    if (hit?.value) return hit.value;
  }
  return null;
}

export function resolveInternalAdminScope(
  roleId: string,
  roles: ReadonlyArray<{ value: string; label: string }>,
): InternalAdminScope {
  const role = roles.find((r) => r.value === roleId);
  if (role && isPlatformAdminRoleName(role.label)) return "platform_admin";
  return "standard";
}

export function resolveExternalAdminScope(wideResellerScope: boolean): ExternalAdminScope {
  return wideResellerScope ? "wide_reseller" : "parent_company";
}
