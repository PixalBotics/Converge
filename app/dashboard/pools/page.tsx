"use client";

import { useEffect, useMemo, useState } from "react";
import Box from "@mui/material/Box";
import { AttachMoney as AttachMoneyIcon } from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";
import type { SxProps, Theme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import {
  Typography,
  DashboardCard,
  Button,
  SelectField,
} from "@/components/common";
import type { DataTableColumn } from "@/components/common";
import { gradientPrimaryButtonSx } from "@/components/common/Button/Button.styles";
import {
  rolesCard,
  rolesIconBox,
  rolesPageWrapper,
} from "../roles/roles.styles";
import { pageWrapper } from "../companies/overview.styles";
import { departmentsCardHeader } from "../website-assigning/website-assigning.styles";
import { publishAppToast } from "@/lib/notify";
import { isRecord, pickNum, pickStr, unwrapApiData } from "@/lib/utils";
import {
  type HrmsPoolsListParams,
  useCompaniesListQuery,
  useCompaniesSetupResellersQuery,
  useCreatePoolMutation,
  useDeletePoolMutation,
  useDepartmentsListQuery,
  usePoolsListQuery,
  useUpdatePoolMutation,
} from "@/lib/hooks/query";
import { pickItemsArray, toIdNameOption } from "@/app/dashboard/user-page/components/add-user-modal.utils";
import { PoolModals, PoolsTableCard } from "./components";

const PAGE_LIMIT = 8;

export type PoolRow = {
  id: string;
  poolName: string;
  departmentName: string;
};

export default function PoolsPage() {
  const theme = useTheme() as AppTheme;
  const [resellerId, setResellerId] = useState("");
  const [parentCompanyId, setParentCompanyId] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [poolNameField, setPoolNameField] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<PoolRow | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<PoolRow | null>(null);
  const [editName, setEditName] = useState("");

  const resellersQuery = useCompaniesSetupResellersQuery({ enabled: true });
  const resellerOptions = useMemo(() => {
    const base = pickItemsArray(resellersQuery.data)
      .map(toIdNameOption)
      .filter((o): o is { value: string; label: string } => o !== null);
    return [{ value: "", label: "— Select reseller —" }, ...base];
  }, [resellersQuery.data]);

  const parentCompaniesQuery = useCompaniesListQuery(
    resellerId.trim()
      ? {
          all: true,
          view: "flat",
          resellerId: resellerId.trim(),
          rootOnly: true,
        }
      : undefined,
    { enabled: Boolean(resellerId.trim()) },
  );
  const parentCompanyOptions = useMemo(() => {
    const base = pickItemsArray(parentCompaniesQuery.data)
      .map(toIdNameOption)
      .filter((o): o is { value: string; label: string } => o !== null);
    return [{ value: "", label: "— Select parent company —" }, ...base];
  }, [parentCompaniesQuery.data]);

  const departmentsQuery = useDepartmentsListQuery(
    {
      all: true,
      ...(resellerId.trim() ? { resellerId: resellerId.trim() } : {}),
      ...(parentCompanyId.trim() ? { parentCompanyId: parentCompanyId.trim() } : {}),
    },
    { enabled: true, scope: "pools" },
  );
  const departmentOptions = useMemo(() => {
    const base = pickItemsArray(departmentsQuery.data)
      .map(toIdNameOption)
      .filter((o): o is { value: string; label: string } => o !== null);
    return [{ value: "", label: "— Select department —" }, ...base];
  }, [departmentsQuery.data]);

  const listParams = useMemo((): HrmsPoolsListParams => {
    const params: HrmsPoolsListParams = { page, limit: PAGE_LIMIT };
    if (appliedSearch.trim()) params.search = appliedSearch.trim();
    if (resellerId.trim()) params.resellerId = resellerId.trim();
    if (parentCompanyId.trim()) params.parentCompanyId = parentCompanyId.trim();
    if (departmentId.trim()) params.departmentId = departmentId.trim();
    return params;
  }, [appliedSearch, departmentId, page, parentCompanyId, resellerId]);

  const poolsQuery = usePoolsListQuery(listParams, { enabled: true, scope: "pools-page" });
  const createMutation = useCreatePoolMutation();
  const updateMutation = useUpdatePoolMutation();
  const deleteMutation = useDeletePoolMutation();

  const payload = unwrapApiData(poolsQuery.data);
  const payloadObj = isRecord(payload) ? payload : null;
  const items = useMemo(() => {
    if (!payloadObj) return [];
    const arr = payloadObj["items"];
    return Array.isArray(arr) ? (arr as unknown[]).filter(isRecord) : [];
  }, [payloadObj]);

  const totalEntries = useMemo(() => {
    const n = pickNum(payloadObj, ["total", "count", "totalCount"]);
    return n ?? items.length;
  }, [payloadObj, items.length]);

  const pageCount = useMemo(() => {
    const n = pickNum(payloadObj, ["totalPages"]);
    return n && n > 0 ? n : 1;
  }, [payloadObj]);

  useEffect(() => {
    setPage(1);
  }, [resellerId, parentCompanyId, departmentId]);

  useEffect(() => {
    setParentCompanyId("");
    setDepartmentId("");
  }, [resellerId]);

  useEffect(() => {
    setDepartmentId("");
  }, [parentCompanyId]);

  useEffect(() => {
    setPage((p) => (p > pageCount ? pageCount : p));
  }, [pageCount]);

  const tableRows = useMemo<PoolRow[]>(() => {
    return items.map((r) => ({
      id: pickStr(r, ["id"]) || "",
      poolName: pickStr(r, ["name", "poolName"]) || "—",
      departmentName: pickStr(isRecord(r["department"]) ? (r["department"] as Record<string, unknown>) : null, ["name"]) || "—",
    })).filter((r) => r.id);
  }, [items]);

  const footerRangeStart = tableRows.length > 0 ? (page - 1) * PAGE_LIMIT + 1 : 0;
  const footerRangeEnd = (page - 1) * PAGE_LIMIT + tableRows.length;

  const columns = useMemo<DataTableColumn<PoolRow>[]>(
    () => [
      { id: "poolName", label: "Pool Name" },
      { id: "departmentName", label: "Department" },
    ],
    [],
  );

  const resetForm = () => {
    setPoolNameField("");
  };

  const handleCancelForm = () => {
    resetForm();
  };

  const handleSavePool = (opts?: { onSuccess?: () => void }) => {
    const name = poolNameField.trim();
    if (!name) {
      publishAppToast({ variant: "error", message: "Please enter a pool name." });
      return;
    }
    if (!departmentId.trim()) {
      publishAppToast({ variant: "error", message: "Please select a department first." });
      return;
    }
    createMutation.mutate(
      { departmentId: departmentId.trim(), name },
      {
        onSuccess: () => {
          publishAppToast({ variant: "success", message: `Pool “${name}” saved.` });
          resetForm();
          opts?.onSuccess?.();
        },
        onError: () => publishAppToast({ variant: "error", message: "Could not create pool." }),
      },
    );
  };

  const handleClearFilters = () => {
    setResellerId("");
    setParentCompanyId("");
    setDepartmentId("");
    setSearchInput("");
    setAppliedSearch("");
    setPage(1);
  };

  return (
    <Box sx={[pageWrapper, rolesPageWrapper] as SxProps<Theme>}>
      <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 2, mb: 0.75 }}>
        <Box>
          <Typography variant="regularLarge" fontWeight={700} color="white">
            Pools
          </Typography>
          <Typography variant="body2" sx={{ mt: 0.75, color: theme.app.dashboard.textMuted, maxWidth: 720 }}>
            Create and manage pools by department.
          </Typography>
        </Box>

        <Button
          variant="primary"
          sx={gradientPrimaryButtonSx}
          disabled={deleteMutation.isPending}
          onClick={() => setCreateOpen(true)}
        >
          Add pool
        </Button>
      </Box>

      <DashboardCard sx={rolesCard}>
        <Box sx={departmentsCardHeader}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Box sx={rolesIconBox}>
              <AttachMoneyIcon sx={{ fontSize: 20, color: theme.app.dashboard.white95 }} />
            </Box>
            <Typography variant="mediumLarge" fontWeight={600} color="white">
              Filters
            </Typography>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Button variant="outlined" onClick={handleClearFilters}>
              Clear filters
            </Button>
          </Box>
        </Box>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1fr)" },
            gap: 1.5,
            mt: 2,
          }}
        >
          <SelectField
            label="Reseller"
            value={resellerId}
            onChange={setResellerId}
            options={resellerOptions}
            menuMaxRows={8}
          />
          <SelectField
            label="Parent company"
            value={parentCompanyId}
            onChange={setParentCompanyId}
            options={parentCompanyOptions}
            menuMaxRows={8}
            disabled={!resellerId.trim()}
          />
          <SelectField
            label="Department"
            value={departmentId}
            onChange={setDepartmentId}
            options={departmentOptions}
            menuMaxRows={8}
          />
        </Box>
      </DashboardCard>

      <PoolsTableCard
        rows={tableRows}
        columns={columns}
        isLoading={poolsQuery.isLoading || poolsQuery.isFetching}
        search={searchInput}
        onSearchChange={setSearchInput}
        onSearchSubmit={() => {
          setAppliedSearch(searchInput);
          setPage(1);
        }}
        page={page}
        pageCount={pageCount}
        footerText={
          poolsQuery.isLoading
            ? "Loading…"
            : `Showing data ${footerRangeStart} to ${footerRangeEnd} of ${totalEntries} entries`
        }
        onPageChange={setPage}
        onEdit={(row) => {
          setEditTarget(row);
          setEditName(row.poolName);
        }}
        onDelete={setDeleteTarget}
        disableActions={deleteMutation.isPending}
      />

      <PoolModals
        theme={theme}
        createOpen={createOpen}
        onCloseCreate={() => {
          if (createMutation.isPending) return;
          setCreateOpen(false);
          handleCancelForm();
        }}
        onSaveCreate={() => {
          handleSavePool({
            onSuccess: () => {
              setCreateOpen(false);
            },
          });
        }}
        isCreating={createMutation.isPending}
        departmentId={departmentId}
        onDepartmentIdChange={setDepartmentId}
        departmentOptions={departmentOptions}
        poolNameField={poolNameField}
        onPoolNameChange={setPoolNameField}
        editOpen={editTarget != null}
        onCloseEdit={() => {
          if (updateMutation.isPending) return;
          setEditTarget(null);
          setEditName("");
        }}
        onSaveEdit={() => {
          const target = editTarget;
          if (!target) return;
          const name = editName.trim();
          if (!name) {
            publishAppToast({ variant: "error", message: "Please enter a pool name." });
            return;
          }
          updateMutation.mutate(
            { id: target.id, body: { name } },
            {
              onSuccess: () => {
                publishAppToast({ variant: "success", message: "Pool updated." });
                setEditTarget(null);
              },
              onError: () => publishAppToast({ variant: "error", message: "Could not update pool." }),
            },
          );
        }}
        isEditing={updateMutation.isPending}
        editName={editName}
        onEditNameChange={setEditName}
        deleteOpen={deleteTarget != null}
        deleteDescription={deleteTarget ? `Delete pool “${deleteTarget.poolName}”?` : "Delete this pool?"}
        onCloseDelete={() => {
          if (deleteMutation.isPending) return;
          setDeleteTarget(null);
        }}
        onConfirmDelete={() => {
          const target = deleteTarget;
          if (!target) return;
          deleteMutation.mutate(target.id, {
            onSuccess: () => {
              publishAppToast({ variant: "success", message: "Pool deleted." });
              setDeleteTarget(null);
            },
            onError: () => publishAppToast({ variant: "error", message: "Could not delete pool." }),
          });
        }}
        isDeleting={deleteMutation.isPending}
      />
    </Box>
  );
}
