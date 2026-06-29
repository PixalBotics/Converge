"use client";

import { useEffect, useMemo, useState } from "react";
import Box from "@mui/material/Box";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { DataTable, FormModal, Typography } from "@/components/common";
import type { DataTableColumn } from "@/components/common";
import { pickItemsArray } from "@/app/dashboard/user-page/components/add-user-modal.utils";
import { formatPoolDepartmentLabel } from "@/app/dashboard/pools/pool-catalog.constants";
import { useUsersListQuery } from "@/lib/hooks/query";
import { usePoolsListQuery } from "@/lib/hooks/query/hrms";
import { isRecord, pickStr } from "@/lib/utils/core";
import { listInternalSupervisorsInScope } from "@/services/chat/internal-supervisors.api";

type UnassignedUserRow = {
  id: string;
  name: string;
  email: string;
  departmentName: string;
  parentCompanyId: string;
};

type PoolRow = {
  id: string;
  name: string;
  departmentName: string;
};

function userDisplayName(raw: Record<string, unknown>): string {
  const first = pickStr(raw, ["firstName", "first_name"]) || "";
  const last = pickStr(raw, ["lastName", "last_name"]) || "";
  const joined = `${first} ${last}`.trim();
  return joined || pickStr(raw, ["email"]) || pickStr(raw, ["id"]) || "User";
}

interface InternalSupervisorAssignModalProps {
  open: boolean;
  onClose: () => void;
  canEdit: boolean;
  saving: boolean;
  onSave: (userId: string, poolIds: string[]) => void;
}

