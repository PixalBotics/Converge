"use client";

import { useEffect, useMemo, useState } from "react";
import FilterList from "@mui/icons-material/FilterList";
import Language from "@mui/icons-material/Language";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import {
  DashboardCard,
  DataTable,
  SearchBar,
  SearchSubmitButton,
  TablePagination,
  ToolbarFilterPopover,
  Typography,
} from "@/components/common";
import type { DataTableColumn } from "@/components/common";
import { WebsiteAssignmentScopeFilterPanel } from "@/features/website-assignments/components/WebsiteAssignmentScopeFilterPanel";
import { useWebsiteAssignmentScopeFilters } from "@/features/website-assignments/hooks/useWebsiteAssignmentScopeFilters";
import { WebsiteUrlDisplay } from "@/features/website-assignments/components/WebsiteUrlDisplay";
import { useAuth } from "@/lib/auth";
import { canViewWebsiteDirectory } from "@/lib/permissions";
import { useWebsiteDirectoryQuery } from "@/lib/hooks";
import type { WebsiteDirectoryItem } from "@/api/types/companies.types";
import {
  websiteAssignmentFilterCard,
  websiteAssignmentFilterIconBox,
  websiteAssignmentFilterTitleRow,
  websiteAssignmentFooterRow,
  websiteAssignmentPageHeader,
  websiteAssignmentPageWrapper,
  websiteAssignmentPaginationWrapper,
  websiteAssignmentSearchFieldWrapper,
  websiteAssignmentSearchRow,
  websiteAssignmentTableCard,
  websiteAssignmentTableIconBox,
  websiteAssignmentTableToolbar,
} from "../website-assigning/website-assigning.styles";
import {
  overviewCard,
  overviewCardsRow,
  overviewStatValue,
} from "../user-page/overview.styles";

const PAGE_LIMIT = 20;

type Row = WebsiteDirectoryItem & Record<string, unknown>;

function unwrapDirectory(payload: unknown): {
  items: WebsiteDirectoryItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
} {
  const root =
    payload && typeof payload === "object" ? (payload as Record<string, unknown>) : null;
  const data =
    root?.data && typeof root.data === "object"
      ? (root.data as Record<string, unknown>)
      : root;
  const items = Array.isArray(data?.items) ? (data.items as WebsiteDirectoryItem[]) : [];
  const total = Number(data?.total ?? items.length) || 0;
  const limit = Number(data?.limit ?? PAGE_LIMIT) || PAGE_LIMIT;
  const totalPages = Math.max(
    1,
    Number(data?.totalPages ?? (Math.ceil(total / limit) || 1)),
  );
  return {
    items,
    total,
    page: Number(data?.page ?? 1) || 1,
    limit,
    totalPages,
  };
}

function PocCell({
  pocs,
  theme,
}: {
  pocs: WebsiteDirectoryItem["pocs"] | undefined;
  theme: AppTheme;
}) {
  if (!pocs?.length) {
    return (
      <Typography variant="body2" sx={{ color: theme.app.dashboard.textMuted }}>
        —
      </Typography>
    );
  }
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
      {pocs.map((poc) => (
        <Box key={poc.userId}>
          <Typography variant="body2" fontWeight={600}>
            {poc.name}
          </Typography>
          <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted }}>
            {poc.email}
          </Typography>
        </Box>
      ))}
    </Box>
  );
}

