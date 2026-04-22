"use client";

import { useEffect, useMemo, useState } from "react";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Chip from "@mui/material/Chip";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { Groups as GroupsIcon } from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import {
  Button,
  ConfirmActionModal,
  DashboardCard,
  DataTable,
  FormModal,
  SearchBar,
  SelectField,
  TablePagination,
  Typography,
  dataTableActionButton,
} from "@/components/common";
import type { DataTableColumn } from "@/components/common";
import { publishAppToast } from "@/lib/notify";
import { useDepartmentPoolMembersMerged, type MergedPoolMemberRow } from "@/lib/hooks/query/hrms/pool-members/use-department-pool-members-merged";
import {
  useMovePoolMemberMutation,
  usePoolsListQuery,
  useRemovePoolMemberMutation,
} from "@/lib/hooks/query";
import { pickItemsArray } from "@/app/dashboard/user-page/components/add-user-modal.utils";
import { isRecord, pickStr, unwrapApiData } from "@/lib/utils";
import {
  rolesCard,
  rolesFooterRow,
  rolesIconBox,
  rolesPaginationWrapper,
} from "@/app/dashboard/roles/roles.styles";
import { footerMutedText } from "@/app/dashboard/companies/overview.styles";
import { PoolTeamAttendanceSection } from "./PoolTeamAttendanceSection";
import {
  departmentsCardHeader,
  departmentsSearchFieldWrapper,
  departmentsSearchRow,
} from "@/app/dashboard/website-assigning/website-assigning.styles";

const PAGE_LIMIT = 10;

export type UnifiedPoolMembersCardProps = {
  departmentId: string;
  active: boolean;
  canMove: boolean;
  canRemove: boolean;
};

