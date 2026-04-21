"use client";

import { useEffect, useMemo, useState } from "react";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import { Person as PersonIcon, Delete as DeleteIcon } from "@mui/icons-material";
import type { SxProps, Theme } from "@mui/material/styles";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import {
  Button,
  DashboardCard,
  DataTable,
  FormModal,
  SelectField,
  TablePagination,
  Typography,
  dataTableActionButton,
} from "@/components/common";
import type { DataTableColumn } from "@/components/common";
import { rolesCard, rolesFooterRow, rolesIconBox, rolesPageWrapper, rolesPaginationWrapper } from "../../roles/roles.styles";
import { footerMutedText, pageWrapper } from "../../companies/overview.styles";
import { publishAppToast } from "@/lib/notify";
import { isRecord, pickNum, pickStr, unwrapApiData } from "@/lib/utils";
import {
  useAssignPoolHeadMutation,
  useDepartmentsListQuery,
  usePoolHeadsListQuery,
  usePoolsListQuery,
  useRemovePoolHeadMutation,
  useUsersListQuery,
} from "@/lib/hooks/query";
import { pickItemsArray, toIdNameOption } from "@/app/dashboard/user-page/components/add-user-modal.utils";

const PAGE_LIMIT = 12;

type PoolHeadRow = {
  id: string;
  userName: string;
  userEmail: string;
  poolName: string;
  departmentName: string;
};

function extractItems(data: unknown): Record<string, unknown>[] {
  const payload = unwrapApiData(data);
  if (!payload) return [];
  if (Array.isArray(payload)) return payload.filter(isRecord);
  if (!isRecord(payload)) return [];
  const items = payload["items"];
  return Array.isArray(items) ? items.filter(isRecord) : [];
}

function extractTotal(data: unknown, fallback: number): number {
  const payload = unwrapApiData(data);
  if (!isRecord(payload)) return fallback;
  const n = pickNum(payload, ["total", "count", "totalCount"]);
  return n ?? fallback;
}

function extractTotalPages(data: unknown): number {
  const payload = unwrapApiData(data);
  if (!isRecord(payload)) return 1;
  const n = pickNum(payload, ["totalPages"]);
  return n && n > 0 ? n : 1;
}

