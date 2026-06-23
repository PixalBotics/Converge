"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Add from "@mui/icons-material/Add";
import FilterList from "@mui/icons-material/FilterList";
import Topic from "@mui/icons-material/Topic";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import {
  Button,
  DashboardCard,
  DataTable,
  SearchBar,
  SearchSubmitButton,
  TablePagination,
  ToolbarFilterPopover,
  Typography,
  filterPanelDescriptionSx,
} from "@/components/common";
import type { DataTableColumn } from "@/components/common";
import { gradientPrimaryButtonSx } from "@/components/common/Button/Button.styles";
import { mergeSx } from "@/lib/mui/merge-sx";
import { InquireTopicsTableActions } from "@/features/website-assignments/components/InquireTopicsTableActions";
import { WebsiteAssignmentScopeFilterPanel } from "@/features/website-assignments/components/WebsiteAssignmentScopeFilterPanel";
import { useWebsiteAssignmentScopeFilters } from "@/features/website-assignments/hooks/useWebsiteAssignmentScopeFilters";
import {
  TOPICS_FILTER_OPTIONS,
  parseTopicsFilter,
} from "@/features/website-assignments/utils/list-filter-params";
import { useWebsiteAssignmentGates } from "@/lib/permissions/use-website-assignment-gates";
import { buildWebsitesInScopeParams, useWebsiteAssignmentsWebsitesQuery } from "@/lib/hooks";
import type { WebsiteAssignmentScopeItem } from "@/api/types/website-assignments.types";
import { WebsiteUrlDisplay } from "@/features/website-assignments/components/WebsiteUrlDisplay";
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
} from "../website-assigning.styles";

const PAGE_LIMIT = 50;

type TopicsRow = {
  id: string;
  websiteName: string;
  websiteUrl: string;
  parentCompany: string;
  childCompany: string;
  visitorTopicsConfigured: boolean;
  topicSummary: string;
};

function itemToRow(item: WebsiteAssignmentScopeItem): TopicsRow {
  const name = (item.name ?? "").trim();
  const url = (item.url ?? "").trim();
  const labels = (item.topicLabels ?? []).filter(Boolean);
  const count = item.activeTopicCount ?? labels.length;
  let topicSummary = "—";
  if (labels.length > 0) {
    topicSummary = labels.length <= 3 ? labels.join(", ") : `${labels.slice(0, 3).join(", ")} +${labels.length - 3}`;
  } else if (count > 0) {
    topicSummary = `${count} topic${count === 1 ? "" : "s"}`;
  }
  return {
    id: item.websiteId,
    websiteName: name,
    websiteUrl: url || "—",
    parentCompany: item.parentCompanyName || "—",
    childCompany: item.childCompanyName || "—",
    visitorTopicsConfigured: Boolean(item.visitorTopicsConfigured),
    topicSummary,
  };
}

