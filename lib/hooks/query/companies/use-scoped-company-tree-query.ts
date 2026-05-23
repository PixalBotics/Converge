"use client";

import type { CompaniesListParams } from "./hooks";
import { useCompaniesByResellerQuery, useCompaniesListQuery } from "./hooks";

const TREE_PARAMS: CompaniesListParams = {
  view: "tree",
  sortBy: "name",
  sortOrder: "asc",
  all: true,
};

/**
 * Company hierarchy for pickers:
 * - Platform admin: `GET /companies/by-reseller/{pickedId}?view=tree&all=true`
 * - Tenant session: `GET /companies/by-reseller/{ownId}` or `GET /companies?view=tree` (never `?resellerId=`)
 */
export function useScopedCompanyTreeQuery(
  pickedResellerId: string,
  canFilterByResellerId: boolean,
  sessionResellerId: string,
  options?: { enabled?: boolean },
) {
  const enabled = options?.enabled ?? true;
  const tenantResellerId = sessionResellerId.trim();
  const sessionTreeQuery = useCompaniesListQuery(TREE_PARAMS, {
    enabled: enabled && !canFilterByResellerId && !tenantResellerId,
  });
  const sessionByResellerQuery = useCompaniesByResellerQuery(tenantResellerId, TREE_PARAMS, {
    enabled: enabled && !canFilterByResellerId && tenantResellerId.length > 0,
  });
  const platformByResellerQuery = useCompaniesByResellerQuery(pickedResellerId, TREE_PARAMS, {
    enabled: enabled && canFilterByResellerId && pickedResellerId.trim().length > 0,
  });
  if (canFilterByResellerId) return platformByResellerQuery;
  if (tenantResellerId) return sessionByResellerQuery;
  return sessionTreeQuery;
}
