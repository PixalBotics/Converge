export type UnknownRecord = Record<string, unknown>;

export interface CompanyRow extends Record<string, unknown> {
  /** Stable table row key (may differ from `parentCompanyId` when one child is shown on the row). */
  id: string;
  /** Client root / parent company id — use for edit navigation and APIs. Empty when row aggregates multiple parents. */
  parentCompanyId: string;
  reseller: string;
  /** Present when API sends reseller id (used for reseller detail route). */
  resellerId?: string;
  parentCompany: string;
  childCompany: string;
  childCompanies?: UnknownRecord[];
  /** When one reseller has multiple parents, one row carries the full parent list (for modal). */
  parentCompanies?: UnknownRecord[];
}
