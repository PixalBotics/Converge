"use client";

import { useEffect, useMemo, useState } from "react";
import Assignment from "@mui/icons-material/Assignment";
import IosShare from "@mui/icons-material/IosShare";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Link from "@mui/material/Link";
import NextLink from "next/link";
import type { SxProps, Theme } from "@mui/material/styles";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { filterChromeButtonSx } from "@/components/common/FilterButton/filter-button.styles";
import {
  AssignWebsiteModal,
  Button,
  DashboardCard,
  DataTable,
  SearchBar,
  SelectField,
  ToolbarFilterPopover,
  Typography,
} from "@/components/common";
import { useCompaniesByResellerQuery, useCompaniesSetupResellersQuery, useWebsiteAssignmentsWebsitesQuery } from "@/lib/hooks";
import type { DataTableColumn } from "@/components/common";
import { gradientPrimaryButtonSx } from "@/components/common/Button/Button.styles";
import { SearchIcon } from "@/components/common/icons";
import {
  extractChildCompanyOptionsForParentFromByResellerTree,
  extractParentCompaniesFromByResellerTree,
  pickItemsArray,
  toIdNameOption,
} from "@/app/dashboard/user-page/components/add-user-modal.utils";
import {
  websiteAssignmentFilterGrid,
  websiteAssignmentFooterRow,
  websiteAssignmentHeaderActions,
  websiteAssignmentPageHeader,
  websiteAssignmentPageWrapper,
  websiteAssignmentSearchFieldWrapper,
  websiteAssignmentSearchRow,
  websiteAssignmentTableCard,
  websiteAssignmentTableIconBox,
  websiteAssignmentTableToolbar,
} from "./website-assigning.styles";
import type { WebsiteAssignmentScopeItem } from "@/api/types/website-assignments.types";
import { groupWebsitesByParentChild, sitesListHref } from "./group-websites-by-org";

/** One API page size — avoids loading thousands of rows at once. */
const WEBSITES_PAGE_LIMIT = 50;

const ASSIGNED_FILTER_OPTIONS = [
  { value: "", label: "All" },
  { value: "assigned", label: "Assigned" },
  { value: "unassigned", label: "Unassigned" },
] as const;

type WebsiteRow = {
  id: string;
  reseller: string;
  parentCompany: string;
  childCompany: string;
  websiteName: string;
  websiteUrl: string;
  assignedCount: number;
  isFullyAssigned: boolean;
};

