import { asRecord, pickArray } from "../user-page/utils";

export type PlatformLicenseKeyRow = {
  id: string;
  /** Client root (parent company) id — used for send API. */
  parentCompanyId: string;
  reseller: string;
  parentCompany: string;
  licenseKey: string;
  createdAt: string;
};

function formatMaybeDate(value: unknown): string {
  const raw = typeof value === "string" ? value.trim() : "";
  if (!raw) return "—";
  // Keep it simple and safe: show ISO-ish strings as-is; avoid locale surprises.
  return raw;
}

function toLicenseKeyRow(item: unknown): PlatformLicenseKeyRow | null {
  const r = asRecord(item);
  if (!r) return null;

  const id = String(r.id ?? r.licenseKeyId ?? r.keyId ?? r.companyId ?? "").trim();
  if (!id) return null;

  const companyObj = asRecord(r.company) ?? asRecord(r.parentCompany) ?? asRecord(r.clientRoot);
  const parentCompanyId = String(
    r.companyId ?? r.parentCompanyId ?? companyObj?.id ?? id,
  ).trim();
  const resellerObj = asRecord(r.reseller) ?? asRecord(companyObj?.reseller);

  const parentCompany = String(
    r.companyName ?? r.parentCompanyName ?? companyObj?.name ?? companyObj?.companyName ?? "—",
  ).trim();

  const reseller = String(
    r.resellerName ?? resellerObj?.name ?? r.reseller ?? "—",
  ).trim();

  const licenseKey = String(
    r.key ?? r.licenseKey ?? r.code ?? r.license_code ?? r.license_key ?? "—",
  ).trim();

  const createdAt = formatMaybeDate(r.createdAt ?? r.issuedAt ?? r.created_at);

  return {
    id,
    parentCompanyId,
    reseller: reseller || "—",
    parentCompany: parentCompany || "—",
    licenseKey: licenseKey || "—",
    createdAt,
  };
}

export function extractPlatformLicenseKeyRows(payload: unknown): PlatformLicenseKeyRow[] {
  const list = pickArray(payload, ["items", "rows", "results", "licenseKeys", "license_keys", "data"]);
  return list.map(toLicenseKeyRow).filter((row): row is PlatformLicenseKeyRow => row !== null);
}

export function extractPlatformLicenseKeysTotal(payload: unknown): number {
  const root = asRecord(payload);
  const data = asRecord(root?.data);
  const source = data ?? root;
  const candidates = [source?.total, source?.count, source?.totalCount, source?.recordsTotal];
  for (const value of candidates) {
    const n = Number(value);
    if (Number.isFinite(n)) return n;
  }
  return 0;
}

export function extractPlatformLicenseKeysTotalPages(payload: unknown): number {
  const root = asRecord(payload);
  const data = asRecord(root?.data);
  const source = data ?? root;
  const n = Number(source?.totalPages);
  if (Number.isFinite(n) && n > 0) return n;
  return 1;
}

export function extractPlatformLicenseKeysLimit(payload: unknown): number | undefined {
  const root = asRecord(payload);
  const data = asRecord(root?.data);
  const source = data ?? root;
  const n = Number(source?.limit);
  if (Number.isFinite(n) && n > 0) return n;
  return undefined;
}

