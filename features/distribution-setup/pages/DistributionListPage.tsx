"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Add from "@mui/icons-material/Add";
import DeleteOutline from "@mui/icons-material/DeleteOutline";
import EditOutlined from "@mui/icons-material/EditOutlined";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
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
import type { DataTableColumn } from "@/components/common";
import { gradientPrimaryButtonSx } from "@/components/common/Button/Button.styles";
import {
  getDistributionSetup,
  type DistributionSetupListItem,
} from "@/api/distribution/distribution-setup.api";
import { DISTRIBUTION_ROUTES } from "../distribution.constants";
import {
  defaultEditWizardStep,
  distributionWizardStepHref,
} from "../utils/distribution-wizard-nav";
import { hydrateWizardFromDetail } from "../utils/hydrate-wizard-from-detail";
import { useAuth } from "@/lib/auth";
import { OP } from "@/lib/permissions/operational-keys";
import { publishAppToast } from "@/lib/notify";
import { extractApiErrorMessageForToast } from "@/lib/notify/extract-api-message";
import {
  integrationsFooterRow,
  integrationsPaginationWrapper,
} from "@/app/dashboard/integrations/integrations.styles";
import { useDistributionSetupsQuery } from "../hooks/useDistributionSetups";
import {
  useDeleteDistributionSetupMutation,
} from "../hooks/useDistributionSetupMutations";
import { clearWizardDraft } from "../wizard-storage";
import { DistributionListFilterPanel } from "../components/DistributionListFilterPanel";
import { useWebsiteAssignmentScopeFilters } from "@/features/website-assignments/hooks/useWebsiteAssignmentScopeFilters";

const PAGE_SIZE = 10;

type Row = DistributionSetupListItem & Record<string, unknown>;