export default function PoolHeadsPage() {
  const theme = useTheme() as AppTheme;

  const [departmentId, setDepartmentId] = useState("");
  const [poolId, setPoolId] = useState("");
  const [page, setPage] = useState(1);

  const [assignOpen, setAssignOpen] = useState(false);
  const [assignDepartmentId, setAssignDepartmentId] = useState("");
  const [assignPoolId, setAssignPoolId] = useState("");
  const [assignUserId, setAssignUserId] = useState("");

  const departmentsQuery = useDepartmentsListQuery({ all: true }, { enabled: true, scope: "pool-heads" });
  const departmentOptions = useMemo(() => {
    const base = pickItemsArray(departmentsQuery.data)
      .map(toIdNameOption)
      .filter((o): o is { value: string; label: string } => o !== null);
    return [{ value: "", label: departmentsQuery.isLoading ? "Loading departments…" : "— Select department —" }, ...base];
  }, [departmentsQuery.data, departmentsQuery.isLoading]);

  const poolsQuery = usePoolsListQuery(
    departmentId.trim() ? { departmentId: departmentId.trim(), all: true } : undefined,
    { enabled: true, scope: "pool-heads-pools" },
  );
  const poolOptions = useMemo(() => {
    const items = extractItems(poolsQuery.data);
    const base = items
      .map((r) => {
        const id = pickStr(r, ["id"]) || "";
        const name = pickStr(r, ["name", "poolName"]) || "";
        if (!id || !name) return null;
        return { value: id, label: name };
      })
      .filter((o): o is { value: string; label: string } => o !== null);
    return [{ value: "", label: poolsQuery.isLoading ? "Loading pools…" : "— Select pool —" }, ...base];
  }, [poolsQuery.data, poolsQuery.isLoading]);

  const assignPoolsQuery = usePoolsListQuery(
    assignDepartmentId.trim() ? { departmentId: assignDepartmentId.trim(), all: true } : undefined,
    { enabled: assignOpen, scope: "pool-heads-assign-pools" },
  );
  const assignPoolOptions = useMemo(() => {
    if (!assignDepartmentId.trim()) {
      return [{ value: "", label: "Select department first" }];
    }
    const items = extractItems(assignPoolsQuery.data);
    const base = items
      .map((r) => {
        const id = pickStr(r, ["id"]) || "";
        const name = pickStr(r, ["name", "poolName"]) || "";
        if (!id || !name) return null;
        return { value: id, label: name };
      })
      .filter((o): o is { value: string; label: string } => o !== null);
    return [{ value: "", label: assignPoolsQuery.isLoading ? "Loading pools…" : "— Select pool —" }, ...base];
  }, [assignDepartmentId, assignPoolsQuery.data, assignPoolsQuery.isLoading]);

  const assignUsersQuery = useUsersListQuery(
    assignDepartmentId.trim() ? { all: true, limit: 200, departmentId: assignDepartmentId.trim() } : undefined,
    { enabled: assignOpen && Boolean(assignDepartmentId.trim()) },
  );
  const assignUserOptions = useMemo(() => {
    if (!assignDepartmentId.trim()) {
      return [{ value: "", label: "Select department first" }];
    }
    const payload = unwrapApiData(assignUsersQuery.data);
    const users = Array.isArray(payload) ? payload.filter(isRecord) : extractItems(assignUsersQuery.data);
    const base = users
      .map((u) => {
        const id = pickStr(u, ["id"]) || "";
        const name = pickStr(u, ["name", "fullName", "userName"]) || "—";
        const email = pickStr(u, ["email"]) || "";
        if (!id) return null;
        return { value: id, label: email ? `${name} · ${email}` : name };
      })
      .filter((o): o is { value: string; label: string } => o !== null);
    return [{ value: "", label: assignUsersQuery.isLoading ? "Loading users…" : "— Select user —" }, ...base];
  }, [assignDepartmentId, assignUsersQuery.data, assignUsersQuery.isLoading]);

  const listQuery = usePoolHeadsListQuery(
    poolId.trim() ? { poolId: poolId.trim(), page, limit: PAGE_LIMIT } : undefined,
    { enabled: true, scope: "pool-heads-list" },
  );
  const assignMutation = useAssignPoolHeadMutation();
  const removeMutation = useRemovePoolHeadMutation();

  const items = useMemo(() => extractItems(listQuery.data), [listQuery.data]);
  const rows = useMemo<PoolHeadRow[]>(() => {
    return items
      .map((r, idx) => {
        const assignmentId = pickStr(r, ["id"]) || "";
        const user = isRecord(r["user"]) ? (r["user"] as Record<string, unknown>) : null;
        const pool = isRecord(r["pool"]) ? (r["pool"] as Record<string, unknown>) : null;
        const dept = isRecord(r["department"]) ? (r["department"] as Record<string, unknown>) : null;
        const userName = pickStr(user, ["name", "fullName", "userName"]) || pickStr(r, ["userName", "name"]) || "—";
        const userEmail = pickStr(user, ["email"]) || pickStr(r, ["userEmail", "email"]) || "—";
        const poolName = pickStr(pool, ["name"]) || pickStr(r, ["poolName"]) || "—";
        const departmentName = pickStr(dept, ["name"]) || pickStr(r, ["departmentName"]) || "—";
        return {
          id: assignmentId || `ph-${idx}`,
          userName,
          userEmail,
          poolName,
          departmentName,
        };
      })
      .filter((r) => r.id);
  }, [items]);

  const total = useMemo(() => extractTotal(listQuery.data, rows.length), [listQuery.data, rows.length]);
  const pageCount = useMemo(() => extractTotalPages(listQuery.data), [listQuery.data]);

  useEffect(() => {
    setPage(1);
    setPoolId("");
  }, [departmentId]);

  useEffect(() => {
    setPage(1);
  }, [poolId]);

  useEffect(() => {
    setPage((p) => (p > pageCount ? pageCount : p));
  }, [pageCount]);

  const footerRangeStart = rows.length > 0 ? (page - 1) * PAGE_LIMIT + 1 : 0;
  const footerRangeEnd = (page - 1) * PAGE_LIMIT + rows.length;

  const columns = useMemo<DataTableColumn<PoolHeadRow>[]>(
    () => [
      { id: "userName", label: "Head" },
      { id: "userEmail", label: "Email" },
      { id: "poolName", label: "Pool" },
      { id: "departmentName", label: "Department" },
    ],
    [],
  );

  const clearPageFilters = () => {
    setDepartmentId("");
    setPoolId("");
    setPage(1);
  };

  const clearAssignFilters = () => {
    setAssignDepartmentId("");
    setAssignPoolId("");
    setAssignUserId("");
  };

  return (
    <Box sx={[pageWrapper, rolesPageWrapper] as SxProps<Theme>}>
      <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 2, mb: 1 }}>
        <Box>
          <Typography variant="regularLarge" fontWeight={700} color="white">
            Pool Heads
          </Typography>
          <Typography variant="body2" sx={{ mt: 0.75, color: theme.app.dashboard.textMuted, maxWidth: 760 }}>
            Assign and manage pool heads. Users must belong to the selected department.
          </Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Button
            variant="primary"
            onClick={() => setAssignOpen(true)}
            disabled={assignMutation.isPending}
          >
            Assign Pool Head
          </Button>
        </Box>
      </Box>

      <DashboardCard sx={rolesCard}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box sx={rolesIconBox}>
            <PersonIcon sx={{ fontSize: 20, color: theme.app.dashboard.white95 }} />
          </Box>
          <Typography variant="mediumLarge" fontWeight={600} color="white">
            Filters
          </Typography>
        </Box>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "minmax(0,1fr) minmax(0,1fr) 180px" },
            gap: 1.5,
            mt: 2,
            alignItems: "end",
          }}
        >
          <SelectField
            label="Department"
            value={departmentId}
            onChange={setDepartmentId}
            options={departmentOptions}
            menuMaxRows={8}
          />
          <SelectField
            label="Pool"
            value={poolId}
            onChange={setPoolId}
            options={poolOptions}
            menuMaxRows={8}
            disabled={!departmentId.trim()}
          />
          <Button
            variant="secondary"
            disabled={!departmentId.trim() && !poolId.trim()}
            onClick={clearPageFilters}
          >
            Clear filters
          </Button>
        </Box>
      </DashboardCard>

      <DashboardCard sx={rolesCard}>
        <DataTable<PoolHeadRow>
          columns={columns}
          rows={rows}
          getRowId={(r) => r.id}
          minWidth={980}
          isLoading={listQuery.isLoading || listQuery.isFetching}
          actionColumn={{
            label: "Action",
            render: (row) => {
              const isDeletingThis = removeMutation.isPending && removeMutation.variables === row.id;
              return (
                <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                  <IconButton
                    size="small"
                    aria-label="Remove pool head"
                    disabled={!row.id || isDeletingThis}
                    onClick={() => {
                      if (!row.id) return;
                      removeMutation.mutate(row.id, {
                        onSuccess: () => publishAppToast({ variant: "success", message: "Removed pool head." }),
                        onError: () => publishAppToast({ variant: "error", message: "Could not remove pool head." }),
                      });
                    }}
                    sx={{ ...dataTableActionButton, color: theme.app.dashboard.accentRedLight }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
              );
            },
          }}
        />

        <Box sx={rolesFooterRow}>
          <Typography variant="medium" sx={footerMutedText(theme)}>
            {listQuery.isLoading
              ? "Loading…"
              : poolId.trim()
                ? `Showing data ${footerRangeStart} to ${footerRangeEnd} of ${total} entries`
                : "Select a pool to view assigned heads."}
          </Typography>
          <Box sx={rolesPaginationWrapper}>
            <TablePagination page={page} pageCount={pageCount} onPageChange={setPage} />
          </Box>
        </Box>
      </DashboardCard>

      <FormModal
        open={assignOpen}
        fitContent
        title="Assign pool head"
        description="Choose department and pool, then select a user to assign as pool head."
        onClose={() => {
          if (assignMutation.isPending) return;
          setAssignOpen(false);
        }}
        onSave={() => {
          const dept = assignDepartmentId.trim();
          const pool = assignPoolId.trim();
          const user = assignUserId.trim();
          if (!dept) {
            publishAppToast({ variant: "error", message: "Please select a department." });
            return;
          }
          if (!pool) {
            publishAppToast({ variant: "error", message: "Please select a pool." });
            return;
          }
          if (!user) {
            publishAppToast({ variant: "error", message: "Please select a user." });
            return;
          }
          assignMutation.mutate(
            { poolId: pool, userId: user },
            {
              onSuccess: () => {
                publishAppToast({ variant: "success", message: "Pool head assigned." });
                setAssignOpen(false);
                clearAssignFilters();
              },
              onError: () => publishAppToast({ variant: "error", message: "Could not assign pool head." }),
            },
          );
        }}
        primaryButtonDisabled={
          assignMutation.isPending ||
          !assignDepartmentId.trim() ||
          !assignPoolId.trim() ||
          !assignUserId.trim()
        }
        primaryButtonLabel={assignMutation.isPending ? "Assigning…" : "Assign"}
        cancelButtonLabel="Close"
        sx={{ borderRadius: 3 }}
      >
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "minmax(0,1fr) minmax(0,1fr)" },
            gap: 1.5,
            alignItems: "end",
          }}
        >
          <SelectField
            label="Department"
            value={assignDepartmentId}
            onChange={(v) => {
              setAssignDepartmentId(v);
              setAssignPoolId("");
              setAssignUserId("");
            }}
            options={departmentOptions}
            menuMaxRows={8}
          />
          <SelectField
            label="Pool"
            value={assignPoolId}
            onChange={(v) => {
              setAssignPoolId(v);
            }}
            options={assignPoolOptions}
            menuMaxRows={8}
            disabled={!assignDepartmentId.trim()}
          />
          <Box sx={{ gridColumn: { xs: "auto", sm: "1 / -1" } }}>
            <SelectField
              label="User"
              value={assignUserId}
              onChange={setAssignUserId}
              options={assignUserOptions}
              menuMaxRows={10}
              disabled={!assignDepartmentId.trim()}
            />
          </Box>
          <Box sx={{ gridColumn: { xs: "auto", sm: "1 / -1" }, display: "flex", justifyContent: "flex-end" }}>
            <Button variant="outlined" onClick={clearAssignFilters} disabled={assignMutation.isPending}>
              Clear filters
            </Button>
          </Box>
        </Box>
      </FormModal>
    </Box>
  );
}