export function InternalSupervisorAssignModal({
  open,
  onClose,
  canEdit,
  saving,
  onSave,
}: InternalSupervisorAssignModalProps) {
  const theme = useTheme() as AppTheme;

  const [selectedUserId, setSelectedUserId] = useState("");
  const [selectedPoolIds, setSelectedPoolIds] = useState<string[]>([]);

  const usersQuery = useUsersListQuery(
    {
      all: true,
      userType: "Internal",
      unassignedPoolOnly: true,
      headRole: "none",
    },
    { enabled: open },
  );

  const userRows = useMemo<UnassignedUserRow[]>(() => {
    return pickItemsArray(usersQuery.data)
      .filter(isRecord)
      .filter((raw) => pickStr(raw, ["userType", "user_type"]) === "Internal")
      .map((raw) => {
        const id = pickStr(raw, ["id"]) || "";
        if (!id) return null;
        const dept = isRecord(raw.department) ? raw.department : null;
        return {
          id,
          name: userDisplayName(raw),
          email: pickStr(raw, ["email"]) || "—",
          departmentName:
            pickStr(dept ?? {}, ["name"]) || pickStr(raw, ["departmentName"]) || "—",
          parentCompanyId:
            pickStr(raw, ["parentCompanyId", "parent_company_id"]) ||
            pickStr(isRecord(raw.parentCompany) ? raw.parentCompany : {}, ["id"]) ||
            "",
        };
      })
      .filter((row): row is UnassignedUserRow => row != null);
  }, [usersQuery.data]);

  const selectedUser = userRows.find((row) => row.id === selectedUserId) ?? null;

  const poolsQuery = usePoolsListQuery(
    { all: true, departmentType: "Internal" },
    { enabled: open && Boolean(selectedUserId), scope: "internal-supervisor-pools" },
  );

  const poolRows = useMemo<PoolRow[]>(() => {
    return pickItemsArray(poolsQuery.data)
      .filter(isRecord)
      .map((raw) => {
        const id = pickStr(raw, ["id"]) || "";
        if (!id) return null;
        const dept = isRecord(raw.department) ? raw.department : null;
        const deptType = pickStr(dept ?? {}, ["type"]) || "Internal";
        if (deptType !== "Internal") return null;
        const departmentName = formatPoolDepartmentLabel(
          pickStr(dept ?? {}, ["name"]),
          deptType,
        );
        return {
          id,
          name: pickStr(raw, ["name"]) || "Pool",
          departmentName,
        };
      })
      .filter((row): row is PoolRow => row != null)
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [poolsQuery.data]);

  useEffect(() => {
    if (!open) return;
    setSelectedUserId("");
    setSelectedPoolIds([]);
  }, [open]);

  useEffect(() => {
    if (!open || !selectedUser) {
      setSelectedPoolIds([]);
      return;
    }
    let cancelled = false;
    void listInternalSupervisorsInScope({ all: true }).then((rows) => {
      if (cancelled) return;
      setSelectedPoolIds(
        rows.filter((row) => row.userId === selectedUser.id).map((row) => row.poolId),
      );
    });
    return () => {
      cancelled = true;
    };
  }, [open, selectedUser?.id]);

  const userColumns = useMemo<DataTableColumn<UnassignedUserRow>[]>(
    () => [
      { id: "name", label: "User", render: (_, row) => row.name },
      { id: "email", label: "Email", render: (_, row) => row.email },
      { id: "department", label: "Department", render: (_, row) => row.departmentName },
    ],
    [],
  );

  const togglePool = (poolId: string) => {
    setSelectedPoolIds((prev) =>
      prev.includes(poolId) ? prev.filter((id) => id !== poolId) : [...prev, poolId],
    );
  };

  const handleSave = () => {
    const userId = selectedUserId.trim();
    if (!userId || selectedPoolIds.length === 0) return;
    onSave(userId, selectedPoolIds);
  };

  const saveDisabled =
    !canEdit || saving || !selectedUserId.trim() || selectedPoolIds.length === 0;

  return (
    <FormModal
      open={open}
      onClose={onClose}
      fitContent
      maxWidth={820}
      title="Assign internal supervisor"
      description="Internal supervisors only — external users use a separate involvement flow. Pick an internal user who is not in any pool, then select internal pools they supervise."
      primaryButtonLabel={saving ? "Saving…" : "Save supervisor"}
      primaryButtonDisabled={saveDisabled}
      onSave={handleSave}
    >
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
        <Box>
          <Typography fontWeight={600} sx={{ mb: 1 }}>
            Internal users without a pool
          </Typography>
          <Typography
            variant="caption"
            sx={{ color: theme.app.dashboard.textMuted, display: "block", mb: 1 }}
          >
            Only internal users can be supervisors. External users are not listed here.
          </Typography>
          <DataTable<UnassignedUserRow>
            columns={userColumns}
            rows={userRows}
            getRowId={(row) => row.id}
            selectedRowId={selectedUserId || null}
            onRowClick={(row) => setSelectedUserId(row.id)}
            isLoading={usersQuery.isLoading}
            emptyState={{
              title: usersQuery.isError ? "Could not load users" : "No unassigned internal users",
              description: usersQuery.isError
                ? "Check permissions and try again."
                : "All internal users are already assigned to a pool.",
            }}
          />
        </Box>

        <Box>
          <Typography fontWeight={600} sx={{ mb: 1 }}>
            Internal pools to supervise
          </Typography>
          <Typography
            variant="caption"
            sx={{ color: theme.app.dashboard.textMuted, display: "block", mb: 1 }}
          >
            External pools are not shown. Supervisors monitor live chats for these pools only.
          </Typography>
          {!selectedUser ? (
            <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted }}>
              Select an internal user above first.
            </Typography>
          ) : poolsQuery.isLoading ? (
            <Typography variant="caption">Loading internal pools…</Typography>
          ) : poolRows.length === 0 ? (
            <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted }}>
              No internal pools yet. Create an internal pool first.
            </Typography>
          ) : (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 0.25,
                maxHeight: 240,
                overflowY: "auto",
                pr: 0.5,
              }}
            >
              {poolRows.map((pool) => (
                <FormControlLabel
                  key={pool.id}
                  control={
                    <Checkbox
                      checked={selectedPoolIds.includes(pool.id)}
                      onChange={() => togglePool(pool.id)}
                      disabled={!canEdit || saving}
                    />
                  }
                  label={
                    pool.departmentName === "—"
                      ? pool.name
                      : `${pool.name} · ${pool.departmentName}`
                  }
                />
              ))}
            </Box>
          )}
        </Box>
      </Box>
    </FormModal>
  );
}
