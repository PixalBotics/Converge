"use client";

import { useEffect, useMemo, useState } from "react";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Chip from "@mui/material/Chip";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import DriveFileMoveOutlined from "@mui/icons-material/DriveFileMoveOutlined";
import PersonRemoveOutlined from "@mui/icons-material/PersonRemoveOutlined";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import {
  Button,
  ConfirmActionModal,
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
import { isRecord, pickNum, pickStr, unwrapApiData } from "@/lib/utils";
import {
  useAddPoolMemberMutation,
  useMovePoolMemberMutation,
  usePoolMembersListQuery,
  usePoolsListQuery,
  useRemovePoolMemberMutation,
  useUsersListQuery,
} from "@/lib/hooks/query";
import { pickItemsArray } from "@/app/dashboard/user-page/components/add-user-modal.utils";
import { gradientPrimaryButtonSx } from "@/components/common/Button/Button.styles";
import { rolesFooterRow, rolesPaginationWrapper } from "@/app/dashboard/roles/roles.styles";
import { footerMutedText } from "@/app/dashboard/companies/overview.styles";

const PAGE_LIMIT = 8;

export type PoolMembersPanelPool = {
  id: string;
  poolName: string;
  departmentId: string;
};

export type PoolMembersPanelProps = {
  pool: PoolMembersPanelPool | null;
  /** When false, queries and mutations are disabled. */
  active: boolean;
  canAdd: boolean;
  canMove: boolean;
  canRemove: boolean;
  /** `edit-delete`: dedicated page uses edit/delete icons (move / remove). `move-remove`: original icons. */
  memberActionsVariant?: "move-remove" | "edit-delete";
  /** Short hint under the section title (pool-members page). */
  showActionHint?: boolean;
};

type MemberRow = {
  id: string;
  displayName: string;
  email: string;
  isPoolHead: boolean;
};

function extractItems(data: unknown): Record<string, unknown>[] {
  const payload = unwrapApiData(data);
  if (!payload) return [];
  if (Array.isArray(payload)) return payload.filter(isRecord);
  if (!isRecord(payload)) return [];
  const items = payload["items"];
  return Array.isArray(items) ? items.filter(isRecord) : [];
}

function memberDisplayName(r: Record<string, unknown>): string {
  const first = pickStr(r, ["firstName", "first_name"]) || "";
  const last = pickStr(r, ["lastName", "last_name"]) || "";
  const joined = `${first} ${last}`.trim();
  if (joined) return joined;
  return pickStr(r, ["name", "fullName", "userName"]) || "—";
}

export function PoolMembersPanel({
  pool,
  active,
  canAdd,
  canMove,
  canRemove,
  memberActionsVariant = "move-remove",
  showActionHint = false,
}: PoolMembersPanelProps) {
  const theme = useTheme() as AppTheme;
  const [memberPage, setMemberPage] = useState(1);
  const [memberSearchInput, setMemberSearchInput] = useState("");
  const [memberSearchApplied, setMemberSearchApplied] = useState("");
  const [addUserId, setAddUserId] = useState("");
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [moveOpen, setMoveOpen] = useState(false);
  const [moveUserId, setMoveUserId] = useState("");
  const [moveUserLabel, setMoveUserLabel] = useState("");
  const [targetPoolId, setTargetPoolId] = useState("");
  const [removeUserId, setRemoveUserId] = useState<string | null>(null);
  const [removeUserLabel, setRemoveUserLabel] = useState("");

  const poolId = pool?.id.trim() ?? "";
  const departmentId = pool?.departmentId.trim() ?? "";

  useEffect(() => {
    if (!active || !poolId) return;
    setMemberPage(1);
    setMemberSearchInput("");
    setMemberSearchApplied("");
    setAddUserId("");
    setAddModalOpen(false);
    setMoveOpen(false);
    setMoveUserId("");
    setTargetPoolId("");
    setRemoveUserId(null);
  }, [active, poolId]);

  const listParams = useMemo(
    () => ({
      page: memberPage,
      limit: PAGE_LIMIT,
      ...(memberSearchApplied.trim() ? { search: memberSearchApplied.trim() } : {}),
    }),
    [memberPage, memberSearchApplied],
  );

  const membersQuery = usePoolMembersListQuery(poolId || undefined, listParams, {
    enabled: active && Boolean(poolId),
    scope: "pool-members-panel",
  });

  const addMutation = useAddPoolMemberMutation();
  const moveMutation = useMovePoolMemberMutation();
  const removeMutation = useRemovePoolMemberMutation();

  const payload = unwrapApiData(membersQuery.data);
  const payloadObj = isRecord(payload) ? payload : null;
  const rawItems = useMemo(() => extractItems(membersQuery.data), [membersQuery.data]);

  const memberRows = useMemo<MemberRow[]>(() => {
    return rawItems
      .map((r) => {
        const id = pickStr(r, ["id", "userId"]) || "";
        if (!id) return null;
        const head =
          r["isPoolHead"] === true ||
          r["isPoolHead"] === "true" ||
          pickStr(r, ["isPoolHead"]) === "1";
        return {
          id,
          displayName: memberDisplayName(r),
          email: pickStr(r, ["email"]) || "—",
          isPoolHead: Boolean(head),
        };
      })
      .filter((x): x is MemberRow => x !== null);
  }, [rawItems]);

  const totalMembers = useMemo(() => {
    const n = pickNum(payloadObj, ["total", "count", "totalCount"]);
    return n ?? memberRows.length;
  }, [payloadObj, memberRows.length]);

  const memberPageCount = useMemo(() => {
    const n = pickNum(payloadObj, ["totalPages"]);
    return n && n > 0 ? n : 1;
  }, [payloadObj]);

  useEffect(() => {
    setMemberPage((p) => (p > memberPageCount ? memberPageCount : p));
  }, [memberPageCount]);

  const addViaModal = memberActionsVariant === "edit-delete";
  const usersQuery = useUsersListQuery(
    active && departmentId ? { all: true, limit: 250, departmentId, unassignedPoolOnly: true } : undefined,
    {
      enabled:
        active &&
        Boolean(departmentId) &&
        canAdd &&
        (addViaModal ? addModalOpen : true),
    },
  );

  const addUserOptions = useMemo(() => {
    const payloadUsers = unwrapApiData(usersQuery.data);
    const users = Array.isArray(payloadUsers)
      ? payloadUsers.filter(isRecord)
      : extractItems(usersQuery.data);
    const base = users
      .map((u) => {
        const id = pickStr(u, ["id", "userId", "user_id"]) || "";
        if (!id) return null;
        const name = memberDisplayName(u);
        const email = pickStr(u, ["email"]) || "";
        return { value: id, label: email ? `${name} · ${email}` : name };
      })
      .filter((o): o is { value: string; label: string } => o !== null);
    return [{ value: "", label: usersQuery.isLoading ? "Loading users…" : "— Select user to add —" }, ...base];
  }, [usersQuery.data, usersQuery.isLoading]);

  const poolsInDeptQuery = usePoolsListQuery(
    departmentId ? { departmentId, all: true } : undefined,
    { enabled: active && Boolean(departmentId) && canMove },
  );

  const movePoolOptions = useMemo(() => {
    const items = pickItemsArray(unwrapApiData(poolsInDeptQuery.data))
      .map((r) => {
        if (!isRecord(r)) return null;
        const id = pickStr(r, ["id"]) || "";
        const name = pickStr(r, ["name", "poolName"]) || "";
        if (!id || id === poolId) return null;
        return { value: id, label: name };
      })
      .filter((o): o is { value: string; label: string } => o !== null);
    return [{ value: "", label: poolsInDeptQuery.isLoading ? "Loading pools…" : "— Select target pool —" }, ...items];
  }, [poolsInDeptQuery.data, poolsInDeptQuery.isLoading, poolId]);

  const footerStart = memberRows.length > 0 ? (memberPage - 1) * PAGE_LIMIT + 1 : 0;
  const footerEnd = (memberPage - 1) * PAGE_LIMIT + memberRows.length;

  const columns = useMemo<DataTableColumn<MemberRow>[]>(
    () => [
      { id: "displayName", label: "Name" },
      { id: "email", label: "Email" },
      {
        id: "isPoolHead",
        label: "Role",
        render: (_value, row) =>
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

  const handleAddMember = () => {
    if (!poolId || !addUserId.trim()) {
      publishAppToast({ variant: "error", message: "Select a user to add." });
      return;
    }
    addMutation.mutate(
      { poolId, userId: addUserId.trim() },
      {
        onSuccess: () => {
          publishAppToast({ variant: "success", message: "User added to pool." });
          setAddUserId("");
          if (addViaModal) setAddModalOpen(false);
        },
        onError: () => publishAppToast({ variant: "error", message: "Could not add user to pool." }),
      },
    );
  };

  const openMove = (row: MemberRow) => {
    setMoveUserId(row.id);
    setMoveUserLabel(row.displayName);
    setTargetPoolId("");
    setMoveOpen(true);
  };

  const confirmMove = () => {
    if (!poolId || !moveUserId || !targetPoolId.trim()) {
      publishAppToast({ variant: "error", message: "Select a target pool." });
      return;
    }
    moveMutation.mutate(
      { poolId, userId: moveUserId, targetPoolId: targetPoolId.trim() },
      {
        onSuccess: () => {
          publishAppToast({ variant: "success", message: "Member moved to the other pool." });
          setMoveOpen(false);
        },
        onError: () => publishAppToast({ variant: "error", message: "Could not move member." }),
      },
    );
  };

  const confirmRemove = () => {
    if (!poolId || !removeUserId) return;
    removeMutation.mutate(
      { poolId, userId: removeUserId },
      {
        onSuccess: () => {
          publishAppToast({ variant: "success", message: "Removed from pool." });
          setRemoveUserId(null);
        },
        onError: () => publishAppToast({ variant: "error", message: "Could not remove member." }),
      },
    );
  };

  if (!pool) {
    return (
      <Typography variant="body2" sx={{ color: theme.app.dashboard.textMuted, py: 2 }}>
        Select a pool from the table above to view and manage its members.
      </Typography>
    );
  }

  const busy = addMutation.isPending || moveMutation.isPending || removeMutation.isPending;
  const useEditDelete = memberActionsVariant === "edit-delete";

  return (
    <>
      {showActionHint ? (
        <Typography variant="caption" sx={{ display: "block", mb: 1.5, color: theme.app.dashboard.textMuted }}>
          Add member opens a dialog. Edit moves the user to another pool in the same department. Delete removes them from this pool.
        </Typography>
      ) : null}

      {canAdd && addViaModal ? (
        <Box sx={{ mb: 2 }}>
          <Button
            variant="primary"
            sx={gradientPrimaryButtonSx}
            disabled={busy}
            onClick={() => {
              setAddUserId("");
              setAddModalOpen(true);
            }}
          >
            Add member
          </Button>
        </Box>
      ) : canAdd ? (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "1fr auto" },
            gap: 1.5,
            alignItems: "flex-end",
            mb: 2,
          }}
        >
          <SelectField label="Add user to this pool" value={addUserId} onChange={setAddUserId} options={addUserOptions} menuMaxRows={8} />
          <Button variant="primary" sx={gradientPrimaryButtonSx} disabled={busy || !addUserId.trim()} onClick={handleAddMember}>
            {addMutation.isPending ? "Adding…" : "Add member"}
          </Button>
        </Box>
      ) : null}

      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5, alignItems: "center", mb: 1.5 }}>
        <Box sx={{ flex: "1 1 220px", minWidth: 0 }}>
          <SearchBar value={memberSearchInput} onChange={setMemberSearchInput} placeholder="Search name or email…" />
        </Box>
        <Button
          variant="outlined"
          disabled={membersQuery.isFetching}
          onClick={() => {
            setMemberSearchApplied(memberSearchInput);
            setMemberPage(1);
          }}
        >
          Search
        </Button>
      </Box>

      <DataTable<MemberRow>
        columns={columns}
        rows={memberRows}
        isLoading={membersQuery.isLoading || membersQuery.isFetching}
        getRowId={(row) => row.id}
        minWidth={560}
        scrollY={false}
        actionColumn={{
          label: "Action",
          render: (row) => (
            <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 0.5 }} onClick={(e) => e.stopPropagation()}>
              <IconButton
                size="small"
                sx={dataTableActionButton}
                aria-label={useEditDelete ? "Edit (move to another pool)" : "Move to another pool"}
                disabled={busy || !canMove}
                onClick={() => openMove(row)}
              >
                {useEditDelete ? <EditIcon fontSize="small" /> : <DriveFileMoveOutlined fontSize="small" />}
              </IconButton>
              <IconButton
                size="small"
                sx={{ ...dataTableActionButton, color: theme.app.dashboard.accentRedLight }}
                aria-label={useEditDelete ? "Delete (remove from pool)" : "Remove from pool"}
                disabled={busy || !canRemove}
                onClick={() => {
                  setRemoveUserId(row.id);
                  setRemoveUserLabel(row.displayName);
                }}
              >
                {useEditDelete ? <DeleteIcon fontSize="small" /> : <PersonRemoveOutlined fontSize="small" />}
              </IconButton>
            </Box>
          ),
        }}
      />

      <Box sx={rolesFooterRow}>
        <Typography variant="medium" sx={footerMutedText(theme)}>
          {membersQuery.isLoading ? "Loading…" : `Showing ${footerStart}–${footerEnd} of ${totalMembers}`}
        </Typography>
        <Box sx={rolesPaginationWrapper}>
          <TablePagination page={memberPage} pageCount={memberPageCount} onPageChange={setMemberPage} />
        </Box>
      </Box>

      <FormModal
        open={addModalOpen}
        title="Add pool member"
        description={pool ? `Choose a user to assign to “${pool.poolName}”.` : "Choose a user to assign to this pool."}
        onClose={() => {
          if (addMutation.isPending) return;
          setAddModalOpen(false);
          setAddUserId("");
        }}
        onSave={handleAddMember}
        primaryButtonLabel={addMutation.isPending ? "Adding…" : "Add to pool"}
        primaryButtonDisabled={addMutation.isPending || !addUserId.trim()}
        cancelButtonLabel="Cancel"
        maxWidth={520}
        fitContent
      >
        <SelectField label="User" value={addUserId} onChange={setAddUserId} options={addUserOptions} menuMaxRows={10} />
      </FormModal>

      <FormModal
        open={moveOpen}
        title="Move to another pool"
        description={moveUserLabel ? `Move “${moveUserLabel}” within the same department.` : "Move this member."}
        onClose={() => {
          if (moveMutation.isPending) return;
          setMoveOpen(false);
        }}
        onSave={confirmMove}
        primaryButtonLabel={moveMutation.isPending ? "Moving…" : "Move"}
        primaryButtonDisabled={moveMutation.isPending || !targetPoolId.trim()}
        cancelButtonLabel="Cancel"
        maxWidth={480}
        fitContent
      >
        <SelectField label="Target pool" value={targetPoolId} onChange={setTargetPoolId} options={movePoolOptions} menuMaxRows={8} />
      </FormModal>

      <ConfirmActionModal
        open={removeUserId != null}
        title="Remove from pool?"
        description={removeUserLabel ? `Remove “${removeUserLabel}” from this pool?` : "Remove this user from the pool?"}
        confirmLabel={removeMutation.isPending ? "Removing…" : "Remove"}
        onDismiss={() => {
          if (removeMutation.isPending) return;
          setRemoveUserId(null);
        }}
        onConfirm={confirmRemove}
        isLoading={removeMutation.isPending}
      />
    </>
  );
}
