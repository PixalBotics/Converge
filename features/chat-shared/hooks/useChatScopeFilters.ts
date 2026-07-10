"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth, useResellerListScope } from "@/lib/auth";
import { canUseScopeFilterApis } from "@/lib/permissions/company-scope-filter-access";
import {
  buildWebsitesInScopeParams,
  useCompaniesSetupResellersQuery,
  useScopedCompanyTreeQuery,
  useWebsiteAssignmentsWebsitesQuery,
} from "@/lib/hooks";
import {
  extractChildCompanyOptionsForParentFromByResellerTree,
  extractParentCompaniesFromByResellerTree,
  pickItemsArray,
  toIdNameOption,
} from "@/app/dashboard/user-page/components/add-user-modal.utils";
import { canFetchWebsitesInOrgScope } from "../utils/website-scope-options";
import { formatWebsiteSelectLabel } from "@/lib/websites/format-website-select-label";
import { emptyChatScopeFilters, type ChatScopeFilterState } from "../types";

function asRecord(value: unknown): Record<string, unknown> | null {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return null;
}

export type UseChatScopeFiltersOptions = {
  /**
   * When false, skips reseller / company tree / website-assignments APIs.
   * Default: {@link canUseScopeFilterApis} (`scope:filter:read` for every authenticated user).
   */
  apiEnabled?: boolean;
};

export function useChatScopeFilters(
  initial?: Partial<ChatScopeFilterState>,
  options?: UseChatScopeFiltersOptions,
) {
  const { hasOperational, rbacEnabled } = useAuth();
  const { canFilterByResellerId, sessionResellerId } = useResellerListScope();
  const rbacOff = !rbacEnabled;
  const filterApisByPermission = canUseScopeFilterApis(hasOperational, rbacOff);
  const scopeApiEnabled =
    options?.apiEnabled !== undefined
      ? options.apiEnabled && filterApisByPermission
      : filterApisByPermission;

  const [filters, setFilters] = useState<ChatScopeFilterState>(() => ({
    ...emptyChatScopeFilters(),
    ...initial,
  }));

  const companiesTreeQuery = useScopedCompanyTreeQuery(
    filters.resellerId,
    canFilterByResellerId,
    sessionResellerId,
    {
      enabled:
        scopeApiEnabled &&
        (canFilterByResellerId ? filters.resellerId.trim().length > 0 : true),
    },
  );

  const resellersQuery = useCompaniesSetupResellersQuery({
    enabled: scopeApiEnabled && canFilterByResellerId,
  });

  const websitesQuery = useWebsiteAssignmentsWebsitesQuery(
    buildWebsitesInScopeParams({
      canFilterByResellerId,
      all: true,
      resellerId: filters.resellerId,
      parentCompanyId: filters.parentCompanyId,
      childCompanyId: filters.childCompanyId,
    }),
    {
      enabled:
        scopeApiEnabled &&
        canFetchWebsitesInOrgScope({
          canFilterByResellerId,
          resellerId: filters.resellerId,
          parentCompanyId: filters.parentCompanyId,
          childCompanyId: filters.childCompanyId,
        }),
      allowResellerIdFilter: canFilterByResellerId,
    },
  );

  useEffect(() => {
    setFilters((p) => ({ ...p, parentCompanyId: "", childCompanyId: "", websiteId: "" }));
  }, [filters.resellerId]);

  useEffect(() => {
    setFilters((p) => ({ ...p, childCompanyId: "", websiteId: "" }));
  }, [filters.parentCompanyId]);

  useEffect(() => {
    setFilters((p) => ({ ...p, websiteId: "" }));
  }, [filters.childCompanyId]);

  const resellerOptions = useMemo(() => {
    const rows = pickItemsArray(resellersQuery.data)
      .map((r) => toIdNameOption(r))
      .filter((o): o is { value: string; label: string } => o !== null);
    return [{ value: "", label: "All resellers" }, ...rows];
  }, [resellersQuery.data]);

  const parentCompanyOptions = useMemo(() => {
    if (canFilterByResellerId && !filters.resellerId.trim()) {
      return [{ value: "", label: "Select reseller first" }];
    }
    const extracted = extractParentCompaniesFromByResellerTree(companiesTreeQuery.data).map((o) => ({
      value: o.value,
      label: o.label,
    }));
    return [{ value: "", label: "All parent companies" }, ...extracted];
  }, [canFilterByResellerId, companiesTreeQuery.data, filters.resellerId]);

  const childCompanyOptions = useMemo(() => {
    if (!filters.parentCompanyId.trim()) {
      return [{ value: "", label: "Select parent company" }];
    }
    const extracted = extractChildCompanyOptionsForParentFromByResellerTree(
      companiesTreeQuery.data,
      filters.parentCompanyId,
    );
    return [{ value: "", label: "All child companies" }, ...extracted];
  }, [companiesTreeQuery.data, filters.parentCompanyId]);

  const websiteOptions = useMemo(() => {
    const items = pickItemsArray(websitesQuery.data);
    const fromApi = items
      .map((row) => {
        const o = asRecord(row);
        if (!o) return null;
        const id = String(o.websiteId ?? o.id ?? "").trim();
        if (!id) return null;
        const name = String(o.websiteName ?? o.name ?? "").trim();
        const url = String(o.websiteUrl ?? o.url ?? "").trim();
        return {
          value: id,
          label: formatWebsiteSelectLabel(name, url, id),
        };
      })
      .filter((o): o is { value: string; label: string } => o !== null);
    return [{ value: "", label: "All websites" }, ...fromApi];
  }, [websitesQuery.data]);

  const websiteIdsInScope = useMemo(() => {
    if (filters.websiteId.trim()) return new Set([filters.websiteId.trim()]);
    const hasOrg =
      filters.childCompanyId.trim() ||
      filters.parentCompanyId.trim() ||
      (canFilterByResellerId && filters.resellerId.trim());
    if (!hasOrg) return null;
    const ids = websiteOptions.filter((o) => o.value).map((o) => o.value);
    if (!ids.length && websitesQuery.isLoading) return null;
    return ids.length ? new Set(ids) : new Set<string>();
  }, [
    canFilterByResellerId,
    filters.childCompanyId,
    filters.parentCompanyId,
    filters.resellerId,
    filters.websiteId,
    websiteOptions,
    websitesQuery.isLoading,
  ]);

  const resetFilters = () => setFilters(emptyChatScopeFilters());

  const patchFilters = (patch: Partial<ChatScopeFilterState>) => {
    setFilters((p) => ({ ...p, ...patch }));
  };

  return {
    filters,
    setFilters,
    patchFilters,
    resetFilters,
    scopeApiEnabled,
    canFilterByResellerId,
    resellerOptions,
    parentCompanyOptions,
    childCompanyOptions,
    websiteOptions,
    websiteIdsInScope,
    companiesTreeLoading: companiesTreeQuery.isLoading,
    websitesLoading: websitesQuery.isLoading,
  };
}
