"use client";

import { useQuery } from "@tanstack/react-query";
import { listCompanies, listCompaniesByReseller } from "@/api";
import { companiesKeys } from "./keys";

export type CompaniesListParams = {
  page?: number;
  limit?: number;
  search?: string;
};

export function useCompaniesListQuery(
  params?: CompaniesListParams,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: companiesKeys.list(params),
    queryFn: () => listCompanies(params),
    enabled: options?.enabled ?? true,
  });
}

export function useCompaniesByResellerQuery(
  resellerId: string,
  params?: CompaniesListParams,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: companiesKeys.byReseller(resellerId, params),
    queryFn: () => listCompaniesByReseller(resellerId, params),
    enabled: (options?.enabled ?? true) && resellerId.trim().length > 0,
  });
}
