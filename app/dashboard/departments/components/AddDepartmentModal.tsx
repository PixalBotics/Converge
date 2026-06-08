"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Radio from "@mui/material/Radio";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { DashboardCard, FormModal, InputField, Label, SelectField, Typography } from "@/components/common";
import { extractApiErrorMessageForToast, publishAppToast } from "@/lib/notify";
import {
  useCompaniesByResellerQuery,
  useCompaniesSetupResellersQuery,
  useCreateDepartmentMutation,
  useDepartmentQuery,
  useUpdateDepartmentMutation,
} from "@/lib/hooks";
import type { JsonRecord } from "@/api";
import {
  extractParentCompaniesFromByResellerTree,
  pickItemsArray,
  toIdNameOption,
} from "@/app/dashboard/user-page/components/add-user-modal.utils";
import { extractDepartmentFromDetailApi, type DepartmentRow } from "../utils";
import { useAuth, sessionMayPickInternalUserScope } from "@/lib/auth";

const EMPTY_SELECT = [{ label: "—", value: "" }] as const;

export type AddDepartmentModalProps = {
  open: boolean;
  onClose: () => void;
  /** Called after a successful save (e.g. refetch list). */
  onSaved?: () => void;
  /** When set, modal loads `GET /hrms/departments/:id` and updates that department. */
  editDepartment?: DepartmentRow | null;
};

