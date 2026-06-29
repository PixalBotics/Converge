/** Matches backend `INTERNAL_POOL_CATALOG_DEPARTMENT_NAME`. */
export const INTERNAL_POOL_CATALOG_DEPARTMENT_NAME = "Internal Pools";

export function formatPoolDepartmentLabel(
  departmentName: string | null | undefined,
  departmentType?: string | null,
): string {
  const name = departmentName?.trim() || "";
  if (!name) return "—";
  if (
    departmentType === "Internal" &&
    name === INTERNAL_POOL_CATALOG_DEPARTMENT_NAME
  ) {
    return "—";
  }
  return name;
}
