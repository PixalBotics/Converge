/** Role names that grant the full permission catalog (platform operator). */
export const PLATFORM_ADMIN_ROLE_NAMES = ["Platform Admin", "SuperAdmin"] as const;

/** External admin scope → seeded global roles (see `external-admin-roles.ts` on API). */
export const RESELLER_ADMIN_ROLE_NAME = "Reseller Admin";
export const PARENT_COMPANY_ADMIN_ROLE_NAME = "Parent Company Admin";

export type InternalAdminScope = "standard" | "platform_admin";
export type ExternalAdminScope = "parent_company" | "wide_reseller";

export function isPlatformAdminRoleName(name: string): boolean {
  const n = name.trim();
  return (PLATFORM_ADMIN_ROLE_NAMES as readonly string[]).includes(n);
}

function findRoleIdByName(
  roles: ReadonlyArray<{ value: string; label: string }>,
  roleName: string,
): string | null {
  const hit = roles.find((r) => r.label.trim() === roleName);
  return hit?.value ?? null;
}

export function findPlatformAdminRoleId(
  roles: ReadonlyArray<{ value: string; label: string }>,
): string | null {
  for (const name of PLATFORM_ADMIN_ROLE_NAMES) {
    const id = findRoleIdByName(roles, name);
    if (id) return id;
  }
  return null;
}

export function findResellerAdminRoleId(
  roles: ReadonlyArray<{ value: string; label: string }>,
): string | null {
  return findRoleIdByName(roles, RESELLER_ADMIN_ROLE_NAME);
}

export function findParentCompanyAdminRoleId(
  roles: ReadonlyArray<{ value: string; label: string }>,
): string | null {
  return findRoleIdByName(roles, PARENT_COMPANY_ADMIN_ROLE_NAME);
}

export function resolveRoleIdForExternalAdminScope(
  scope: ExternalAdminScope,
  roles: ReadonlyArray<{ value: string; label: string }>,
): string | null {
  return scope === "wide_reseller"
    ? findResellerAdminRoleId(roles)
    : findParentCompanyAdminRoleId(roles);
}

export function resolveInternalAdminScope(
  roleId: string,
  roles: ReadonlyArray<{ value: string; label: string }>,
): InternalAdminScope {
  const role = roles.find((r) => r.value === roleId);
  if (role && isPlatformAdminRoleName(role.label)) return "platform_admin";
  return "standard";
}

export function resolveExternalAdminScope(
  roleId: string,
  roles: ReadonlyArray<{ value: string; label: string }>,
  wideResellerScope: boolean,
): ExternalAdminScope {
  const role = roles.find((r) => r.value === roleId);
  if (role?.label.trim() === RESELLER_ADMIN_ROLE_NAME) return "wide_reseller";
  if (role?.label.trim() === PARENT_COMPANY_ADMIN_ROLE_NAME) return "parent_company";
  return wideResellerScope ? "wide_reseller" : "parent_company";
}