export function AddDepartmentModal({
  open,
  onClose,
  onSaved,
  editDepartment = null,
}: AddDepartmentModalProps) {
  const theme = useTheme() as AppTheme;
  const { isPlatformAdmin, user: authUser } = useAuth();
  const mayPickInternalDeptType = useMemo(
    () => sessionMayPickInternalUserScope(isPlatformAdmin, authUser),
    [isPlatformAdmin, authUser?.userType],
  );

  const [departmentName, setDepartmentName] = useState("");
  const [departmentType, setDepartmentType] = useState<"Internal" | "External">("Internal");
  const [resellerId, setResellerId] = useState("");
  const [parentCompanyId, setParentCompanyId] = useState("");

  const editId = editDepartment?.id?.trim() ?? "";
  const isEdit = editId.length > 0;
  /** After applying `GET /hrms/departments/:id` once per open+id, avoid overwriting user edits on refetch. */
  const detailHydratedForEditIdRef = useRef<string | null>(null);

  const createMutation = useCreateDepartmentMutation();
  const updateMutation = useUpdateDepartmentMutation();
  const savePending = createMutation.isPending || updateMutation.isPending;

  const departmentDetailQuery = useDepartmentQuery(editId, {
    enabled: open && isEdit,
    scope: "add-department-modal",
    skipGlobalToast: true,
  });

  const showInternalDepartmentTypeCard = useMemo(() => {
    if (mayPickInternalDeptType) return true;
    if (!isEdit) return false;
    if (!departmentDetailQuery.isSuccess) return true;
    return departmentType === "Internal";
  }, [mayPickInternalDeptType, isEdit, departmentDetailQuery.isSuccess, departmentType]);

  const resellersQuery = useCompaniesSetupResellersQuery({
    enabled: open && departmentType === "External",
  });

  const companiesByResellerQuery = useCompaniesByResellerQuery(
    resellerId,
    { view: "tree", sortBy: "name", sortOrder: "asc", all: true },
    {
      enabled: open && departmentType === "External" && resellerId.trim().length > 0,
    },
  );

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
    const loadingRow = {
      value: "",
      label: resellersQuery.isLoading ? "Loading resellers…" : "— Select reseller —",
    };
    const base = resellerOptions.length > 0 ? resellerOptions : [loadingRow];
    const rid = resellerId.trim();
    if (rid && !base.some((o) => o.value === rid)) {
      return [{ value: rid, label: rid }, ...base];
    }
    return base;
  }, [resellerOptions, resellersQuery.isLoading, resellerId]);

  const parentSelectOptions = useMemo(() => {
    if (!resellerId.trim()) return [...EMPTY_SELECT];
    if (companiesByResellerQuery.isLoading && parentCompanyOptions.length === 0) {
      return [{ value: "", label: "Loading parent companies…" }];
    }
    const base =
      parentCompanyOptions.length > 0
        ? parentCompanyOptions
        : [{ value: "", label: "No parent companies" }];
    const pid = parentCompanyId.trim();
    if (pid && !base.some((o) => o.value === pid)) {
      return [{ value: pid, label: pid }, ...base];
    }
    return base;
  }, [resellerId, companiesByResellerQuery.isLoading, parentCompanyOptions, parentCompanyId]);

  useEffect(() => {
    if (!open) {
      detailHydratedForEditIdRef.current = null;
    }
  }, [open]);

  useEffect(() => {
    detailHydratedForEditIdRef.current = null;
  }, [editId]);

  useEffect(() => {
    if (!open || isEdit) return;
    setDepartmentName("");
    setDepartmentType(mayPickInternalDeptType ? "Internal" : "External");
    setResellerId("");
    setParentCompanyId("");
  }, [open, isEdit, mayPickInternalDeptType]);

  useEffect(() => {
    if (!open || !isEdit || !departmentDetailQuery.isSuccess || !departmentDetailQuery.data) return;
    const row = extractDepartmentFromDetailApi(departmentDetailQuery.data);
    if (!row || row.id !== editId) return;
    if (detailHydratedForEditIdRef.current === editId) return;
    detailHydratedForEditIdRef.current = editId;
    setDepartmentName(row.name ?? "");
    setDepartmentType(row.type);
    setResellerId(row.resellerId?.trim() ?? "");
    setParentCompanyId(row.parentCompanyId?.trim() ?? "");
  }, [open, isEdit, editId, departmentDetailQuery.isSuccess, departmentDetailQuery.data]);

  const setTypeInternal = () => {
    setDepartmentType("Internal");
    setResellerId("");
    setParentCompanyId("");
  };

  const setTypeExternal = () => {
    setDepartmentType("External");
  };

  const handleSave = () => {
    const name = departmentName.trim();
    if (!name) {
      publishAppToast({ variant: "error", message: "Please enter a department name." });
      return;
    }

    if (departmentType === "External") {
      if (!resellerId.trim()) {
        publishAppToast({ variant: "error", message: "Please select a reseller." });
        return;
      }
      if (!parentCompanyId.trim()) {
        publishAppToast({ variant: "error", message: "Please select a parent company." });
        return;
      }
    }

    const body: JsonRecord = {
      name,
      type: departmentType,
    };
    if (departmentType === "External") {
      body.resellerId = resellerId.trim();
      body.parentCompanyId = parentCompanyId.trim();
    }

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
    isEdit && departmentDetailQuery.isError
      ? extractApiErrorMessageForToast(departmentDetailQuery.error) ?? "Could not load department."
      : null;

  const detailParsedRow =
    isEdit && departmentDetailQuery.isSuccess && departmentDetailQuery.data
      ? extractDepartmentFromDetailApi(departmentDetailQuery.data)
      : null;

  const detailShapeError =
    isEdit &&
    departmentDetailQuery.isSuccess &&
    !detailErrorMessage &&
    (!detailParsedRow || detailParsedRow.id !== editId)
      ? "We couldn’t load the department details. Please try again."
      : null;

  const detailLoading = isEdit && !departmentDetailQuery.isSuccess && !departmentDetailQuery.isError;
  const formDisabled =
    savePending || detailLoading || Boolean(detailErrorMessage) || Boolean(detailShapeError);

  return (
    <FormModal
      open={open}
      title={isEdit ? "Edit Department" : "Add Department"}
      description={
        isEdit
          ? "Review the department details, update the fields, and save your changes."
          : "Create a new department with the appropriate type and access levels."
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
          <CircularProgress size={36} aria-label="Loading department" />
        </Box>
      ) : (
        <>
          <InputField
            label="Department Name"
            placeholder="Department Name"
            value={departmentName}
            onChange={(e) => setDepartmentName(e.target.value)}
            disabled={savePending}
          />

          <Box>
            <Label htmlFor="department-type-cards" variant="mediumLarge" sx={{ mb: 0.75 }}>
              Department Type
            </Label>
            <Box
              id="department-type-cards"
              role="radiogroup"
              aria-label="Department type"
              sx={{
                display: "grid",
                gridTemplateColumns: showInternalDepartmentTypeCard
                  ? { xs: "1fr", sm: "1fr 1fr" }
                  : { xs: "1fr", sm: "1fr" },
                gap: 2,
              }}
            >
              {showInternalDepartmentTypeCard ? (
                <DashboardCard
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    cursor: savePending ? "default" : "pointer",
                    opacity: savePending ? 0.6 : 1,
                    pointerEvents: savePending ? "none" : "auto",
                    background:
                      departmentType === "Internal"
                        ? theme.app.dashboard.navActiveBg
                        : theme.app.dashboard.cardBg,
                  }}
                  onClick={() => {
                    if (savePending) return;
                    setTypeInternal();
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
                    <Radio
                      checked={departmentType === "Internal"}
                      onChange={() => {
                        if (savePending) return;
                        setTypeInternal();
                      }}
                      value="Internal"
                      disabled={savePending}
                      disableRipple
                      icon={
                        <Box
                          sx={{
                            width: 16,
                            height: 16,
                            borderRadius: "9999px",
                            border: "2px solid rgba(148,163,184,0.6)",
                            bgcolor: "transparent",
                          }}
                        />
                      }
                      checkedIcon={
                        <Box
                          sx={{
                            width: 16,
                            height: 16,
                            borderRadius: "9999px",
                            bgcolor: theme.app.dashboard.accentGreen,
                            boxShadow: "0 0 0 4px rgba(34,197,94,0.35)",
                          }}
                        />
                      }
                      sx={{ p: 0.25 }}
                    />
                    <Box>
                      <Typography variant="medium" color="white" sx={{ mb: 0.25 }}>
                        Internal
                      </Typography>
                      <Typography variant="small" sx={{ color: theme.app.dashboard.textMuted }}>
                        Internal platform department
                      </Typography>
                    </Box>
                  </Box>
                </DashboardCard>
              ) : null}

              <DashboardCard
                sx={{
                  p: 2,
                  borderRadius: 2,
                  cursor: savePending ? "default" : "pointer",
                  opacity: savePending ? 0.6 : 1,
                  pointerEvents: savePending ? "none" : "auto",
                  background:
                    departmentType === "External"
                      ? theme.app.dashboard.navActiveBg
                      : theme.app.dashboard.cardBg,
                }}
                onClick={() => {
                  if (savePending) return;
                  setTypeExternal();
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
                  <Radio
                    checked={departmentType === "External"}
                    onChange={() => {
                      if (savePending) return;
                      setTypeExternal();
                    }}
                    value="External"
                    disabled={savePending}
                    disableRipple
                    icon={
                      <Box
                        sx={{
                          width: 16,
                          height: 16,
                          borderRadius: "9999px",
                          border: "2px solid rgba(148,163,184,0.6)",
                          bgcolor: "transparent",
                        }}
                      />
                    }
                    checkedIcon={
                      <Box
                        sx={{
                          width: 16,
                          height: 16,
                          borderRadius: "9999px",
                          bgcolor: theme.app.dashboard.accentGreen,
                          boxShadow: "0 0 0 4px rgba(34,197,94,0.35)",
                        }}
                      />
                    }
                    sx={{ p: 0.25 }}
                  />
                  <Box>
                    <Typography variant="medium" color="white" sx={{ mb: 0.25 }}>
                      External
                    </Typography>
                    <Typography variant="small" sx={{ color: theme.app.dashboard.textMuted }}>
                      External company department
                    </Typography>
                  </Box>
                </Box>
              </DashboardCard>
            </Box>
          </Box>

          {departmentType === "External" ? (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <SelectField
                label="Reseller"
                value={resellerId}
                onChange={(v) => {
                  setResellerId(v);
                  setParentCompanyId("");
                }}
                options={resellerSelectOptions}
                menuMaxRows={4}
              />
              <SelectField
                label="Parent Company"
                value={parentCompanyId}
                onChange={setParentCompanyId}
                options={parentSelectOptions}
                menuMaxRows={4}
              />
            </Box>
          ) : null}
        </>
      )}
    </FormModal>
  );
}
