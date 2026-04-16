"use client";

import { useQuery } from "@tanstack/react-query";
import { getCompaniesSetupResellers, listCompaniesByReseller } from "@/api";
import { companiesKeys } from "./keys";

/** Matches OpenAPI default tree view for `/companies/by-reseller/{id}`. */
export const COMPANIES_BY_RESELLER_TREE_PARAMS = {
  view: "tree",
  sortBy: "name",
  sortOrder: "asc",
} as const;

export function useCompaniesSetupResellersQuery(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: companiesKeys.setupResellers(),
    queryFn: () => getCompaniesSetupResellers(),
    enabled: options?.enabled ?? true,
  });
}

export function useCompaniesByResellerQuery(
  resellerId: string,
  options?: { enabled?: boolean },
) {
  const enabled = (options?.enabled ?? true) && resellerId.trim().length > 0;
  return useQuery({
    queryKey: companiesKeys.byReseller(resellerId, COMPANIES_BY_RESELLER_TREE_PARAMS),
    queryFn: () =>
      listCompaniesByReseller(resellerId, {
        ...COMPANIES_BY_RESELLER_TREE_PARAMS,
      }),
    enabled,
  });
}
