"use client";

import { useEffect, useMemo, useState } from "react";
import Box from "@mui/material/Box";
import type { SxProps, Theme } from "@mui/material/styles";
import {
  Typography,
  Button,
} from "@/components/common";
import type { DataTableColumn } from "@/components/common";
import { gradientPrimaryButtonSx } from "@/components/common/Button/Button.styles";
import { rolesPageWrapper } from "../../roles/roles.styles";
import { pageWrapper } from "../../companies/overview.styles";
import { publishAppToast } from "@/lib/notify";
import {
  leaveTypeHeaderWrapSx,
  leaveTypeSubtextSx,
} from "./leave-type.styles";
import { useCreateLeaveTypeMutation, useDeleteLeaveTypeMutation, useLeaveTypesListQuery, useUpdateLeaveTypeMutation } from "@/lib/hooks/query";
import { isRecord, pickNum, pickStr, unwrapApiData } from "@/lib/utils/core";
import { LeaveTypeModals, LeaveTypesTableCard } from "./components";
import { useAuth } from "@/lib/auth";
import { canLeaveTypeManage, canLeaveTypeView } from "@/lib/permissions";

const PAGE_LIMIT = 10;

type LeaveTypeRow = {
  id: string;
  name: string;
  description: string;
  maxDaysPerYear: number | null;
};

