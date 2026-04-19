import type { CompaniesData } from "@/api/types/companies.types";
import type { CompanyRow, UnknownRecord } from "./types";

export function asRecord(value: unknown): UnknownRecord | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as UnknownRecord)
    : null;
}

/** Flattens `GET /companies?view=tree` rows for the All Companies table. */
export function buildCompaniesTableRows(companiesData: CompaniesData | undefined): CompanyRow[] {
  const items =
    companiesData && Array.isArray(companiesData.items) ? companiesData.items : [];
  const rows: CompanyRow[] = [];

  for (const item of items) {
    const treeNode = asRecord(item);
    if (!treeNode) continue;
    const resellerObj = asRecord(treeNode.reseller);
    const resellerName = String(resellerObj?.name ?? "").trim() || "-";
    const parentCompanies = Array.isArray(treeNode.parentCompanies)
      ? treeNode.parentCompanies
      : [];

    const resellerId = String(resellerObj?.id ?? "").trim();

    /** One reseller, multiple parent companies → single row (same idea as “N Child Companies”). */
    if (parentCompanies.length > 1) {
      rows.push({
        id:
          resellerId.length > 0
            ? `reseller-${resellerId}-multi-parents`
            : `${resellerName}::multi-parents-${parentCompanies.length}`,
        parentCompanyId: "",
        reseller: resellerName,
        resellerId: resellerId || undefined,
        parentCompany: `${parentCompanies.length} Parent Companies`,
        childCompany: "—",
        parentCompanies: parentCompanies as UnknownRecord[],
      });
      continue;
    }

    for (const parent of parentCompanies) {
      const parentObj = asRecord(parent);
      if (!parentObj) continue;
      const parentName = String(parentObj.name ?? "").trim() || "-";
      const parentCompanyId = String(parentObj.id ?? "").trim();
      const childCompanies = Array.isArray(parentObj.childCompanies)
        ? parentObj.childCompanies
        : [];

      if (childCompanies.length === 0) {
        rows.push({
          id: parentCompanyId || `${resellerName}::${parentName}::empty`,
          parentCompanyId,
          reseller: resellerName,
          resellerId: resellerId || undefined,
          parentCompany: parentName,
          childCompany: "-",
        });
        continue;
      }

      if (childCompanies.length === 1) {
        const childObj = asRecord(childCompanies[0]);
        const childName = String(childObj?.name ?? "").trim() || "-";
        const childId = String(childObj?.id ?? "").trim();
        rows.push({
          id:
            parentCompanyId && childId
              ? `${parentCompanyId}::child::${childId}`
              : childId || `${resellerName}::${parentName}::one`,
          parentCompanyId,
          reseller: resellerName,
          resellerId: resellerId || undefined,
          parentCompany: parentName,
          childCompany: childName,
        });
      } else {
        rows.push({
          id: parentCompanyId || `${resellerName}::${parentName}::multi`,
          parentCompanyId,
          reseller: resellerName,
          resellerId: resellerId || undefined,
          parentCompany: parentName,
          childCompany: `${childCompanies.length} Child Companies`,
          childCompanies: childCompanies as UnknownRecord[],
        });
      }
    }
  }

  return rows;
}
