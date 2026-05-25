"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Assignment from "@mui/icons-material/Assignment";
import FilterList from "@mui/icons-material/FilterList";
import IosShare from "@mui/icons-material/IosShare";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import NextLink from "next/link";
import type { SxProps, Theme } from "@mui/material/styles";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { filterChromeButtonSx } from "@/components/common/FilterButton/filter-button.styles";
import {
  Button,
  DashboardCard,
  DataTable,
  FormModal,
  SearchBar,
  TablePagination,
  ToolbarFilterPopover,
  Typography,
} from "@/components/common";
import { WebsiteAssignmentScopeFilterPanel } from "@/features/website-assignments/components/WebsiteAssignmentScopeFilterPanel";
import { WebsiteAssignmentTableActions } from "@/features/website-assignments/components/WebsiteAssignmentTableActions";
import { useWebsiteAssignmentScopeFilters } from "@/features/website-assignments/hooks/useWebsiteAssignmentScopeFilters";
import {
  ASSIGNED_FILTER_OPTIONS,
  ROSTER_FILTER_OPTIONS,
  parseAssignedFilter,
  parseRosterFilter,
} from "@/features/website-assignments/utils/list-filter-params";
import { clearAllDepartmentRosters } from "@/features/website-assignments/utils/clear-website-roster";
import { extractApiErrorMessageForToast, publishAppToast } from "@/lib/notify";
import { useQueryClient } from "@tanstack/react-query";
import { websiteAssignmentsKeys } from "@/lib/hooks/query/website-assignments/keys";
import { useWebsiteAssignmentGates } from "@/lib/permissions/use-website-assignment-gates";
import { buildWebsitesInScopeParams, useWebsiteAssignmentsWebsitesQuery } from "@/lib/hooks";
import type { DataTableColumn } from "@/components/common";
import { gradientPrimaryButtonSx } from "@/components/common/Button/Button.styles";
import { SearchIcon } from "@/components/common/icons";
import {
  websiteAssignmentFilterCard,
  websiteAssignmentFilterIconBox,
  websiteAssignmentFilterTitleRow,
  websiteAssignmentFooterRow,
  websiteAssignmentHeaderActions,
  websiteAssignmentPageHeader,
  websiteAssignmentPageWrapper,
  websiteAssignmentPaginationWrapper,
  websiteAssignmentSearchFieldWrapper,
  websiteAssignmentSearchRow,
  websiteAssignmentTableCard,
  websiteAssignmentTableIconBox,
  websiteAssignmentTableToolbar,
} from "./website-assigning.styles";
import type { WebsiteAssignmentScopeItem } from "@/api/types/website-assignments.types";
import { WebsiteUrlDisplay } from "@/features/website-assignments/components/WebsiteUrlDisplay";
import { resolveWebsiteRowUrlLabels } from "@/lib/websites/format-website-display-url";
import { groupWebsitesByParentChild, sitesListHref } from "./group-websites-by-org";

/** One API page size — avoids loading thousands of rows at once. */
const WEBSITES_PAGE_LIMIT = 50;

type WebsiteRow = {
  id: string;
  reseller: string;
  resellerId: string;
  parentCompany: string;
  parentCompanyId: string;
  childCompany: string;
  childCompanyId: string;
  websiteName: string;
  websiteUrl: string;
  assignedCount: number;
  filledSlots: number;
  uniqueMemberCount: number;
  expectedRosterSlots: number;
  serviceSchedulingConfigured: boolean;
  isFullyAssigned: boolean;
};

