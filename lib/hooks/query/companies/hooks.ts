"use client";

import { useQuery } from "@tanstack/react-query";
import {
  getCompaniesSetupResellers,
  listCompanies,
  listCompaniesByReseller,
} from "@/api";
import { companiesKeys } from "./keys";

export type CompaniesListParams = {
  page?: number;
  limit?: number;
  search?: string;
  view?: "tree" | "flat";
  sortBy?: string;
  sortOrder?: "asc" | "desc";
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

export function useCompaniesSetupResellersQuery(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: companiesKeys.setupResellers(),
    queryFn: () => getCompaniesSetupResellers(),
    enabled: options?.enabled ?? true,
  });
}