export function UnifiedPoolMembersCard({ departmentId, active, canMove, canRemove }: UnifiedPoolMembersCardProps) {
  const theme = useTheme() as AppTheme;
  const dept = departmentId.trim();

  const [searchInput, setSearchInput] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [page, setPage] = useState(1);

  const { mergedRows, total, totalPages, isLoading, isFetching } = useDepartmentPoolMembersMerged(
    dept,
    active,
    {
      search: appliedSearch.trim() || undefined,
      page,
      pageSize: PAGE_LIMIT,
    },
  );

  const [moveOpen, setMoveOpen] = useState(false);
  const [moveRow, setMoveRow] = useState<MergedPoolMemberRow | null>(null);
  const [targetPoolId, setTargetPoolId] = useState("");
  const [removeRow, setRemoveRow] = useState<MergedPoolMemberRow | null>(null);
  const [attendancePoolId, setAttendancePoolId] = useState("");

  const moveMutation = useMovePoolMemberMutation();
  const removeMutation = useRemovePoolMemberMutation();

  const poolsDeptForQueries =
    dept || (moveOpen && moveRow?.departmentId ? moveRow.departmentId.trim() : "");

  const poolsInDeptQuery = usePoolsListQuery(
    poolsDeptForQueries ? { departmentId: poolsDeptForQueries, all: true } : undefined,
    { enabled: active && Boolean(poolsDeptForQueries) },
  );

  const deptPoolSelectOptions = useMemo(() => {
    return pickItemsArray(unwrapApiData(poolsInDeptQuery.data))
      .map((r) => {
        if (!isRecord(r)) return null;
        const id = pickStr(r, ["id"]) || "";
        const name = pickStr(r, ["name", "poolName"]) || "";
        if (!id) return null;
        return { value: id, label: name };
      })
      .filter((o): o is { value: string; label: string } => o !== null);
  }, [poolsInDeptQuery.data]);

  const movePoolOptions = useMemo(() => {
    return [
      { value: "", label: poolsInDeptQuery.isLoading ? "Loading pools…" : "— Target pool —" },
      ...deptPoolSelectOptions,
    ];
  }, [deptPoolSelectOptions, poolsInDeptQuery.isLoading]);

  const attendancePoolOptions = useMemo(() => {
    return [
      { value: "", label: poolsInDeptQuery.isLoading ? "Loading pools…" : "— Select pool for attendance —" },
      ...deptPoolSelectOptions,
    ];
  }, [deptPoolSelectOptions, poolsInDeptQuery.isLoading]);

  const attendancePoolLabel = useMemo(() => {
    const id = attendancePoolId.trim();
    if (!id) return "";
    const row = mergedRows.find((r) => r.poolId === id);
    if (row) return `${row.poolName} · ${row.departmentName}`;
    return attendancePoolOptions.find((o) => o.value === id)?.label ?? id;
  }, [attendancePoolId, attendancePoolOptions, mergedRows]);

  const pageCount = totalPages;
  const safePage = Math.min(page, Math.max(1, pageCount));

  useEffect(() => {
    setPage((p) => (p > pageCount ? pageCount : p));
  }, [pageCount]);

  useEffect(() => {
    setAttendancePoolId("");
    setSearchInput("");
    setAppliedSearch("");
    setPage(1);
  }, [dept]);

  useEffect(() => {
    if (!attendancePoolId.trim()) return;
    const still = deptPoolSelectOptions.some((o) => o.value === attendancePoolId);
    if (!still) setAttendancePoolId("");
  }, [attendancePoolId, deptPoolSelectOptions]);

  const columns = useMemo<DataTableColumn<MergedPoolMemberRow>[]>(
    () => [
      { id: "poolName", label: "Pool" },
      { id: "departmentName", label: "Department" },
      { id: "memberName", label: "Member" },
      { id: "email", label: "Email" },
      {
        id: "isPoolHead",
        label: "Role",
        render: (_v, row) =>
          row.isPoolHead ? (
            <Chip size="small" label="Pool head" color="primary" variant="outlined" sx={{ borderColor: "rgba(255,255,255,0.35)" }} />
          ) : (
            <Typography variant="body2" sx={{ color: theme.app.dashboard.textMuted }}>
              Member
            </Typography>
          ),
      },
    ],
    [theme],
  );

  const openMove = (row: MergedPoolMemberRow) => {
    setMoveRow(row);
    setTargetPoolId("");
    setMoveOpen(true);
  };

  const confirmMove = () => {
    if (!moveRow || !targetPoolId.trim() || targetPoolId === moveRow.poolId) {
      publishAppToast({ variant: "error", message: "Pick a different pool in this department." });
      return;
    }
    moveMutation.mutate(
      { poolId: moveRow.poolId, userId: moveRow.userId, targetPoolId: targetPoolId.trim() },
      {
        onSuccess: () => {
          publishAppToast({ variant: "success", message: "Member moved." });
          setMoveOpen(false);
          setMoveRow(null);
        },
        onError: () => publishAppToast({ variant: "error", message: "Could not move member." }),
      },
    );
  };

  const confirmRemove = () => {
    if (!removeRow) return;
    removeMutation.mutate(
      { poolId: removeRow.poolId, userId: removeRow.userId },
      {
        onSuccess: () => {
          publishAppToast({ variant: "success", message: "Removed from pool." });
          setRemoveRow(null);
        },
        onError: () => publishAppToast({ variant: "error", message: "Could not remove member." }),
      },
    );
  };

  const busy = moveMutation.isPending || removeMutation.isPending;
  const rangeStart = total > 0 && mergedRows.length > 0 ? (safePage - 1) * PAGE_LIMIT + 1 : 0;
  const rangeEnd = (safePage - 1) * PAGE_LIMIT + mergedRows.length;

  return (
    <>
      <DashboardCard sx={rolesCard}>
        <Box sx={departmentsCardHeader}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Box sx={rolesIconBox}>
              <GroupsIcon sx={{ fontSize: 20, color: theme.app.dashboard.white95 }} />
            </Box>
            <Typography variant="mediumLarge" fontWeight={600} color="white">
              Pools & members
            </Typography>
          </Box>
          <Box sx={departmentsSearchRow}>
            <Box sx={departmentsSearchFieldWrapper}>
              <SearchBar
                value={searchInput}
                onChange={setSearchInput}
                placeholder="Member name or email…"
              />
            </Box>
            <Button
              variant="outlined"
              disabled={isLoading || isFetching}
              onClick={() => {
                setAppliedSearch(searchInput);
                setPage(1);
              }}
            >
              Search
            </Button>
          </Box>
        </Box>

        {!dept ? (
          <Typography variant="body2" sx={{ mt: 1.5, mb: 1, color: theme.app.dashboard.textMuted }}>
            Showing pool members in your scope. Use the department filter above to narrow the list and to pick pools for
            team attendance.
          </Typography>
        ) : null}
        <DataTable<MergedPoolMemberRow>
          columns={columns}
          rows={mergedRows}
          isLoading={isLoading || isFetching}
          getRowId={(row) => row.rowKey}
          minWidth={720}
          scrollY={false}
          actionColumn={{
            label: "Action",
            render: (row) => (
              <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 0.5 }} onClick={(e) => e.stopPropagation()}>
                <IconButton
                  size="small"
                  sx={dataTableActionButton}
                  aria-label="Edit (move to another pool)"
                  disabled={busy || !canMove}
                  onClick={() => openMove(row)}
                >
                  <EditIcon fontSize="small" />
                </IconButton>
                <IconButton
                  size="small"
                  sx={{ ...dataTableActionButton, color: theme.app.dashboard.accentRedLight }}
                  aria-label="Delete (remove from pool)"
                  disabled={busy || !canRemove}
                  onClick={() => setRemoveRow(row)}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Box>
            ),
          }}
        />
        <Box sx={rolesFooterRow}>
          <Typography variant="medium" sx={footerMutedText(theme)}>
            {isLoading ? "Loading…" : `Showing ${rangeStart}–${rangeEnd} of ${total} members`}
          </Typography>
          <Box sx={rolesPaginationWrapper}>
            <TablePagination page={safePage} pageCount={pageCount} onPageChange={setPage} />
          </Box>
        </Box>
      </DashboardCard>

      {dept ? (
        <Box sx={{ mt: 2 }}>
          <SelectField
            label="Team attendance — pool"
            value={attendancePoolId}
            onChange={setAttendancePoolId}
            options={attendancePoolOptions}
            menuMaxRows={10}
            disabled={!poolsInDeptQuery.isLoading && deptPoolSelectOptions.length === 0}
          />
          <PoolTeamAttendanceSection
            poolId={attendancePoolId.trim()}
            poolLabel={attendancePoolLabel}
            active={active && Boolean(attendancePoolId.trim())}
          />
        </Box>
      ) : null}

      <FormModal
        open={moveOpen}
        title="Move member to another pool"
        description={
          moveRow
            ? `Move “${moveRow.memberName}” from “${moveRow.poolName}” to another pool in this department.`
            : "Move this member."
        }
        onClose={() => {
          if (moveMutation.isPending) return;
          setMoveOpen(false);
          setMoveRow(null);
        }}
        onSave={confirmMove}
        primaryButtonLabel={moveMutation.isPending ? "Moving…" : "Move"}
        primaryButtonDisabled={moveMutation.isPending || !targetPoolId.trim()}
        cancelButtonLabel="Cancel"
        maxWidth={480}
        fitContent
      >
        <SelectField
          label="Target pool"
          value={targetPoolId}
          onChange={setTargetPoolId}
          options={
            moveRow
              ? movePoolOptions.filter((o) => !o.value || o.value !== moveRow.poolId)
              : movePoolOptions
          }
          menuMaxRows={8}
        />
      </FormModal>

      <ConfirmActionModal
        open={removeRow != null}
        title="Remove from pool?"
        description={
          removeRow
            ? `Remove “${removeRow.memberName}” from pool “${removeRow.poolName}”?`
            : "Remove this member from the pool?"
        }
        confirmLabel={removeMutation.isPending ? "Removing…" : "Remove"}
        onDismiss={() => {
          if (removeMutation.isPending) return;
          setRemoveRow(null);
        }}
        onConfirm={confirmRemove}
        isLoading={removeMutation.isPending}
      />
    </>
  );
}