export default function InquireTopicsPage() {
  const router = useRouter();
  const theme = useTheme() as AppTheme;
  const gates = useWebsiteAssignmentGates();
  const scope = useWebsiteAssignmentScopeFilters();

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [filterTopics, setFilterTopics] = useState("");
  const [filterPopoverOpen, setFilterPopoverOpen] = useState(false);
  const [page, setPage] = useState(1);

  const topicsParam = useMemo(() => parseTopicsFilter(filterTopics), [filterTopics]);

  const listParams = useMemo(
    () =>
      buildWebsitesInScopeParams({
        canFilterByResellerId: scope.canFilterByResellerId,
        page,
        limit: PAGE_LIMIT,
        search,
        resellerId: scope.filterResellerId,
        parentCompanyId: scope.filterParentCompanyId,
        childCompanyId: scope.filterChildCompanyId,
        visitorTopicsConfigured: topicsParam,
      }),
    [
      scope.canFilterByResellerId,
      scope.filterResellerId,
      scope.filterParentCompanyId,
      scope.filterChildCompanyId,
      page,
      search,
      topicsParam,
    ],
  );

  const { data: websitesResponse, isLoading, isFetching } = useWebsiteAssignmentsWebsitesQuery(
    listParams,
    { allowResellerIdFilter: scope.canFilterByResellerId, enabled: gates.view },
  );

  const payload = websitesResponse?.data;
  const rows = useMemo(() => (payload?.items ?? []).map(itemToRow), [payload?.items]);
  const total = payload?.total ?? 0;
  const totalPages = Math.max(1, payload?.totalPages ?? 1);
  const pageLimit = payload?.limit ?? PAGE_LIMIT;
  const rangeStart = rows.length === 0 ? 0 : (page - 1) * pageLimit + 1;
  const rangeEnd = (page - 1) * pageLimit + rows.length;

  const hasActiveFilters = Boolean(
    filterTopics || scope.hasScopeFilters || search.trim(),
  );

  useEffect(() => {
    setPage(1);
  }, [
    search,
    filterTopics,
    scope.filterResellerId,
    scope.filterParentCompanyId,
    scope.filterChildCompanyId,
  ]);

  useEffect(() => {
    if (searchInput.trim().length > 0) return;
    if (!search.trim()) return;
    setSearch("");
  }, [searchInput, search]);

  const columns = useMemo<DataTableColumn<TopicsRow>[]>(
    () => [
      {
        id: "website",
        label: "Website",
        render: (_, row) => (
          <WebsiteUrlDisplay
            name={row.websiteName || undefined}
            url={row.websiteUrl}
            mutedSx={{ color: theme.app.dashboard.textMuted }}
          />
        ),
      },
      {
        id: "org",
        label: "Organization",
        render: (_, row) => (
          <Box>
            <Typography variant="body2">{row.parentCompany}</Typography>
            <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted }}>
              {row.childCompany}
            </Typography>
          </Box>
        ),
      },
      {
        id: "topics",
        label: "Topics",
        render: (_, row) => (
          <Typography variant="body2" sx={{ color: theme.app.text.primary }}>
            {row.topicSummary}
          </Typography>
        ),
      },
      {
        id: "status",
        label: "Status",
        render: (_, row) =>
          row.visitorTopicsConfigured ? (
            <Chip
              label="Configured"
              size="small"
              sx={{
                height: 24,
                fontWeight: 600,
                fontSize: 11,
                bgcolor: `${theme.palette.success.main}22`,
                color: theme.palette.success.main,
              }}
            />
          ) : (
            <Chip
              label="Please add topics"
              size="small"
              sx={{
                height: 24,
                fontWeight: 600,
                fontSize: 11,
                bgcolor: `${theme.palette.warning.main}22`,
                color: theme.palette.warning.light,
              }}
            />
          ),
      },
    ],
    [theme],
  );

  const topicsPath = (websiteId: string) =>
    `/dashboard/website-assigning/website/${encodeURIComponent(websiteId)}/inquire-topics`;

  const clearAllFilters = () => {
    setFilterTopics("");
    scope.clearScopeFilters();
    setSearchInput("");
    setSearch("");
    setPage(1);
  };

  return (
    <Box sx={websiteAssignmentPageWrapper}>
      <Box sx={websiteAssignmentPageHeader}>
        <Box>
          <Typography variant="regularLarge" fontWeight={700} sx={{ mb: 0.5 }}>
            Inquire topics
          </Typography>
          <Typography variant="medium" sx={mergeSx(filterPanelDescriptionSx, { maxWidth: 640 })}>
            Configure visitor inquire topics per website. Service hours are set separately under
            Service scheduling.
          </Typography>
        </Box>
        <Box sx={websiteAssignmentHeaderActions}>
          {gates.assign ? (
            <Button
              type="button"
              variant="primary"
              sx={gradientPrimaryButtonSx}
              startIcon={<Add sx={{ fontSize: 18 }} />}
              onClick={() => router.push("/dashboard/website-assigning/inquire-topics/add")}
            >
              Add topics
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
              placeholder="Search website, URL, company, reseller…"
              sx={{ minWidth: "100%" }}
            />
          </Box>
          <SearchSubmitButton
            disabled={searchInput.trim() === search.trim()}
            onClick={() => {
              setSearch(searchInput.trim());
              setPage(1);
            }}
          />
          <ToolbarFilterPopover
            open={filterPopoverOpen}
            onOpenChange={setFilterPopoverOpen}
            active={hasActiveFilters}
          >
            <WebsiteAssignmentScopeFilterPanel
              {...scope}
              showTopicsFilter
              filterTopics={filterTopics}
              onFilterTopicsChange={setFilterTopics}
              topicsOptions={[...TOPICS_FILTER_OPTIONS]}
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
              <Topic sx={{ fontSize: 20, color: theme.app.dashboard.iconMuted }} />
            </Box>
            <Typography variant="mediumLarge" color="white" fontWeight={600}>
              Websites ({total})
            </Typography>
          </Box>
        </Box>

        <DataTable<TopicsRow>
          columns={columns}
          rows={rows}
          isLoading={isLoading || isFetching}
          getRowId={(row) => row.id}
          minWidth={720}
          emptyState={{ description: "No websites match your filters." }}
          actionColumn={{
            label: "Actions",
            render: (row) => (
              <InquireTopicsTableActions
                row={{
                  websiteId: row.id,
                  websiteName: row.websiteName,
                  visitorTopicsConfigured: row.visitorTopicsConfigured,
                }}
                onEdit={() => router.push(topicsPath(row.id))}
              />
            ),
          }}
        />

        <Box sx={websiteAssignmentFooterRow}>
          <Typography variant="medium" sx={{ color: theme.app.dashboard.textMuted }}>
            {isLoading
              ? "Loading…"
              : `${rangeStart}–${rangeEnd} of ${total} · page ${page} of ${totalPages}`}
          </Typography>
          <Box sx={websiteAssignmentPaginationWrapper}>
            <TablePagination page={page} pageCount={totalPages} onPageChange={setPage} />
          </Box>
        </Box>
      </DashboardCard>
    </Box>
  );
}
