"use client";

import { useMemo, useState } from "react";
import Box from "@mui/material/Box";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { Typography } from "@/components/common";
import { useCompanyPocDirectoryQuery } from "@/lib/hooks/query";
import { useAuth } from "@/lib/auth";
import { extractApiErrorMessageForToast } from "@/lib/notify/extract-api-message";
import { overviewPageWrapper, overviewHeader } from "../overview.styles";
import { PocListStatsCards } from "./components/PocListStatsCards";
import { PocHierarchySection } from "./components/PocHierarchySection";

export type PocListRow = {
  companyContactId: string;
  resellerId: string;
  resellerName: string;
  parentCompanyId: string;
  parentCompanyName: string;
  childCompanyId: string;
  childCompanyName: string;
  userId: string;
  pocName: string;
  pocEmail: string;
  designationTitle: string;
  departmentName: string;
};

function unwrapPocListItems(payload: unknown): PocListRow[] {
  const root = payload && typeof payload === "object" ? (payload as Record<string, unknown>) : null;
  const data = root?.data && typeof root.data === "object" ? (root.data as Record<string, unknown>) : root;
  const items = data?.items;
  if (!Array.isArray(items)) return [];
  return items
    .map((raw) => {
      if (!raw || typeof raw !== "object") return null;
      const r = raw as Record<string, unknown>;
      const companyContactId = String(r.companyContactId ?? "").trim();
      if (!companyContactId) return null;
      return {
        companyContactId,
        resellerId: String(r.resellerId ?? "").trim(),
        resellerName: String(r.resellerName ?? "—").trim() || "—",
        parentCompanyId: String(r.parentCompanyId ?? "").trim(),
        parentCompanyName: String(r.parentCompanyName ?? "—").trim() || "—",
        childCompanyId: String(r.childCompanyId ?? "").trim(),
        childCompanyName: String(r.childCompanyName ?? "—").trim() || "—",
        userId: String(r.userId ?? "").trim(),
        pocName: String(r.pocName ?? "—").trim() || "—",
        pocEmail: String(r.pocEmail ?? "—").trim() || "—",
        designationTitle: String(r.designationTitle ?? "—").trim() || "—",
        departmentName: String(r.departmentName ?? "—").trim() || "—",
      };
    })
    .filter((x): x is PocListRow => x !== null);
}

function matchesSearch(row: PocListRow, q: string): boolean {
  if (!q) return true;
  const hay = [
    row.resellerName,
    row.parentCompanyName,
    row.childCompanyName,
    row.pocName,
    row.pocEmail,
    row.designationTitle,
    row.departmentName,
  ]
    .join(" ")
    .toLowerCase();
  return hay.includes(q);
}

export default function UserPocListPage() {
  const theme = useTheme() as AppTheme;
  const { hasPage } = useAuth();
  const canView = hasPage("page:users");

  const [search, setSearch] = useState("");

  const query = useCompanyPocDirectoryQuery({ all: true }, { enabled: canView });
  const allRows = useMemo(() => unwrapPocListItems(query.data), [query.data]);

  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return allRows.filter((r) => matchesSearch(r, q));
  }, [allRows, search]);

  const stats = useMemo(() => {
    const resellerIds = new Set<string>();
    const childIds = new Set<string>();
    for (const row of allRows) {
      if (row.resellerId) resellerIds.add(row.resellerId);
      if (row.childCompanyId) childIds.add(row.childCompanyId);
    }
    return {
      uniqueResellers: resellerIds.size,
      uniqueOrganizations: childIds.size,
    };
  }, [allRows]);

  const errorMessage = query.isError
    ? extractApiErrorMessageForToast(query.error) ?? "Could not load POC directory."
    : null;

  const isFiltering = search.trim().length > 0;

  if (!canView) {
    return (
      <Box sx={overviewPageWrapper}>
        <Typography variant="body2" sx={{ color: theme.app.dashboard.textMuted }}>
          You do not have permission to view the POC directory.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={overviewPageWrapper}>
      <Box sx={overviewHeader}>
        <Box>
          <Typography variant="regularLarge" fontWeight={700} color="white">
            Points of contact
          </Typography>
          <Typography variant="medium" sx={{ color: theme.app.dashboard.textMuted, mt: 0.5 }}>
            Browse by reseller and company — multiple POCs grouped under each child company.
          </Typography>
        </Box>
      </Box>

      <PocListStatsCards
        theme={theme}
        totalContacts={allRows.length}
        uniqueResellers={stats.uniqueResellers}
        uniqueOrganizations={stats.uniqueOrganizations}
        filteredCount={filteredRows.length}
        isFiltering={isFiltering}
      />

      <PocHierarchySection
        theme={theme}
        search={search}
        onSearchChange={setSearch}
        rows={filteredRows}
        allRowsCount={allRows.length}
        isLoading={query.isLoading}
        errorMessage={errorMessage}
      />
    </Box>
  );
}