export default function WebsiteAssigningPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const theme = useTheme() as AppTheme;
  const assignmentGates = useWebsiteAssignmentGates();
  const scope = useWebsiteAssignmentScopeFilters();
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [filterAssigned, setFilterAssigned] = useState("");
  const [filterRoster, setFilterRoster] = useState("");
  const [filterPopoverOpen, setFilterPopoverOpen] = useState(false);
  const [clearTarget, setClearTarget] = useState<WebsiteRow | null>(null);
  const [clearing, setClearing] = useState(false);
  const [page, setPage] = useState(1);

  const assignedParam = useMemo(() => parseAssignedFilter(filterAssigned), [filterAssigned]);
  const rosterParams = useMemo(() => parseRosterFilter(filterRoster), [filterRoster]);

  const listParams = useMemo(
    () =>
      buildWebsitesInScopeParams({
        canFilterByResellerId: scope.canFilterByResellerId,
        page,
        limit: WEBSITES_PAGE_LIMIT,
        search,
        assigned: rosterParams.assigned ?? assignedParam,
        resellerId: scope.filterResellerId,
        parentCompanyId: scope.filterParentCompanyId,
        childCompanyId: scope.filterChildCompanyId,
        serviceSchedulingConfigured: rosterParams.serviceSchedulingConfigured,
        fullyAssigned: rosterParams.fullyAssigned,
      }),
    [
      scope.canFilterByResellerId,
      scope.filterResellerId,
      scope.filterParentCompanyId,
      scope.filterChildCompanyId,
      page,
      search,
      assignedParam,
      rosterParams,
    ],
  );

  const { data: websitesResponse, isLoading: isWebsitesLoading, isFetching } =
    useWebsiteAssignmentsWebsitesQuery(listParams, {
      allowResellerIdFilter: scope.canFilterByResellerId,
      enabled: assignmentGates.view,
    });
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
      resellerId: item.resellerId ?? "",
      parentCompany: item.parentCompanyName || "-",
      parentCompanyId: item.parentCompanyId,
      childCompany: item.childCompanyName || "-",
      childCompanyId: item.childCompanyId,
      websiteName: (item.name ?? "").trim(),
      websiteUrl: (item.url ?? "").trim() || "—",
      assignedCount: item.filledSlots ?? item.assignedCount ?? 0,
      filledSlots: item.filledSlots ?? item.assignedCount ?? 0,
      uniqueMemberCount: item.uniqueMemberCount ?? 0,
      expectedRosterSlots: item.expectedRosterSlots ?? 0,
      serviceSchedulingConfigured: Boolean(item.serviceSchedulingConfigured),
      isFullyAssigned: Boolean(item.isFullyAssigned),
    };
  }

  const rosterHref = (websiteId: string) =>
    `/dashboard/website-assigning/website/${encodeURIComponent(websiteId)}`;

  const openAssign = () => {
    router.push("/dashboard/website-assigning/assign");
  };

  const openRosterEdit = (row: WebsiteRow) => {
    router.push(rosterHref(row.id));
  };

  const handleClearAgents = async () => {
    if (!clearTarget || !assignmentGates.assign) return;
    setClearing(true);
    try {
      await clearAllDepartmentRosters(clearTarget.id);
      void queryClient.invalidateQueries({ queryKey: websiteAssignmentsKeys.all });
      publishAppToast({ message: "All agent slots cleared for this website.", variant: "success" });
      setClearTarget(null);
    } catch (e) {
      publishAppToast({
        message: extractApiErrorMessageForToast(e, "Could not clear agent assignments"),
        variant: "error",
      });
    } finally {
      setClearing(false);
    }
  };

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
          <WebsiteUrlDisplay
            name={row.websiteName || undefined}
            url={row.websiteUrl}
            mutedSx={{ color: theme.app.dashboard.textMuted }}
            sx={{ color: theme.app.text.primary }}
          />
        ),
      },
      {
        id: "status",
        label: "Status",
        render: (_, row) => {
          if (!row.serviceSchedulingConfigured) {
            return (
              <Chip
                label="Please add schedule"
                size="small"
                sx={{
                  height: 24,
                  fontWeight: 600,
                  fontSize: 11,
                  bgcolor: `${theme.palette.warning.main}22`,
                  color: theme.palette.warning.light,
                }}
              />
            );
          }
          if (row.isFullyAssigned) {
            return (
              <Chip
                label="Roster complete"
                size="small"
                sx={{
                  height: 24,
                  fontWeight: 600,
                  fontSize: 11,
                  bgcolor: `${theme.palette.success.main}22`,
                  color: theme.palette.success.main,
                }}
              />
            );
          }
          return (
            <Chip
              label="Assign agents"
              size="small"
              sx={{
                height: 24,
                fontWeight: 600,
                fontSize: 11,
                bgcolor: `${theme.palette.primary.main}18`,
                color: theme.palette.primary.light,
              }}
            />
          );
        },
      },
      {
        id: "roster",
        label: "Roster",
        render: (_, row) => (
          <Typography variant="body2" fontWeight={600} sx={{ color: theme.app.text.primary }}>
            {row.expectedRosterSlots > 0
              ? `${row.filledSlots} / ${row.expectedRosterSlots} slots`
              : `${row.filledSlots} slots`}
          </Typography>
        ),
      },
      {
        id: "members",
        label: "Team",
        render: (_, row) => (
          <Typography variant="body2" sx={{ color: theme.app.dashboard.textMuted }}>
            {row.uniqueMemberCount} member{row.uniqueMemberCount === 1 ? "" : "s"}
          </Typography>
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

  const hasActiveFilters = Boolean(
    filterAssigned ||
      filterRoster ||
      scope.hasScopeFilters ||
      search.trim(),
  );

  const clearAllFilters = () => {
    setFilterAssigned("");
    setFilterRoster("");
    scope.clearScopeFilters();
    setSearchInput("");
    setSearch("");
    setPage(1);
  };

  useEffect(() => {
    setPage(1);
  }, [
    search,
    filterAssigned,
    filterRoster,
    scope.filterResellerId,
    scope.filterParentCompanyId,
    scope.filterChildCompanyId,
  ]);

  return (
    <Box sx={websiteAssignmentPageWrapper}>
      <Box sx={websiteAssignmentPageHeader}>
        <Box>
          <Typography variant="regularLarge" fontWeight={700} sx={{ color: theme.app.text.primary, mb: 0.5, letterSpacing: "-0.02em" }}>
            Website assignments
          </Typography>
          <Typography variant="medium" sx={{ color: theme.app.dashboard.textMuted, maxWidth: 560 }}>
            Manage service schedules and agent rosters per website — scoped to your reseller or client.
          </Typography>
        </Box>
        <Box sx={websiteAssignmentHeaderActions}>
          <Button type="button" variant="outlined" startIcon={<IosShare sx={{ fontSize: 18 }} />} sx={filterChromeButtonSx}>
            Export Data
          </Button>
          {assignmentGates.assign ? (
            <Button
              type="button"
              variant="primary"
              sx={gradientPrimaryButtonSx}
              startIcon={<Assignment sx={{ fontSize: 18 }} />}
              onClick={() => openAssign()}
            >
              Assign Website
            </Button>
          ) : null}
        </Box>
      </Box>

      <DashboardCard sx={websiteAssignmentFilterCard}>
        <Box sx={websiteAssignmentFilterTitleRow}>
          <Box sx={websiteAssignmentFilterIconBox}>
            <FilterList sx={{ fontSize: 20 }} />
          </Box>
          <Typography variant="mediumLarge" fontWeight={600}>
            Filters
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
              setSearch(searchInput.trim());
              setPage(1);
            }}
            sx={{ minWidth: 132, whiteSpace: "nowrap", alignSelf: { xs: "stretch", sm: "center" } }}
          >
            Search
          </Button>
          <ToolbarFilterPopover
            open={filterPopoverOpen}
            onOpenChange={setFilterPopoverOpen}
            active={hasActiveFilters}
          >
            <WebsiteAssignmentScopeFilterPanel
              {...scope}
              showAssignedFilter
              filterAssigned={filterAssigned}
              onFilterAssignedChange={setFilterAssigned}
              assignedOptions={[...ASSIGNED_FILTER_OPTIONS]}
              showRosterFilter
              filterRoster={filterRoster}
              onFilterRosterChange={setFilterRoster}
              rosterOptions={[...ROSTER_FILTER_OPTIONS]}
              hasActiveFilters={hasActiveFilters}
              onClearAll={clearAllFilters}
              onClose={() => setFilterPopoverOpen(false)}
            />
          </ToolbarFilterPopover>
        </Box>
      </DashboardCard>

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
                        label: "Actions",
                        render: (row) => (
                          <WebsiteAssignmentTableActions
                            row={{ websiteId: row.id, websiteName: row.websiteName }}
                            canAssign={assignmentGates.assign}
                            onSchedule={(r) =>
                              router.push(
                                `/dashboard/website-assigning/website/${encodeURIComponent(r.websiteId)}/service-scheduling`,
                              )
                            }
                            onEdit={() => openRosterEdit(row)}
                            onClearAgents={() => setClearTarget(row)}
                          />
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
              ? "Loading…"
              : totalEntries === 0
                ? "No results."
                : `${rangeStart}–${rangeEnd} of ${totalEntries} · page ${page} of ${totalPages}`}
          </Typography>
          <Box sx={websiteAssignmentPaginationWrapper}>
            <TablePagination page={page} pageCount={totalPages} onPageChange={setPage} />
          </Box>
        </Box>
      </DashboardCard>

      <FormModal
        open={Boolean(clearTarget)}
        title="Clear all agent slots?"
        description={
          clearTarget
            ? `Remove every Primary, Secondary, and Backup assignment for ${resolveWebsiteRowUrlLabels(clearTarget.websiteName, clearTarget.websiteUrl).primary}. Service scheduling is kept.`
            : undefined
        }
        onClose={() => !clearing && setClearTarget(null)}
        onSave={() => void handleClearAgents()}
        primaryButtonLabel={clearing ? "Clearing…" : "Clear all agents"}
        primaryButtonVariant="danger"
        primaryButtonDisabled={clearing}
        cancelButtonLabel="Cancel"
        maxWidth={480}
      />
    </Box>
  );
}
