"use client";

import { useEffect, useMemo, useState } from "react";
import { buildWebsitesInScopeParams, useWebsiteAssignmentsWebsitesQuery } from "@/lib/hooks";
import {
  canFetchWebsitesInOrgScope,
  parseWebsitesFromAssignmentsPayload,
} from "@/features/chat-shared/utils/website-scope-options";
import { useWebsiteAssignmentScopeFilters } from "@/features/website-assignments/hooks/useWebsiteAssignmentScopeFilters";

/** Org + website picker for Add modals only — independent from table filter state. */
export function useInvolvementModalScope(open: boolean) {
  const org = useWebsiteAssignmentScopeFilters();
  const [websiteId, setWebsiteId] = useState("");

  const websitesQuery = useWebsiteAssignmentsWebsitesQuery(
    buildWebsitesInScopeParams({
      canFilterByResellerId: org.canFilterByResellerId,
      all: true,
      resellerId: org.filterResellerId,
      parentCompanyId: org.filterParentCompanyId,
      childCompanyId: org.filterChildCompanyId,
    }),
    {
      enabled:
        open &&
        canFetchWebsitesInOrgScope({
          canFilterByResellerId: org.canFilterByResellerId,
          resellerId: org.filterResellerId,
          parentCompanyId: org.filterParentCompanyId,
          childCompanyId: org.filterChildCompanyId,
        }),
      allowResellerIdFilter: org.canFilterByResellerId,
    },
  );

  const websiteOptions = useMemo(() => {
    const parsed = parseWebsitesFromAssignmentsPayload(websitesQuery.data);
    return [
      {
        value: "",
        label: websitesQuery.isLoading
          ? "Loading websites…"
          : parsed.length
            ? "Select website…"
            : "No websites (pick parent / child first)",
      },
      ...parsed.map((w) => ({ value: w.websiteId, label: w.label })),
    ];
  }, [websitesQuery.data, websitesQuery.isLoading]);

  useEffect(() => {
    if (!open) return;
    org.clearScopeFilters();
    setWebsiteId("");
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reset only when modal opens
  }, [open]);

  useEffect(() => {
    setWebsiteId("");
  }, [org.filterParentCompanyId, org.filterChildCompanyId]);

  return {
    canFilterByResellerId: org.canFilterByResellerId,
    filterResellerId: org.filterResellerId,
    setFilterResellerId: org.setFilterResellerId,
    filterParentCompanyId: org.filterParentCompanyId,
    setFilterParentCompanyId: org.setFilterParentCompanyId,
    filterChildCompanyId: org.filterChildCompanyId,
    setFilterChildCompanyId: org.setFilterChildCompanyId,
    resellerFilterOptions: org.resellerFilterOptions,
    parentCompanyFilterOptions: org.parentCompanyFilterOptions,
    childCompanyFilterOptions: org.childCompanyFilterOptions,
    websiteId,
    setWebsiteId,
    websiteOptions,
    parentCompanyId: org.filterParentCompanyId.trim(),
    websitesLoading: websitesQuery.isLoading,
  };
}

export type InvolvementModalScope = ReturnType<typeof useInvolvementModalScope>;
