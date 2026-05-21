import { pickItemsArray } from "@/app/dashboard/user-page/components/add-user-modal.utils";

export function parseWebsitesFromAssignmentsPayload(data: unknown): Array<{
  websiteId: string;
  label: string;
}> {
  return pickItemsArray(data)
    .map((row) => {
      const rec = row as Record<string, unknown>;
      const websiteId = String(rec.websiteId ?? rec.id ?? "").trim();
      if (!websiteId) return null;
      const name = String(rec.websiteName ?? rec.name ?? "").trim();
      const url = String(rec.websiteUrl ?? rec.url ?? rec.hostname ?? "").trim();
      const label = name || url || websiteId.slice(0, 8);
      return { websiteId, label: url ? `${label} · ${url}` : label };
    })
    .filter((o): o is { websiteId: string; label: string } => o !== null);
}

/** Websites API should run only after org scope is narrowed (not reseller-only). */
export function canFetchWebsitesInOrgScope(input: {
  canFilterByResellerId: boolean;
  resellerId: string;
  parentCompanyId: string;
  childCompanyId: string;
}): boolean {
  if (input.childCompanyId.trim() || input.parentCompanyId.trim()) return true;
  if (!input.canFilterByResellerId) return true;
  return false;
}