export default function LeaveTypePage() {
  const { hasOperational } = useAuth();
  const canManageLeaveTypes = canLeaveTypeManage(hasOperational);
  const canViewLeaveTypes = canLeaveTypeView(hasOperational);

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<LeaveTypeRow | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<LeaveTypeRow | null>(null);

  const [nameField, setNameField] = useState("");
  const [descriptionField, setDescriptionField] = useState("");
  const [maxDaysField, setMaxDaysField] = useState("");

  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editMaxDays, setEditMaxDays] = useState("");

  const listQuery = useLeaveTypesListQuery(
    {
      page,
      limit: PAGE_LIMIT,
      ...(search.trim() ? { search: search.trim() } : {}),
    },
    { enabled: true, scope: "leave-types-page" },
  );
  const createMutation = useCreateLeaveTypeMutation();
  const updateMutation = useUpdateLeaveTypeMutation();
  const deleteMutation = useDeleteLeaveTypeMutation();

  const payload = unwrapApiData(listQuery.data);
  const payloadObj = isRecord(payload) ? payload : null;
  const items = useMemo(() => {
    const arr = payloadObj?.["items"];
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
    if (searchInput.trim().length > 0) return;
    if (!search.trim()) return;
    setSearch("");
    setPage(1);
  }, [searchInput, search]);

  useEffect(() => {
    setPage(1);
  }, [search]);

  useEffect(() => {
    setPage((p) => (p > pageCount ? pageCount : p));
  }, [pageCount]);

  const tableRows = useMemo<LeaveTypeRow[]>(() => {
    return items
      .map((r) => {
        const id = pickStr(r, ["id"]);
        if (!id) return null;
        return {
          id,
          name: pickStr(r, ["name"]) || "—",
          description: pickStr(r, ["description"]) || "—",
          maxDaysPerYear: pickNum(r, ["maxDaysPerYear"]),
        };
      })
      .filter((x): x is LeaveTypeRow => x !== null);
  }, [items]);

  const footerRangeStart = tableRows.length > 0 ? (page - 1) * PAGE_LIMIT + 1 : 0;
  const footerRangeEnd = (page - 1) * PAGE_LIMIT + tableRows.length;

  const columns = useMemo<DataTableColumn<LeaveTypeRow>[]>(
    () => [
      { id: "name", label: "Leave type" },
      { id: "description", label: "Description" },
      { id: "maxDaysPerYear", label: "Max days/year" },
    ],
    [],
  );

  const resetCreateForm = () => {
    setNameField("");
    setDescriptionField("");
    setMaxDaysField("");
  };

  if (!canViewLeaveTypes) {
    return (
      <Box sx={[pageWrapper, rolesPageWrapper] as SxProps<Theme>}>
        <Typography variant="regularLarge" fontWeight={700} color="white">
          Leave Types
        </Typography>
        <Typography variant="body2" sx={{ mt: 2, color: "rgba(255,255,255,0.65)" }}>
          You do not have permission to view leave types.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={[pageWrapper, rolesPageWrapper] as SxProps<Theme>}>
      <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 2, mb: 0.5 }}>
        <Box sx={leaveTypeHeaderWrapSx}>
          <Typography variant="regularLarge" fontWeight={700} color="white">
            Leave Types
          </Typography>
          <Typography variant="body2" sx={leaveTypeSubtextSx}>
            Create and manage leave types.
          </Typography>
        </Box>
        {canManageLeaveTypes ? (
          <Button
            variant="primary"
            sx={gradientPrimaryButtonSx}
            disabled={deleteMutation.isPending}
            onClick={() => setCreateOpen(true)}
          >
            Add leave type
          </Button>
        ) : null}
      </Box>

      <LeaveTypesTableCard
        rows={tableRows}
        columns={columns}
        isLoading={listQuery.isLoading || listQuery.isFetching}
        searchInput={searchInput}
        onSearchInputChange={setSearchInput}
        appliedSearch={search}
        onSearchApply={() => {
          setSearch(searchInput.trim());
          setPage(1);
        }}
        page={page}
        pageCount={pageCount}
        footerText={
          listQuery.isLoading
            ? "Loading…"
            : `Showing data ${footerRangeStart} to ${footerRangeEnd} of ${totalEntries} entries`
        }
        onPageChange={setPage}
        onEdit={(row) => {
          setEditTarget(row);
          setEditName(row.name === "—" ? "" : row.name);
          setEditDescription(row.description === "—" ? "" : row.description);
          setEditMaxDays(row.maxDaysPerYear != null ? String(row.maxDaysPerYear) : "");
        }}
        onDelete={setDeleteTarget}
        disableActions={deleteMutation.isPending}
        showManageActions={canManageLeaveTypes}
      />

      <LeaveTypeModals
        createOpen={createOpen}
        onCloseCreate={() => {
          if (createMutation.isPending) return;
          setCreateOpen(false);
          resetCreateForm();
        }}
        onSaveCreate={() => {
          const name = nameField.trim();
          if (!name) {
            publishAppToast({ variant: "error", message: "Please enter a name." });
            return;
          }
          const maxDays = maxDaysField.trim() ? Number(maxDaysField.trim()) : null;
          if (maxDaysField.trim() && !Number.isFinite(maxDays)) {
            publishAppToast({ variant: "error", message: "Max days must be a number." });
            return;
          }
          createMutation.mutate(
            {
              name,
              ...(descriptionField.trim() ? { description: descriptionField.trim() } : {}),
              ...(maxDays != null ? { maxDaysPerYear: maxDays } : {}),
            },
            {
              onSuccess: () => {
                publishAppToast({ variant: "success", message: "Leave type created." });
                setCreateOpen(false);
                resetCreateForm();
              },
              onError: () => publishAppToast({ variant: "error", message: "Could not create leave type." }),
            },
          );
        }}
        isCreating={createMutation.isPending}
        nameField={nameField}
        onNameChange={setNameField}
        descriptionField={descriptionField}
        onDescriptionChange={setDescriptionField}
        maxDaysField={maxDaysField}
        onMaxDaysChange={setMaxDaysField}
        editOpen={editTarget != null && canManageLeaveTypes}
        onCloseEdit={() => {
          if (updateMutation.isPending) return;
          setEditTarget(null);
          setEditName("");
          setEditDescription("");
          setEditMaxDays("");
        }}
        onSaveEdit={() => {
          const target = editTarget;
          if (!target) return;
          const name = editName.trim();
          if (!name) {
            publishAppToast({ variant: "error", message: "Please enter a name." });
            return;
          }
          const maxDays = editMaxDays.trim() ? Number(editMaxDays.trim()) : null;
          if (editMaxDays.trim() && !Number.isFinite(maxDays)) {
            publishAppToast({ variant: "error", message: "Max days must be a number." });
            return;
          }
          updateMutation.mutate(
            {
              id: target.id,
              body: {
                name,
                description: editDescription.trim() ? editDescription.trim() : undefined,
                maxDaysPerYear: maxDays ?? undefined,
              },
            },
            {
              onSuccess: () => {
                publishAppToast({ variant: "success", message: "Leave type updated." });
                setEditTarget(null);
              },
              onError: () => publishAppToast({ variant: "error", message: "Could not update leave type." }),
            },
          );
        }}
        isEditing={updateMutation.isPending}
        editName={editName}
        onEditNameChange={setEditName}
        editDescription={editDescription}
        onEditDescriptionChange={setEditDescription}
        editMaxDays={editMaxDays}
        onEditMaxDaysChange={setEditMaxDays}
        deleteOpen={deleteTarget != null && canManageLeaveTypes}
        deleteDescription={deleteTarget ? `Delete leave type “${deleteTarget.name}”?` : "Delete this leave type?"}
        onCloseDelete={() => {
          if (deleteMutation.isPending) return;
          setDeleteTarget(null);
        }}
        onConfirmDelete={() => {
          const target = deleteTarget;
          if (!target) return;
          deleteMutation.mutate(target.id, {
            onSuccess: () => {
              publishAppToast({ variant: "success", message: "Leave type deleted." });
              setDeleteTarget(null);
            },
            onError: () => publishAppToast({ variant: "error", message: "Could not delete leave type." }),
          });
        }}
        isDeleting={deleteMutation.isPending}
      />
    </Box>
  );
}