export default function WebsiteDirectoryPage() {
  const theme = useTheme() as AppTheme;
  const { hasPage, hasOperational } = useAuth();
  const canView = canViewWebsiteDirectory(hasPage, hasOperational);
  const scope = useWebsiteAssignmentScopeFilters();

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [filterPopoverOpen, setFilterPopoverOpen] = useState(false);
  const [page, setPage] = useState(1);

  const scopeFilters = useMemo(
    () => ({
      ...(scope.canFilterByResellerId && scope.filterResellerId.trim()
        ? { resellerId: scope.filterResellerId.trim() }
        : {}),
      ...(scope.filterParentCompanyId.trim()
        ? { parentCompanyId: scope.filterParentCompanyId.trim() }
        : {}),
      ...(scope.filterChildCompanyId.trim()
        ? { childCompanyId: scope.filterChildCompanyId.trim() }
        : {}),
    }),
    [
      scope.canFilterByResellerId,
      scope.filterResellerId,
      scope.filterParentCompanyId,
      scope.filterChildCompanyId,
    ],
  );

  useEffect(() => {
    setPage(1);
  }, [scope.filterResellerId, scope.filterParentCompanyId, scope.filterChildCompanyId]);

  const listParams = useMemo(
    () => ({
      page,
      limit: PAGE_LIMIT,
      search: search.trim() || undefined,
      ...scopeFilters,
    }),
    [page, search, scopeFilters],
  );

  const { data: response, isLoading, isFetching } = useWebsiteDirectoryQuery(listParams, {
    enabled: canView,
  });

  const payload = useMemo(() => unwrapDirectory(response), [response]);
  const rows = useMemo(() => payload.items as Row[], [payload.items]);

  const statsQuery = useWebsiteDirectoryQuery(
    {
      all: true,
      search: search.trim() || undefined,
      ...scopeFilters,
    },
    { enabled: canView },
  );
  const statsPayload = useMemo(() => unwrapDirectory(statsQuery.data), [statsQuery.data]);
  const statsItems = statsPayload.items;

  const uniqueResellers = useMemo(
    () => new Set(statsItems.map((r) => r.resellerId)).size,
    [statsItems],
  );
  const uniqueParents = useMemo(
    () => new Set(statsItems.map((r) => r.parentCompanyId)).size,
    [statsItems],
  );
  const uniqueChildren = useMemo(
    () => new Set(statsItems.map((r) => r.childCompanyId)).size,
    [statsItems],
  );

  const totalPages = payload.totalPages;
  const rangeStart = payload.total === 0 ? 0 : (page - 1) * payload.limit + 1;
  const rangeEnd = Math.min(page * payload.limit, payload.total);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const hasActiveFilters = Boolean(
    search.trim() ||
      scope.hasScopeFilters ||
      scope.filterParentCompanyId ||
      scope.filterChildCompanyId,
  );

  const clearAllFilters = () => {
    setSearchInput("");
    setSearch("");
    scope.clearScopeFilters();
    setPage(1);
  };

  const columns = useMemo((): DataTableColumn<Row>[] => {
    return [
      { id: "resellerName", label: "Reseller" },
      { id: "parentCompanyName", label: "Parent company" },
      { id: "childCompanyName", label: "Child company" },
      {
        id: "website",
        label: "Website",
        render: (_, row) => (
          <WebsiteUrlDisplay
            url={row.url}
            name={row.name !== "—" ? row.name : null}
          />
        ),
      },
      {
        id: "pocs",
        label: "POC",
        render: (_, row) => <PocCell pocs={row.pocs} theme={theme} />,
      },
      {
        id: "createdBy",
        label: "Created by",
        render: (_, row) => (
          <Box>
            <Typography variant="body2">{row.createdByName}</Typography>
            <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted }}>
              {row.createdByEmail}
            </Typography>
          </Box>
        ),
      },
      {
        id: "createdByRoleName",
        label: "Role (at creation)",
        render: (_, row) => (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
            <Typography variant="body2">{row.createdByRoleName}</Typography>
            <Chip
              label={row.createdByUserType}
              size="small"
              sx={{ alignSelf: "flex-start", height: 22, fontSize: "0.7rem" }}
            />
          </Box>
        ),
      },
      {
        id: "createdAt",
        label: "Created",
        cellVariant: "muted",
        render: (_, row) => (
          <Typography variant="body2" sx={{ color: theme.app.dashboard.textMuted }}>
            {row.createdAt ? new Date(row.createdAt).toLocaleDateString() : "—"}
          </Typography>
        ),
      },
    ];
  }, [theme]);

  if (!canView) {
    return (
      <Box sx={websiteAssignmentPageWrapper}>
        <Typography variant="regularLarge" fontWeight={400} color="white">
          Website directory
        </Typography>
        <Typography variant="body2" sx={{ mt: 1, color: theme.app.dashboard.textMuted }}>
          You do not have permission to view this page.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={websiteAssignmentPageWrapper}>
      <Box sx={websiteAssignmentPageHeader}>
        <Box>
          <Typography variant="regularLarge" fontWeight={400} color="white">
            Website directory
          </Typography>
          <Typography
            variant="medium"
            sx={{
              color: theme.app.dashboard.textMuted,
              mt: 0.25,
              display: "block",
              maxWidth: 640,
              lineHeight: "24px",
            }}
          >
            Reseller, parent and child company, POC, and who created each website.
          </Typography>
        </Box>
      </Box>

      <Box
        sx={{
          ...overviewCardsRow,
          gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", md: "repeat(4, 1fr)" },
          mb: 3,
        }}
      >
        <DashboardCard sx={overviewCard}>
          <Typography variant="mediumLarge" color="white" fontWeight={500}>
            Websites
          </Typography>
          <Box sx={overviewStatValue}>
            <Typography
              variant="h4"
              fontWeight={700}
              sx={{ color: theme.app.dashboard.accentBlue, lineHeight: 1.2 }}
            >
              {statsQuery.isLoading ? "…" : statsPayload.total}
            </Typography>
            <Typography variant="body2" sx={{ color: theme.app.dashboard.textMuted }}>
              / in scope
            </Typography>
          </Box>
        </DashboardCard>
        <DashboardCard sx={overviewCard}>
          <Typography variant="mediumLarge" color="white" fontWeight={500}>
            Resellers
          </Typography>
          <Box sx={overviewStatValue}>
            <Typography
              variant="h4"
              fontWeight={700}
              sx={{ color: theme.app.dashboard.accentBlue, lineHeight: 1.2 }}
            >
              {uniqueResellers}
            </Typography>
          </Box>
        </DashboardCard>
        <DashboardCard sx={overviewCard}>
          <Typography variant="mediumLarge" color="white" fontWeight={500}>
            Parent companies
          </Typography>
          <Box sx={overviewStatValue}>
            <Typography
              variant="h4"
              fontWeight={700}
              sx={{ color: theme.app.dashboard.accentBlue, lineHeight: 1.2 }}
            >
              {uniqueParents}
            </Typography>
          </Box>
        </DashboardCard>
        <DashboardCard sx={overviewCard}>
          <Typography variant="mediumLarge" color="white" fontWeight={500}>
            Child companies
          </Typography>
          <Box sx={overviewStatValue}>
            <Typography
              variant="h4"
              fontWeight={700}
              sx={{ color: theme.app.dashboard.accentBlue, lineHeight: 1.2 }}
            >
              {uniqueChildren}
            </Typography>
          </Box>
        </DashboardCard>
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
              placeholder="Search URL, website, company, reseller, POC, or creator…"
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
              <Language sx={{ fontSize: 20 }} />
            </Box>
            <Typography variant="mediumLarge" fontWeight={600}>
              Websites ({payload.total})
            </Typography>
            {isFetching ? (
              <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted }}>
                Updating…
              </Typography>
            ) : null}
          </Box>
        </Box>
        <DataTable<Row>
          columns={columns}
          rows={rows}
          getRowId={(row) => row.websiteId}
          isLoading={isLoading}
          minWidth={1100}
          emptyState={{
            title: "No websites",
            description: "No websites match your filters.",
          }}
        />
        <Box
          sx={{
            ...websiteAssignmentFooterRow,
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Typography variant="medium" sx={{ color: theme.app.dashboard.textMuted }}>
            {isLoading
              ? "Loading…"
              : payload.total === 0
                ? "No results."
                : `${rangeStart}–${rangeEnd} of ${payload.total} · page ${page} of ${totalPages}`}
          </Typography>
          <Box sx={websiteAssignmentPaginationWrapper}>
            <TablePagination page={page} pageCount={totalPages} onPageChange={setPage} />
          </Box>
        </Box>
      </DashboardCard>
    </Box>
  );
}
