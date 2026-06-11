"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { FormModal, InputField, SelectField, Typography } from "@/components/common";
import { extractApiErrorMessageForToast, publishAppToast } from "@/lib/notify";
import {
  useCompaniesByResellerQuery,
  useCompaniesSetupResellersQuery,
  useCreateDesignationMutation,
  useDepartmentQuery,
  useDepartmentsListQuery,
  useDesignationQuery,
  useUpdateDesignationMutation,
} from "@/lib/hooks";
import { useAuth, sessionMayPickInternalUserScope } from "@/lib/auth";
import {
  extractParentCompaniesFromByResellerTree,
  pickItemsArray,
  toIdNameOption,
} from "@/app/dashboard/user-page/components/add-user-modal.utils";
import { extractDepartmentFromDetailApi } from "@/app/dashboard/departments/utils";
import { extractDesignationFromDetailApi, type DesignationRow } from "../utils";

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
  const { isPlatformAdmin, user: authUser } = useAuth();
  const mayPickInternalDeptType = useMemo(
    () => sessionMayPickInternalUserScope(isPlatformAdmin, authUser),
    [isPlatformAdmin, authUser],
  );

  const [name, setName] = useState("");
  const [deptKind, setDeptKind] = useState<"Internal" | "External">("Internal");
  const [resellerId, setResellerId] = useState("");
  const [parentCompanyId, setParentCompanyId] = useState("");
  const [departmentId, setDepartmentId] = useState("");

  const createMutation = useCreateDesignationMutation();
  const updateMutation = useUpdateDesignationMutation();
  const savePending = createMutation.isPending || updateMutation.isPending;

  const editId = editDesignation?.id?.trim() ?? "";
  const isEdit = editId.length > 0;
  const detailHydratedForIdRef = useRef<string | null>(null);
  const deptScopeHydratedForIdRef = useRef<string | null>(null);

  const detailQuery = useDesignationQuery(editId, {
    enabled: open && isEdit,
    scope: "add-designation-modal",
    skipGlobalToast: true,
  });

  const parsedDesignation =
    isEdit && detailQuery.isSuccess && detailQuery.data
      ? extractDesignationFromDetailApi(detailQuery.data)
      : null;
  const editDepartmentId = parsedDesignation?.departmentId?.trim() ?? "";

  const departmentDetailQuery = useDepartmentQuery(editDepartmentId, {
    enabled: open && isEdit && editDepartmentId.length > 0,
    scope: "add-designation-modal-dept",
    skipGlobalToast: true,
  });

  const resellersQuery = useCompaniesSetupResellersQuery({
    enabled: open && deptKind === "External",
  });

  const companiesByResellerQuery = useCompaniesByResellerQuery(
    resellerId,
    { view: "tree", sortBy: "name", sortOrder: "asc", all: true },
    {
      enabled: open && deptKind === "External" && resellerId.trim().length > 0,
    },
  );

  const internalDepartmentsQuery = useDepartmentsListQuery(
    { type: "Internal", all: true },
    { enabled: open && deptKind === "Internal", scope: "add-designation-modal-int-dept" },
  );

  const externalDeptListParams = useMemo(() => {
    const params: Record<string, string | boolean> = { all: true, type: "External" };
    const rid = resellerId.trim();
    if (rid) {
      params.resellerId = rid;
      const pid = parentCompanyId.trim();
      if (pid) params.parentCompanyId = pid;
    }
    return params;
  }, [resellerId, parentCompanyId]);

  const externalDepartmentsQuery = useDepartmentsListQuery(externalDeptListParams, {
    enabled: open && deptKind === "External",
    scope: "add-designation-modal-ext-dept",
  });

  const departmentsQuery =
    deptKind === "Internal" ? internalDepartmentsQuery : externalDepartmentsQuery;

  const resellerOptions = useMemo(() => {
    return pickItemsArray(resellersQuery.data)
      .map((row) => toIdNameOption(row))
      .filter((o): o is { value: string; label: string } => o !== null);
  }, [resellersQuery.data]);

  const parentCompanyOptions = useMemo(
    () => extractParentCompaniesFromByResellerTree(companiesByResellerQuery.data),
    [companiesByResellerQuery.data],
  );

  const resellerSelectOptions = useMemo(() => {
    const allRow = { value: "", label: "All resellers" };
    const loadingRow = {
      value: "",
      label: resellersQuery.isLoading ? "Loading resellers…" : "All resellers",
    };
    const base = resellerOptions.length > 0 ? [allRow, ...resellerOptions] : [loadingRow];
    const rid = resellerId.trim();
    if (rid && !base.some((o) => o.value === rid)) {
      return [{ value: rid, label: rid }, ...base];
    }
    return base;
  }, [resellerOptions, resellersQuery.isLoading, resellerId]);

  const parentSelectOptions = useMemo(() => {
    if (!resellerId.trim()) {
      return [{ value: "", label: "Choose a reseller first" }];
    }
    if (companiesByResellerQuery.isLoading && parentCompanyOptions.length === 0) {
      return [{ value: "", label: "Loading parent companies…" }];
    }
    const allRow = { value: "", label: "All parent companies" };
    const base =
      parentCompanyOptions.length > 0
        ? [allRow, ...parentCompanyOptions]
        : [{ value: "", label: "No parent companies" }];
    const pid = parentCompanyId.trim();
    if (pid && !base.some((o) => o.value === pid)) {
      return [{ value: pid, label: pid }, ...base];
    }
    return base;
  }, [resellerId, companiesByResellerQuery.isLoading, parentCompanyOptions, parentCompanyId]);

  const departmentOptions = useMemo(() => {
    return pickItemsArray(departmentsQuery.data)
      .map((row) => toIdNameOption(row))
      .filter((o): o is { value: string; label: string } => o !== null);
  }, [departmentsQuery.data]);

  const departmentTypeOptions = useMemo(() => {
    if (mayPickInternalDeptType) {
      return [
        { value: "Internal", label: "Internal" },
        { value: "External", label: "External" },
      ];
    }
    return [{ value: "External", label: "External" }];
  }, [mayPickInternalDeptType]);

  const departmentSelectOptions = useMemo(() => {
    if (departmentOptions.length > 0) return departmentOptions;
    return departmentsQuery.isLoading
      ? [{ value: "", label: "Loading…" }]
      : [{ value: "", label: "No departments available" }];
  }, [departmentOptions, departmentsQuery.isLoading]);

  useEffect(() => {
    if (!open) {
      detailHydratedForIdRef.current = null;
      deptScopeHydratedForIdRef.current = null;
      return;
    }
    if (!isEdit) {
      setName("");
      setDeptKind(mayPickInternalDeptType ? "Internal" : "External");
      setResellerId("");
      setParentCompanyId("");
      setDepartmentId("");
    }
  }, [open, isEdit, mayPickInternalDeptType]);

  useEffect(() => {
    detailHydratedForIdRef.current = null;
    deptScopeHydratedForIdRef.current = null;
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

  useEffect(() => {
    if (!open || !isEdit || !departmentDetailQuery.isSuccess || !departmentDetailQuery.data) return;
    if (deptScopeHydratedForIdRef.current === editId) return;
    const dept = extractDepartmentFromDetailApi(departmentDetailQuery.data);
    if (!dept || dept.id !== editDepartmentId) return;
    deptScopeHydratedForIdRef.current = editId;
    setDeptKind(dept.type);
    setResellerId(dept.resellerId?.trim() ?? "");
    setParentCompanyId(dept.parentCompanyId?.trim() ?? "");
  }, [
    open,
    isEdit,
    editId,
    editDepartmentId,
    departmentDetailQuery.isSuccess,
    departmentDetailQuery.data,
  ]);

  const handleDeptKindChange = (v: string) => {
    const next = v === "External" ? "External" : "Internal";
    setDeptKind(next);
    setResellerId("");
    setParentCompanyId("");
    setDepartmentId("");
  };

  const handleResellerChange = (v: string) => {
    setResellerId(v);
    setParentCompanyId("");
    setDepartmentId("");
  };

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
  const deptScopeLoading =
    isEdit &&
    editDepartmentId.length > 0 &&
    !departmentDetailQuery.isSuccess &&
    !departmentDetailQuery.isError;
  const formDisabled =
    savePending || detailLoading || deptScopeLoading || Boolean(detailErrorMessage) || Boolean(detailShapeError);

  const modalDescription = isEdit
    ? "Review the designation details, update the fields, and save your changes."
    : mayPickInternalDeptType
      ? "Choose department type, pick a department, then enter the designation name. Reseller and parent company are optional for external departments."
      : "Pick an external department, then enter the designation name. Reseller and parent company are optional to narrow the list.";

  return (
    <FormModal
      open={open}
      title={isEdit ? "Edit Designation" : "Add Designation"}
      description={modalDescription}
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
      ) : detailLoading || deptScopeLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", py: 5 }}>
          <CircularProgress size={36} aria-label="Loading designation" />
        </Box>
      ) : (
        <>
          <SelectField
            label="Department type"
            value={deptKind}
            onChange={handleDeptKindChange}
            options={departmentTypeOptions}
            menuMaxRows={4}
            disabled={savePending || departmentTypeOptions.length === 1}
          />

          {deptKind === "External" ? (
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 1.5 }}>
              <SelectField
                label="Reseller (optional)"
                value={resellerId}
                onChange={handleResellerChange}
                options={resellerSelectOptions}
                menuMaxRows={6}
                disabled={savePending}
              />
              <SelectField
                label="Parent company (optional)"
                value={parentCompanyId}
                onChange={(v) => {
                  setParentCompanyId(v);
                  setDepartmentId("");
                }}
                options={parentSelectOptions}
                menuMaxRows={6}
                disabled={savePending || !resellerId.trim()}
              />
            </Box>
          ) : null}

          <SelectField
            label="Department"
            value={departmentId}
            onChange={setDepartmentId}
            options={departmentSelectOptions}
            menuMaxRows={6}
            disabled={savePending}
          />

          <InputField
            label="Designation Name"
            placeholder="e.g. Senior Manager"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={savePending}
          />
        </>
      )}
    </FormModal>
  );
}
