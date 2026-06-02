"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Add from "@mui/icons-material/Add";
import FilterList from "@mui/icons-material/FilterList";
import Schedule from "@mui/icons-material/Schedule";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import {
  Button,
  ConfirmActionModal,
  DashboardCard,
  DataTable,
  SearchBar,
  TablePagination,
  ToolbarFilterPopover,
  Typography,
} from "@/components/common";
import { deleteServiceScheduling } from "@/services/chat/service-scheduling.api";
import { extractApiErrorMessageForToast, publishAppToast } from "@/lib/notify";
import { useQueryClient } from "@tanstack/react-query";
import { websiteAssignmentsKeys } from "@/lib/hooks/query/website-assignments/keys";
import type { DataTableColumn } from "@/components/common";
import { gradientPrimaryButtonSx } from "@/components/common/Button/Button.styles";
import { ServiceScheduleTableActions } from "@/features/website-assignments/components/ServiceScheduleTableActions";
import { WebsiteAssignmentScopeFilterPanel } from "@/features/website-assignments/components/WebsiteAssignmentScopeFilterPanel";
import { useWebsiteAssignmentScopeFilters } from "@/features/website-assignments/hooks/useWebsiteAssignmentScopeFilters";
import {
  SCHEDULING_FILTER_OPTIONS,
  parseSchedulingFilter,
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

type ScheduleRow = {
  id: string;
  websiteName: string;
  websiteUrl: string;
  parentCompany: string;
  childCompany: string;
  serviceSchedulingConfigured: boolean;
};

function itemToRow(item: WebsiteAssignmentScopeItem): ScheduleRow {
  const name = (item.name ?? "").trim();
  const url = (item.url ?? "").trim();
  return {
    id: item.websiteId,
    websiteName: name,
    websiteUrl: url || "—",
    parentCompany: item.parentCompanyName || "—",
    childCompany: item.childCompanyName || "—",
    serviceSchedulingConfigured: Boolean(item.serviceSchedulingConfigured),
  };
}

export default function ServiceSchedulesPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const theme = useTheme() as AppTheme;
  const gates = useWebsiteAssignmentGates();
  const scope = useWebsiteAssignmentScopeFilters();

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [filterScheduling, setFilterScheduling] = useState("");
  const [filterPopoverOpen, setFilterPopoverOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<ScheduleRow | null>(null);
  const [deleting, setDeleting] = useState(false);

  const schedulingParam = useMemo(
    () => parseSchedulingFilter(filterScheduling),
    [filterScheduling],
  );

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
        serviceSchedulingConfigured: schedulingParam,
      }),
    [
      scope.canFilterByResellerId,
      scope.filterResellerId,
      scope.filterParentCompanyId,
      scope.filterChildCompanyId,
      page,
      search,
      schedulingParam,
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
    filterScheduling ||
      scope.hasScopeFilters ||
      search.trim(),
  );

  useEffect(() => {
    setPage(1);
  }, [
    search,
    filterScheduling,
    scope.filterResellerId,
    scope.filterParentCompanyId,
    scope.filterChildCompanyId,
  ]);

  useEffect(() => {
    if (searchInput.trim().length > 0) return;
    if (!search.trim()) return;
    setSearch("");
  }, [searchInput, search]);

  const columns = useMemo<DataTableColumn<ScheduleRow>[]>(
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
        id: "status",
        label: "Schedule status",
        render: (_, row) =>
          row.serviceSchedulingConfigured ? (
            <Chip
              label="Ready for agents"
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
          ),
      },
    ],
    [theme],
  );

  const schedulingPath = (websiteId: string) =>
    `/dashboard/website-assigning/website/${encodeURIComponent(websiteId)}/service-scheduling`;

  const handleDeleteSchedule = async () => {
    if (!deleteTarget || !gates.assign) return;
    setDeleting(true);
    try {
      await deleteServiceScheduling(deleteTarget.id);
      void queryClient.invalidateQueries({ queryKey: websiteAssignmentsKeys.all });
      publishAppToast({ message: "Service schedule removed.", variant: "success" });
      setDeleteTarget(null);
    } catch (e) {
      publishAppToast({
        message: extractApiErrorMessageForToast(e, "Could not delete service schedule"),
        variant: "error",
      });
    } finally {
      setDeleting(false);
    }
  };

  const clearAllFilters = () => {
    setFilterScheduling("");
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
            Service scheduling
          </Typography>
          <Typography variant="medium" sx={{ color: theme.app.dashboard.textMuted, maxWidth: 640 }}>
            Step 1: set operating mode, service hours, and visitor topics per website. Step 2: assign
            agents when status is ready.
          </Typography>
        </Box>
        <Box sx={websiteAssignmentHeaderActions}>
          {gates.assign ? (
            <Button
              type="button"
              variant="primary"
              sx={gradientPrimaryButtonSx}
              startIcon={<Add sx={{ fontSize: 18 }} />}
              onClick={() => router.push("/dashboard/website-assigning/service-schedules/add")}
            >
              Add schedule
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
          <Button
            type="button"
            variant="primary"
            disabled={searchInput.trim() === search.trim()}
            onClick={() => {
              setSearch(searchInput.trim());
              setPage(1);
            }}
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
              showSchedulingFilter
              filterScheduling={filterScheduling}
              onFilterSchedulingChange={setFilterScheduling}
              schedulingOptions={[...SCHEDULING_FILTER_OPTIONS]}
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
              <Schedule sx={{ fontSize: 20, color: theme.app.dashboard.iconMuted }} />
            </Box>
            <Typography variant="mediumLarge" color="white" fontWeight={600}>
              Websites ({total})
            </Typography>
          </Box>
        </Box>

        <DataTable<ScheduleRow>
          columns={columns}
          rows={rows}
          isLoading={isLoading || isFetching}
          getRowId={(row) => row.id}
          minWidth={720}
          emptyState={{ description: "No websites match your filters." }}
          actionColumn={{
            label: "Actions",
            render: (row) => (
              <ServiceScheduleTableActions
                row={{
                  websiteId: row.id,
                  websiteName: row.websiteName,
                  serviceSchedulingConfigured: row.serviceSchedulingConfigured,
                }}
                canEdit={gates.assign}
                onEdit={() => router.push(schedulingPath(row.id))}
                onDelete={() => setDeleteTarget(row)}
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
            <TablePagination
              page={page}
              pageCount={totalPages}
              onPageChange={setPage}
            />
          </Box>
        </Box>
      </DashboardCard>

      <ConfirmActionModal
        open={Boolean(deleteTarget)}
        title="Delete service schedule?"
        description={
          deleteTarget
            ? `Remove service hours and visitor topics for ${deleteTarget.websiteName} only. Agent assignments are kept.`
            : ""
        }
        confirmLabel={deleting ? "Deleting…" : "Delete schedule"}
        cancelLabel="Cancel"
        confirmButtonVariant="danger"
        onDismiss={() => !deleting && setDeleteTarget(null)}
        onConfirm={() => void handleDeleteSchedule()}
        isLoading={deleting}
      />

    </Box>
  );
}
