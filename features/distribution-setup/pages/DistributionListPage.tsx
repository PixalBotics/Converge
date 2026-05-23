"use client";

import { useMemo, useState } from "react";
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
  Typography,
} from "@/components/common";
import type { DataTableColumn } from "@/components/common";
import { gradientPrimaryButtonSx } from "@/components/common/Button/Button.styles";
import type { DistributionSetupListItem } from "@/api/distribution/distribution-setup.api";
import { DISTRIBUTION_ROUTES } from "../distribution.constants";
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
import { clearWizardDraft, writeWizardSetupId } from "../wizard-storage";

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

  const listQuery = useDistributionSetupsQuery({
    page,
    limit: PAGE_SIZE,
    search: search.trim() || undefined,
  });

  const deleteMutation = useDeleteDistributionSetupMutation();

  const items = listQuery.data?.items ?? [];
  const total = listQuery.data?.total ?? 0;
  const totalPages = listQuery.data?.totalPages ?? 1;
  const rangeStart = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min(page * PAGE_SIZE, total);

  const columns = useMemo<DataTableColumn<Row>[]>(
    () => [
      { key: "clientOf", header: "Client of", accessor: "clientOf" },
      { key: "parentCompany", header: "Parent company", accessor: "parentCompany" },
      { key: "childCompany", header: "Child company", accessor: "childCompany" },
      { key: "website", header: "Website", accessor: "website" },
      { key: "disMethod", header: "Method", accessor: "disMethod" },
      { key: "department", header: "Departments", accessor: "department" },
      {
        key: "isActive",
        header: "Status",
        render: (row) => (
          <Typography variant="medium" sx={{ color: row.isActive ? theme.palette.success.main : theme.app.dashboard.textMuted }}>
            {row.isActive ? "Active" : "Inactive"}
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

  const handleEdit = (row: Row) => {
    clearWizardDraft();
    writeWizardSetupId(row.id);
    router.push(`${DISTRIBUTION_ROUTES.settings}?setupId=${encodeURIComponent(row.id)}`);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
      publishAppToast({ message: "Distribution setup removed.", severity: "success" });
      setDeleteTarget(null);
    } catch (err) {
      publishAppToast({
        message: extractApiErrorMessageForToast(err, "Could not delete distribution setup."),
        severity: "error",
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
            <Typography fontWeight={700} sx={{ fontSize: 18, mb: 0.5 }}>
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

        <SearchBar
          value={search}
          onChange={(v) => {
            setSearch(v);
            setPage(1);
          }}
          placeholder="Search client, company, website, department…"
          sx={{ mb: 2, maxWidth: 420 }}
        />

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
