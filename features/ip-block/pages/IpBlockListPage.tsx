"use client";

import { useEffect, useMemo, useState } from "react";
import Add from "@mui/icons-material/Add";
import Block from "@mui/icons-material/Block";
import EditIcon from "@mui/icons-material/Edit";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import { useTheme } from "@mui/material/styles";
import { useRouter } from "next/navigation";
import type { AppTheme } from "@/theme/theme";
import type { IpBlockListItem } from "@/api/ip-block/ip-block.api";
import {
  Button,
  DashboardCard,
  DataTable,
  EditIpBlockModal,
  UnblockIpConfirmModal,
  SearchBar,
  TablePagination,
  ToolbarFilterPopover,
  Typography,
  dataTableActionButton,
} from "@/components/common";
import type { DataTableColumn } from "@/components/common";
import { gradientPrimaryButtonSx } from "@/components/common/Button/Button.styles";
import {
  integrationsFooterRow,
  integrationsPaginationWrapper,
} from "@/app/dashboard/integrations/integrations.styles";
import { useAuth } from "@/lib/auth";
import { OP } from "@/lib/permissions/operational-keys";
import { publishAppToast } from "@/lib/notify";
import { extractApiErrorMessageForToast } from "@/lib/notify/extract-api-message";
import { useWebsiteAssignmentScopeFilters } from "@/features/website-assignments/hooks/useWebsiteAssignmentScopeFilters";
import { IpBlockListFilterPanel } from "../components/IpBlockListFilterPanel";
import { IP_BLOCK_ROUTES } from "../ip-block.constants";
import { useIpBlocksQuery } from "../hooks/useIpBlocksQuery";
import {
  useDeleteIpBlockMutation,
  useUpdateIpBlockMutation,
} from "../hooks/useIpBlockMutations";
import { clearIpBlockWizardDraft } from "../wizard-storage";

const PAGE_SIZE = 18;

type IpBlockRow = IpBlockListItem & Record<string, unknown>;

function formatBlockedDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function IpBlockListPage() {
  const router = useRouter();
  const theme = useTheme() as AppTheme;
  const { hasOperational } = useAuth();
  const canCreate = hasOperational(OP.ipBlocklist.create);
  const canUpdate = hasOperational(OP.ipBlocklist.update);
  const canDelete = hasOperational(OP.ipBlocklist.delete);

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [filterPopoverOpen, setFilterPopoverOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState("");
  const [editOpen, setEditOpen] = useState(false);
  const [editingRow, setEditingRow] = useState<IpBlockRow | null>(null);
  const [unblockOpen, setUnblockOpen] = useState(false);
  const [unblockRow, setUnblockRow] = useState<IpBlockRow | null>(null);

  const scope = useWebsiteAssignmentScopeFilters();

  const listIsActive =
    filterStatus === "active" ? true : filterStatus === "inactive" ? false : undefined;

  const listQuery = useIpBlocksQuery({
    page,
    limit: PAGE_SIZE,
    search: search.trim() || undefined,
    resellerId: scope.filterResellerId.trim() || undefined,
    parentCompanyId: scope.filterParentCompanyId.trim() || undefined,
    childCompanyId: scope.filterChildCompanyId.trim() || undefined,
    isActive: listIsActive,
    status: filterStatus === "active" ? "block" : undefined,
  });

  const updateMutation = useUpdateIpBlockMutation();
  const deleteMutation = useDeleteIpBlockMutation();

  const items = listQuery.data?.items ?? [];
  const total = listQuery.data?.total ?? 0;
  const totalPages = listQuery.data?.totalPages ?? 1;
  const rangeStart = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min(page * PAGE_SIZE, total);

  const hasActiveFilters = Boolean(filterStatus.trim() || scope.hasScopeFilters);

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

  const columns = useMemo<DataTableColumn<IpBlockRow>[]>(
    () => [
      { id: "clientInfo", label: "Client of" },
      { id: "parentCompany", label: "Parent company" },
      { id: "childCompany", label: "Child company" },
      { id: "website", label: "Website" },
      { id: "ipAddress", label: "IP address", cellVariant: "muted" },
      {
        id: "blockedDate",
        label: "Blocked date",
        cellVariant: "muted",
        render: (_v, row) => formatBlockedDate(String(row.blockedDate)),
      },
      { id: "blockedBy", label: "Blocked by", cellVariant: "muted" },
      {
        id: "isActive",
        label: "Status",
        render: (_v, row) => {
          const active = row.isActive && row.status === "block";
          return (
            <Typography
              variant="medium"
              sx={{
                color: active ? theme.palette.success.main : theme.palette.warning.main,
              }}
            >
              {active ? "Active" : row.isActive ? row.status : "Inactive"}
            </Typography>
          );
        },
      },
    ],
    [theme],
  );

  const actionColumn = useMemo(
    () => ({
      label: "Actions",
      render: (row: IpBlockRow) => (
        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 0.5 }}>
          {canUpdate ? (
            <IconButton
              size="small"
              sx={dataTableActionButton}
              aria-label="Edit IP block"
              onClick={() => {
                setEditingRow(row);
                setEditOpen(true);
              }}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          ) : null}
          {canDelete ? (
            <IconButton
              size="small"
              sx={{
                ...dataTableActionButton,
                color: theme.app.dashboard.accentRedLight,
              }}
              aria-label="Unblock IP"
              onClick={() => {
                setUnblockRow(row);
                setUnblockOpen(true);
              }}
            >
              <Block fontSize="small" />
            </IconButton>
          ) : null}
        </Box>
      ),
    }),
    [canUpdate, canDelete, theme.app.dashboard.accentRedLight],
  );

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <DashboardCard sx={{ p: { xs: 2, md: 2.5 } }}>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, alignItems: "center", mb: 2 }}>
          <Box sx={{ flex: "1 1 240px", minWidth: 0 }}>
            <Typography fontWeight={700} sx={{ fontSize: 22, lineHeight: "22px", mb: 0.5 }}>
              IP block list
            </Typography>
            <Typography variant="medium" sx={{ color: theme.app.dashboard.textMuted }}>
              Block visitor IPs per website — blocked addresses cannot start or continue widget chat.
            </Typography>
          </Box>
          {canCreate ? (
            <Button
              type="button"
              variant="primary"
              startIcon={<Add />}
              sx={gradientPrimaryButtonSx}
              onClick={() => {
                clearIpBlockWizardDraft();
                router.push(IP_BLOCK_ROUTES.addOrg);
              }}
            >
              Add IP block
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
            placeholder="Search client, company, website, IP…"
            sx={{ flex: "0 1 420px", minWidth: { xs: "100%", sm: 240 }, maxWidth: 420 }}
          />
          <ToolbarFilterPopover
            open={filterPopoverOpen}
            onOpenChange={setFilterPopoverOpen}
            active={hasActiveFilters}
          >
            <IpBlockListFilterPanel
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
          <Typography color="error">Could not load IP blocks.</Typography>
        ) : (
          <>
            <DataTable<IpBlockRow>
              columns={columns}
              rows={items as IpBlockRow[]}
              getRowId={(row) => row.id}
              actionColumn={canUpdate || canDelete ? actionColumn : undefined}
              minWidth={1120}
              isLoading={listQuery.isLoading}
            />
            <Box sx={integrationsFooterRow}>
              <Typography variant="medium" sx={{ color: theme.app.dashboard.textMuted }}>
                Showing {rangeStart} to {rangeEnd} of {total} entries
              </Typography>
              <Box sx={integrationsPaginationWrapper}>
                <TablePagination
                  page={page}
                  pageCount={Math.max(1, totalPages)}
                  onPageChange={setPage}
                />
              </Box>
            </Box>
          </>
        )}
      </DashboardCard>

      <EditIpBlockModal
        open={editOpen}
        onClose={() => {
          setEditOpen(false);
          setEditingRow(null);
        }}
        initialIpAddress={editingRow?.ipAddress}
        initialReason={editingRow?.reason ?? ""}
        initialStatus={editingRow?.status ?? "block"}
        onSave={async (payload) => {
          if (!editingRow) return;
          try {
            await updateMutation.mutateAsync({
              id: editingRow.id,
              body: payload,
            });
            publishAppToast({ message: "IP block updated.", variant: "success" });
            setEditOpen(false);
            setEditingRow(null);
          } catch (err) {
            publishAppToast({
              message: extractApiErrorMessageForToast(err, "Could not update IP block."),
              variant: "error",
            });
          }
        }}
      />

      <UnblockIpConfirmModal
        open={unblockOpen}
        onDismiss={() => {
          setUnblockOpen(false);
          setUnblockRow(null);
        }}
        onConfirm={async () => {
          if (!unblockRow) return;
          try {
            await deleteMutation.mutateAsync(unblockRow.id);
            publishAppToast({ message: "IP unblocked.", variant: "success" });
            setUnblockOpen(false);
            setUnblockRow(null);
          } catch (err) {
            publishAppToast({
              message: extractApiErrorMessageForToast(err, "Could not unblock IP."),
              variant: "error",
            });
          }
        }}
      />
    </Box>
  );
}