export default function WebsiteAssigningPage() {
  const theme = useTheme() as AppTheme;
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [filterAssigned, setFilterAssigned] = useState<string>("");
  const [filterResellerId, setFilterResellerId] = useState("");
  const [filterParentCompanyId, setFilterParentCompanyId] = useState("");
  const [filterChildCompanyId, setFilterChildCompanyId] = useState("");
  const [filterPopoverOpen, setFilterPopoverOpen] = useState(false);
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [page, setPage] = useState(1);

  const resellersQuery = useCompaniesSetupResellersQuery({ enabled: true });
  const companiesByResellerQuery = useCompaniesByResellerQuery(
    filterResellerId,
    { view: "tree", sortBy: "name", sortOrder: "asc", all: true },
    { enabled: filterResellerId.trim().length > 0 },
  );

  const resellerOptions = useMemo(() => {
    return pickItemsArray(resellersQuery.data)
      .map((row) => toIdNameOption(row))
      .filter((o): o is { value: string; label: string } => o !== null);
  }, [resellersQuery.data]);

  const resellerFilterOptions = useMemo(() => {
    const all = { value: "", label: "All resellers" };
    if (resellerOptions.length > 0) return [all, ...resellerOptions];
    return [{ value: "", label: resellersQuery.isLoading ? "Loading resellers…" : "No resellers available" }];
  }, [resellerOptions, resellersQuery.isLoading]);

  const parentCompanyFilterOptions = useMemo(() => {
    if (!filterResellerId.trim()) return [{ value: "", label: "All parent companies" }];
    const extracted = extractParentCompaniesFromByResellerTree(companiesByResellerQuery.data).map((o) => ({
      value: o.value,
      label: o.label,
    }));
    if (extracted.length > 0) return [{ value: "", label: "All parent companies" }, ...extracted];
    return [
      { value: "", label: companiesByResellerQuery.isLoading ? "Loading parent companies…" : "No parent companies available" },
    ];
  }, [filterResellerId, companiesByResellerQuery.data, companiesByResellerQuery.isLoading]);

  const childCompanyFilterOptions = useMemo(() => {
    if (!filterResellerId.trim()) return [{ value: "", label: "All child companies" }];
    if (!filterParentCompanyId.trim()) return [{ value: "", label: "All child companies" }];
    const children = extractChildCompanyOptionsForParentFromByResellerTree(
      companiesByResellerQuery.data,
      filterParentCompanyId,
    );
    const options = [{ value: "", label: "All child companies" }, ...(children.length ? children : [])];
    if (options.length > 1) return options;
    return [{ value: "", label: companiesByResellerQuery.isLoading ? "Loading child companies…" : "No child companies available" }];
  }, [filterResellerId, filterParentCompanyId, companiesByResellerQuery.data, companiesByResellerQuery.isLoading]);

  const assignedParam = useMemo(() => {
    if (filterAssigned === "assigned") return true;
    if (filterAssigned === "unassigned") return false;
    return undefined;
  }, [filterAssigned]);

  const listParams = useMemo(() => {
    const params: Record<string, string | number | boolean> = {
      page,
      limit: WEBSITES_PAGE_LIMIT,
    };
    const q = search.trim();
    if (q) params.search = q;
    if (assignedParam !== undefined) params.assigned = assignedParam;
    if (filterResellerId.trim()) params.resellerId = filterResellerId.trim();
    if (filterParentCompanyId.trim()) params.parentCompanyId = filterParentCompanyId.trim();
    if (filterChildCompanyId.trim()) params.childCompanyId = filterChildCompanyId.trim();
    return params;
  }, [page, search, assignedParam, filterResellerId, filterParentCompanyId, filterChildCompanyId]);

  const { data: websitesResponse, isLoading: isWebsitesLoading, isFetching } =
    useWebsiteAssignmentsWebsitesQuery(listParams, { enabled: true });
  const websitesData = websitesResponse?.data;

  const scopeItems = useMemo(() => websitesData?.items ?? [], [websitesData?.items]);

  const hierarchy = useMemo(() => groupWebsitesByParentChild(scopeItems), [scopeItems]);

  const totalEntries = websitesData?.total ?? scopeItems.length;
  const totalPages = Math.max(1, websitesData?.totalPages ?? 1);
  const rangeStart = scopeItems.length === 0 ? 0 : (page - 1) * WEBSITES_PAGE_LIMIT + 1;
  const rangeEnd = scopeItems.length === 0 ? 0 : (page - 1) * WEBSITES_PAGE_LIMIT + scopeItems.length;
  const isLoading = isWebsitesLoading || isFetching;

  function itemToWebsiteRow(item: WebsiteAssignmentScopeItem): WebsiteRow {
    return {
      id: item.websiteId,
      reseller: item.resellerName || "-",
      parentCompany: item.parentCompanyName || "-",
      childCompany: item.childCompanyName || "-",
      websiteName: item.name || "-",
      websiteUrl: item.url || "-",
      assignedCount: item.assignedCount ?? 0,
      isFullyAssigned: Boolean(item.isFullyAssigned),
    };
  }

  const childCompanyPillSx = useMemo(
    () => ({
      alignSelf: "flex-start",
      justifyContent: "flex-start",
      px: 2,
      minWidth: "auto",
      borderRadius: "9999px",
      fontWeight: 600,
      fontSize: 13,
    }),
    [],
  );

  const nestedSiteColumns = useMemo<DataTableColumn<WebsiteRow>[]>(
    () => [
      {
        id: "website",
        label: "Website",
        render: (_, row) => (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 0.35, minWidth: 0 }}>
            <Typography variant="body2" fontWeight={600} sx={{ color: theme.app.text.primary }}>
              {row.websiteName}
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: theme.app.dashboard.textMuted,
                wordBreak: "break-all",
                lineHeight: 1.45,
              }}
            >
              {row.websiteUrl}
            </Typography>
          </Box>
        ),
      },
      {
        id: "agents",
        label: "Agents",
        render: (_, row) => (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
            <Typography variant="body2" fontWeight={600} sx={{ color: theme.app.text.primary }}>
              {row.assignedCount}
            </Typography>
            {row.isFullyAssigned ? (
              <Chip
                label="Full"
                size="small"
                sx={{
                  height: 22,
                  fontSize: 11,
                  fontWeight: 600,
                  bgcolor: `${theme.palette.success.main}22`,
                  color: theme.palette.success.main,
                  border: `1px solid ${theme.palette.success.main}55`,
                }}
              />
            ) : null}
          </Box>
        ),
      },
    ],
    [theme],
  );

  useEffect(() => {
    // Clear applied search when SearchBar cross is used.
    if (searchInput.trim().length > 0) return;
    if (!search.trim()) return;
    setSearch("");
  }, [searchInput, search]);

  useEffect(() => {
    setPage(1);
  }, [search, filterAssigned, filterResellerId, filterParentCompanyId, filterChildCompanyId]);

  useEffect(() => {
    // Reset dependent filters
    setFilterParentCompanyId("");
    setFilterChildCompanyId("");
  }, [filterResellerId]);

  useEffect(() => {
    setFilterChildCompanyId("");
  }, [filterParentCompanyId]);

  return (
    <Box sx={websiteAssignmentPageWrapper}>
      <Box sx={websiteAssignmentPageHeader}>
        <Box>
          <Typography variant="regularLarge" fontWeight={700} sx={{ color: theme.app.text.primary, mb: 0.5 }}>
            Website Assignment
          </Typography>
          <Typography variant="medium" sx={{ color: theme.app.dashboard.textMuted, maxWidth: 480 }}>
            Websites in your scope.
          </Typography>
        </Box>
        <Box sx={websiteAssignmentHeaderActions}>
          <Button type="button" variant="outlined" startIcon={<IosShare sx={{ fontSize: 18 }} />} sx={filterChromeButtonSx}>
            Export Data
          </Button>
          <Button
            type="button"
            variant="primary"
            sx={gradientPrimaryButtonSx}
            startIcon={<Assignment sx={{ fontSize: 18 }} />}
            onClick={() => setIsAssignOpen(true)}
          >
            Assign Website
          </Button>
        </Box>
      </Box>

      <DashboardCard sx={websiteAssignmentTableCard}>
        <Box sx={websiteAssignmentTableToolbar}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Box sx={websiteAssignmentTableIconBox}>
              <SearchIcon sx={{ fontSize: 20, color: theme.app.dashboard.iconMuted }} width={20} height={20} />
            </Box>
            <Typography variant="mediumLarge" color="white" fontWeight={600}>
              Websites ({totalEntries})
            </Typography>
          </Box>
          <Box sx={websiteAssignmentSearchRow}>
            <Box sx={websiteAssignmentSearchFieldWrapper}>
              <SearchBar
                value={searchInput}
                onChange={setSearchInput}
                placeholder="Search URL, website, company, reseller, or assigned user…"
                sx={{ minWidth: "100%" }}
              />
            </Box>
            <Button
              type="button"
              variant="primary"
              disabled={searchInput.trim() === search.trim()}
              onClick={() => {
                setSearch(searchInput);
                setPage(1);
              }}
              sx={{ minWidth: 132, whiteSpace: "nowrap", alignSelf: { xs: "stretch", sm: "center" } }}
            >
              Search
            </Button>
            <ToolbarFilterPopover
              open={filterPopoverOpen}
              onOpenChange={setFilterPopoverOpen}
              active={Boolean(
                filterAssigned || filterResellerId.trim() || filterParentCompanyId.trim() || filterChildCompanyId.trim(),
              )}
            >
              <Box sx={{ p: 2, color: theme.app.text.primary }}>
                <Box sx={websiteAssignmentFilterGrid}>
                  <SelectField
                    label="Assigned"
                    value={filterAssigned}
                    onChange={setFilterAssigned}
                    options={[...ASSIGNED_FILTER_OPTIONS]}
                  />
                  <SelectField
                    label="Reseller"
                    value={filterResellerId}
                    onChange={setFilterResellerId}
                    options={resellerFilterOptions}
                    menuMaxRows={6}
                  />
                  <SelectField
                    label="Parent Company"
                    value={filterParentCompanyId}
                    onChange={setFilterParentCompanyId}
                    options={parentCompanyFilterOptions}
                    menuMaxRows={7}
                    disabled={!filterResellerId.trim()}
                  />
                  <SelectField
                    label="Child Company"
                    value={filterChildCompanyId}
                    onChange={setFilterChildCompanyId}
                    options={childCompanyFilterOptions}
                    menuMaxRows={7}
                    disabled={!filterResellerId.trim() || !filterParentCompanyId.trim()}
                  />
                </Box>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5, justifyContent: "flex-end", mt: 2 }}>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => {
                      setFilterAssigned("");
                      setFilterResellerId("");
                      setFilterParentCompanyId("");
                      setFilterChildCompanyId("");
                      setSearchInput("");
                      setSearch("");
                      setPage(1);
                    }}
                  >
                    Reset
                  </Button>
                  <Button type="button" variant="primary" sx={gradientPrimaryButtonSx} onClick={() => setFilterPopoverOpen(false)}>
                    Done
                  </Button>
                </Box>
              </Box>
            </ToolbarFilterPopover>
          </Box>
        </Box>

        {isLoading ? (
          <Typography variant="medium" sx={{ color: theme.app.dashboard.textMuted, py: 2 }}>
            Loading websites…
          </Typography>
        ) : hierarchy.length === 0 ? (
          <Typography variant="medium" sx={{ color: theme.app.dashboard.textMuted, py: 2 }}>
            No websites match your filters.
          </Typography>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3, pt: 0.5 }}>
            {hierarchy.map((parent) => (
              <Box
                key={`${parent.parentCompanyId}:${parent.parentCompanyName}`}
                sx={{
                  borderLeft: `3px solid ${theme.palette.primary.main}`,
                  pl: { xs: 1.5, sm: 2 },
                }}
              >
                <Typography variant="mediumLarge" fontWeight={700} sx={{ color: theme.app.text.primary, mb: 0.5 }}>
                  Parent company: {parent.parentCompanyName}
                </Typography>
                <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted, display: "block", mb: 2 }}>
                  Client (reseller): {parent.resellerName}
                </Typography>

                {parent.children.map((child) => (
                  <Box
                    key={`${child.childCompanyId}:${child.childCompanyName}`}
                    sx={{ mb: 2.5, ml: { xs: 0, sm: 0.5 } }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        flexWrap: "wrap",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 1,
                        mb: 1,
                      }}
                    >
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
                        <Typography variant="medium" fontWeight={600} sx={{ color: theme.app.text.primary }}>
                          Child company:
                        </Typography>
                        {child.childCompanyName.trim() && child.childCompanyName !== "—" ? (
                          <Button type="button" variant="secondary" size="small" sx={childCompanyPillSx}>
                            {child.childCompanyName}
                          </Button>
                        ) : (
                          <Typography variant="medium" sx={{ color: theme.app.dashboard.textMuted }}>
                            —
                          </Typography>
                        )}
                        <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted }}>
                          ({child.websites.length} website{child.websites.length === 1 ? "" : "s"})
                        </Typography>
                      </Box>
                      <Button
                        type="button"
                        size="small"
                        variant="outlined"
                        component={NextLink}
                        href={sitesListHref(parent.parentCompanyId, child.childCompanyId)}
                        sx={{ whiteSpace: "nowrap" }}
                      >
                        All websites (detail)
                      </Button>
                    </Box>
                    <DataTable<WebsiteRow>
                      columns={nestedSiteColumns}
                      rows={child.websites.map(itemToWebsiteRow)}
                      isLoading={false}
                      getRowId={(row) => row.id}
                      minWidth={560}
                      actionColumn={{
                        label: "Detail",
                        render: (row) => (
                          <Link
                            component={NextLink}
                            href={`/dashboard/website-assigning/website/${encodeURIComponent(row.id)}`}
                            sx={{
                              color: theme.palette.primary.main,
                              textDecoration: "none",
                              cursor: "pointer",
                              fontSize: 14,
                              fontWeight: 500,
                              "&:hover": { textDecoration: "underline" },
                            }}
                          >
                            Website detail
                          </Link>
                        ),
                      }}
                    />
                  </Box>
                ))}
              </Box>
            ))}
          </Box>
        )}

        <Box
          sx={[
            websiteAssignmentFooterRow,
            {
              flexWrap: "wrap",
              alignItems: "center",
              justifyContent: "space-between",
            },
          ] as SxProps<Theme>}
        >
          <Typography variant="medium" sx={{ color: theme.app.dashboard.textMuted }}>
            {isLoading
              ? ""
              : totalEntries === 0
                ? "No results."
                : `${rangeStart}–${rangeEnd} of ${totalEntries} · page ${page} / ${totalPages} (${WEBSITES_PAGE_LIMIT} per page). Parent/child blocks = this page only.`}
          </Typography>
          <Box sx={{ display: "flex", gap: 1, flexShrink: 0 }}>
            <Button type="button" variant="outlined" size="small" disabled={page <= 1 || isLoading} onClick={() => setPage((p) => Math.max(1, p - 1))}>
              Previous
            </Button>
            <Button
              type="button"
              variant="outlined"
              size="small"
              disabled={page >= totalPages || isLoading}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              Next
            </Button>
          </Box>
        </Box>
      </DashboardCard>

      <AssignWebsiteModal open={isAssignOpen} onClose={() => setIsAssignOpen(false)} />
    </Box>
  );
}
