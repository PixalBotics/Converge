"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { FormModal, InputField, SelectField, Typography } from "@/components/common";
import { extractApiErrorMessageForToast, publishAppToast } from "@/lib/notify";
import {
  useCreateDesignationMutation,
  useDepartmentsListQuery,
  useDesignationQuery,
  useUpdateDesignationMutation,
} from "@/lib/hooks";
import { pickItemsArray, toIdNameOption } from "@/app/dashboard/user-page/components/add-user-modal.utils";
import { extractDesignationFromDetailApi, type DesignationRow } from "../utils";

const EMPTY_SELECT = [{ label: "—", value: "" }] as const;

export type AddDesignationModalProps = {
  open: boolean;
  onClose: () => void;
  onSaved?: () => void;
  /** When set, modal loads `GET /hrms/designations/:id` and updates it. */
  editDesignation?: DesignationRow | null;
};

export function AddDesignationModal({
  open,
  onClose,
  onSaved,
  editDesignation = null,
}: AddDesignationModalProps) {
  const theme = useTheme() as AppTheme;
  const [name, setName] = useState("");
  const [departmentId, setDepartmentId] = useState("");

  const createMutation = useCreateDesignationMutation();
  const updateMutation = useUpdateDesignationMutation();
  const savePending = createMutation.isPending || updateMutation.isPending;

  const editId = editDesignation?.id?.trim() ?? "";
  const isEdit = editId.length > 0;
  const detailHydratedForIdRef = useRef<string | null>(null);

  const detailQuery = useDesignationQuery(editId, {
    enabled: open && isEdit,
    scope: "add-designation-modal",
    skipGlobalToast: true,
  });

  const departmentsQuery = useDepartmentsListQuery(undefined, {
    enabled: open,
    scope: "add-designation-modal",
  });

  const departmentOptions = useMemo(() => {
    return pickItemsArray(departmentsQuery.data)
      .map((row) => toIdNameOption(row))
      .filter((o): o is { value: string; label: string } => o !== null);
  }, [departmentsQuery.data]);

  const departmentSelectOptions = useMemo(() => {
    if (departmentOptions.length > 0) return departmentOptions;
    return departmentsQuery.isLoading ? [{ value: "", label: "Loading…" }] : [...EMPTY_SELECT];
  }, [departmentOptions, departmentsQuery.isLoading]);

  useEffect(() => {
    if (!open) {
      detailHydratedForIdRef.current = null;
      return;
    }
    const editing = editId.trim().length > 0;
    if (!editing) {
      setName("");
      setDepartmentId("");
    }
  }, [open, editId]);

  useEffect(() => {
    detailHydratedForIdRef.current = null;
  }, [editId]);

  useEffect(() => {
    if (!open || !isEdit || !detailQuery.isSuccess || !detailQuery.data) return;
    const row = extractDesignationFromDetailApi(detailQuery.data);
    if (!row || row.id !== editId) return;
    if (detailHydratedForIdRef.current === editId) return;
    detailHydratedForIdRef.current = editId;
    setName(row.designationName === "—" ? "" : row.designationName);
    setDepartmentId(row.departmentId?.trim() ?? "");
  }, [open, isEdit, editId, detailQuery.isSuccess, detailQuery.data]);

  const handleSave = () => {
    const trimmed = name.trim();
    if (!trimmed) {
      publishAppToast({ variant: "error", message: "Please enter a designation name." });
      return;
    }
    if (!departmentId.trim()) {
      publishAppToast({ variant: "error", message: "Please select a department." });
      return;
    }

    const body = {
      name: trimmed,
      departmentId: departmentId.trim(),
    };
    const onSuccess = () => {
      onSaved?.();
      onClose();
    };

    if (isEdit) {
      updateMutation.mutate({ id: editId, body }, { onSuccess });
    } else {
      createMutation.mutate(body, { onSuccess });
    }
  };

  const detailErrorMessage =
    isEdit && detailQuery.isError
      ? extractApiErrorMessageForToast(detailQuery.error) ?? "Could not load designation."
      : null;
  const detailParsedRow =
    isEdit && detailQuery.isSuccess && detailQuery.data
      ? extractDesignationFromDetailApi(detailQuery.data)
      : null;
  const detailShapeError =
    isEdit &&
    detailQuery.isSuccess &&
    !detailErrorMessage &&
    (!detailParsedRow || detailParsedRow.id !== editId)
      ? "We couldn’t load the designation details. Please try again."
      : null;
  const detailLoading = isEdit && !detailQuery.isSuccess && !detailQuery.isError;
  const formDisabled = savePending || detailLoading || Boolean(detailErrorMessage) || Boolean(detailShapeError);

  return (
    <FormModal
      open={open}
      title={isEdit ? "Edit Designation" : "Add Designation"}
      description={
        isEdit
          ? "Review the designation details, update the fields, and save your changes."
          : "Create a new designation and assign it to a department."
      }
      onClose={onClose}
      onSave={handleSave}
      primaryButtonLabel={isEdit ? "Save changes" : "Save"}
      primaryButtonDisabled={formDisabled}
      cancelButtonLabel="Cancel"
      maxWidth={560}
      fitContent
    >
      {detailErrorMessage || detailShapeError ? (
        <Typography variant="medium" sx={{ color: theme.palette.error.light, lineHeight: 1.5 }}>
          {detailErrorMessage ?? detailShapeError}
        </Typography>
      ) : detailLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", py: 5 }}>
          <CircularProgress size={36} aria-label="Loading designation" />
        </Box>
      ) : (
        <>
          <InputField
            label="Designation Name"
            placeholder="e.g. Senior Manager"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={savePending}
          />

          <Box>
            <SelectField
              label="Department"
              value={departmentId}
              onChange={setDepartmentId}
              options={departmentSelectOptions}
              menuMaxRows={6}
              disabled={savePending}
            />
          </Box>
        </>
      )}
    </FormModal>
  );
}