export function DistributionListPage() {
  const theme = useTheme() as AppTheme;
  const router = useRouter();
  const { hasOperational } = useAuth();
  const canCreate = hasOperational(OP.distributionSetup.create);
  const canUpdate = hasOperational(OP.distributionSetup.update);
  const canDelete = hasOperational(OP.distributionSetup.delete);

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<Row | null>(null);
  const [filterPopoverOpen, setFilterPopoverOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState("");
  const scope = useWebsiteAssignmentScopeFilters();

  const listIsActive =
    filterStatus === "active" ? true : filterStatus === "draft" ? false : undefined;

  const listQuery = useDistributionSetupsQuery({
    page,
    limit: PAGE_SIZE,
    search: search.trim() || undefined,
    resellerId: scope.filterResellerId.trim() || undefined,
    parentCompanyId: scope.filterParentCompanyId.trim() || undefined,
    childCompanyId: scope.filterChildCompanyId.trim() || undefined,
    isActive: listIsActive,
  });

  const hasActiveFilters = Boolean(
    filterStatus.trim() || scope.hasScopeFilters,
  );

  const clearAllFilters = () => {
    scope.clearScopeFilters();
    setFilterStatus("");
  };

  useEffect(() => {
    setPage(1);
  }, [
    search,
    filterStatus,
    scope.filterResellerId,
    scope.filterParentCompanyId,
    scope.filterChildCompanyId,
  ]);

  const deleteMutation = useDeleteDistributionSetupMutation();

  const items = listQuery.data?.items ?? [];
  const total = listQuery.data?.total ?? 0;
  const totalPages = listQuery.data?.totalPages ?? 1;
  const rangeStart = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min(page * PAGE_SIZE, total);

  const columns = useMemo<DataTableColumn<Row>[]>(
    () => [
      { id: "clientOf", label: "Client of" },
      { id: "parentCompany", label: "Parent company" },
      { id: "childCompany", label: "Child company" },
      { id: "website", label: "Website" },
      { id: "disMethod", label: "Method" },
      { id: "department", label: "Departments" },
      {
        id: "isActive",
        label: "Status",
        render: (_v, row) => (
          <Typography
            variant="medium"
            sx={{
              color: row.isActive ? theme.palette.success.main : theme.palette.warning.main,
            }}
          >
            {row.isActive ? "Active" : "Draft"}
          </Typography>
        ),
      },
    ],
    [theme],
  );

  const handleAdd = () => {
    clearWizardDraft();
    router.push(DISTRIBUTION_ROUTES.configure);
  };

  const handleEdit = async (row: Row) => {
    try {
      const detail = await getDistributionSetup(row.id);
      hydrateWizardFromDetail(detail);
      const step = defaultEditWizardStep(row.isActive);
      router.push(distributionWizardStepHref(step, row.id));
    } catch (err) {
      publishAppToast({
        variant: "error",
        message: extractApiErrorMessageForToast(err, "Could not open distribution setup for edit."),
      });
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
      publishAppToast({ variant: "success", message: "Distribution setup removed." });
      setDeleteTarget(null);
    } catch (err) {
      publishAppToast({
        variant: "error",
        message: extractApiErrorMessageForToast(err, "Could not delete distribution setup."),
      });
    }
  };

  const actionColumn = useMemo(
    () => ({
      label: "Actions",
      render: (row: Row) => (
        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 0.5 }}>
          {canUpdate ? (
            <IconButton size="small" aria-label="Edit distribution" onClick={() => handleEdit(row)}>
              <EditOutlined fontSize="small" />
            </IconButton>
          ) : null}
          {canDelete ? (
            <IconButton
              size="small"
              aria-label="Delete distribution"
              onClick={() => setDeleteTarget(row)}
            >
              <DeleteOutline fontSize="small" />
            </IconButton>
          ) : null}
        </Box>
      ),
    }),
    [canUpdate, canDelete],
  );

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <DashboardCard sx={{ p: { xs: 2, md: 2.5 } }}>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, alignItems: "center", mb: 2 }}>
          <Box sx={{ flex: "1 1 240px", minWidth: 0 }}>
            <Typography fontWeight={700} sx={{ fontSize: 22, lineHeight: "22px", mb: 0.5 }}>
              Distribution
            </Typography>
            <Typography variant="medium" sx={{ color: theme.app.dashboard.textMuted }}>
              Configure transcript routing per website — departments, recipients, and delivery method.
            </Typography>
          </Box>
          {canCreate ? (
            <Button
              type="button"
              variant="primary"
              startIcon={<Add />}
              sx={gradientPrimaryButtonSx}
              onClick={handleAdd}
            >
              Add distribution
            </Button>
          ) : null}
        </Box>

        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: 1.5,
            alignItems: "center",
            justifyContent: "flex-end",
            mb: 2,
          }}
        >
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Search client, company, website, department…"
            sx={{ flex: "0 1 420px", minWidth: { xs: "100%", sm: 240 }, maxWidth: 420 }}
          />
          <ToolbarFilterPopover
            open={filterPopoverOpen}
            onOpenChange={setFilterPopoverOpen}
            active={hasActiveFilters}
          >
            <DistributionListFilterPanel
              {...scope}
              filterStatus={filterStatus}
              onFilterStatusChange={setFilterStatus}
              hasActiveFilters={hasActiveFilters}
              onClearAll={clearAllFilters}
              onClose={() => setFilterPopoverOpen(false)}
            />
          </ToolbarFilterPopover>
        </Box>

        {listQuery.isError ? (
          <Typography color="error">Could not load distribution setups.</Typography>
        ) : (
          <>
            <DataTable<Row>
              columns={columns}
              rows={items as Row[]}
              getRowId={(row) => row.id}
              actionColumn={canUpdate || canDelete ? actionColumn : undefined}
              minWidth={960}
            />
            <Box sx={integrationsFooterRow}>
              <Typography variant="medium" sx={{ color: theme.app.dashboard.textMuted }}>
                Showing {rangeStart} to {rangeEnd} of {total} entries
              </Typography>
              <Box sx={integrationsPaginationWrapper}>
                <TablePagination page={page} pageCount={Math.max(1, totalPages)} onPageChange={setPage} />
              </Box>
            </Box>
          </>
        )}
      </DashboardCard>

      <FormModal
        open={Boolean(deleteTarget)}
        title="Delete distribution setup?"
        description={
          deleteTarget
            ? `Remove routing for ${deleteTarget.website}? This cannot be undone.`
            : undefined
        }
        onClose={() => !deleteMutation.isPending && setDeleteTarget(null)}
        onSave={() => void handleDelete()}
        primaryButtonLabel={deleteMutation.isPending ? "Deleting…" : "Delete"}
        primaryButtonVariant="danger"
        primaryButtonDisabled={deleteMutation.isPending || !canDelete}
        cancelButtonLabel="Cancel"
        maxWidth={480}
      />
    </Box>
  );
}
