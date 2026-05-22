"use client";

import { useEffect, useLayoutEffect, useMemo } from "react";
import Box from "@mui/material/Box";
import FormControl from "@mui/material/FormControl";
import FormControlLabel from "@mui/material/FormControlLabel";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { InputField, SelectField, Typography } from "@/components/common";
import { useDesignationsListQuery } from "@/lib/hooks/query";
import { pickItemsArray, toIdNameOption } from "@/app/dashboard/user-page/components/add-user-modal.utils";
import { childrenDraftFieldPath, getCompanySetupFieldError } from "@/lib/companies/company-setup-draft-field-paths";
import type { DraftChildPayload } from "@/lib/companies/setup-draft.utils";
import { sessionShowPocDeptDesignationPickFromList, useAuth } from "@/lib/auth";
import {
  resolveRoleIdForExternalAdminScope,
  type ExternalAdminScope,
} from "@/lib/users/user-admin-scope";
import { UserAdminScopeFields } from "@/app/dashboard/user-page/components/UserAdminScopeFields";

export type CompanySetupFieldErrorScope = "wizardChild" | "parentPocInvite";

export type CompanySetupChildPocBlockProps = {
  row: DraftChildPayload;
  childIndex: number;
  updateChildRow: (index: number, patch: Partial<DraftChildPayload>) => void;
  roleOptions: { value: string; label: string }[];
  departmentOptions: { value: string; label: string }[];
  rolesLoading: boolean;
  departmentsLoading: boolean;
  /** When true, POC fields are read-only (e.g. no update permission). */
  controlsDisabled?: boolean;
  /** Which API error map shape to use for `scrollAnchorPath` / `fieldErrors` keys. */
  fieldErrorScope?: CompanySetupFieldErrorScope;
  /** API paths → message, e.g. `childrenDraft.children.0.pocInvite.pocEmail`. */
  fieldErrors?: Record<string, string>;
  /** Wizard only: drives whether "Pick from list" is offered for POC dept/designation. */
  companySetupKind?: "new_reseller" | "existing_reseller";
};

export function CompanySetupChildPocBlock({
  row,
  childIndex,
  updateChildRow,
  roleOptions,
  departmentOptions,
  rolesLoading,
  departmentsLoading,
  controlsDisabled = false,
  fieldErrorScope = "wizardChild",
  fieldErrors,
  companySetupKind = "existing_reseller",
}: CompanySetupChildPocBlockProps) {
  const theme = useTheme() as AppTheme;
  const { isPlatformAdmin, user } = useAuth();
  const showPocPickFromList = sessionShowPocDeptDesignationPickFromList(
    isPlatformAdmin,
    user?.userType,
    companySetupKind,
  );

  const resolvePath = (relativePath: string) =>
    fieldErrorScope === "parentPocInvite"
      ? relativePath
      : childrenDraftFieldPath(childIndex, relativePath);

  const apiMsg = (relativePath: string) =>
    getCompanySetupFieldError(fieldErrors ?? {}, resolvePath(relativePath));

  const designationParams = useMemo(() => {
    const id = row.pocDepartmentId.trim();
    if (!id || row.pocDepartmentMode !== "existing") return undefined;
    return { departmentId: id };
  }, [row.pocDepartmentId, row.pocDepartmentMode]);

  const designationsQuery = useDesignationsListQuery(designationParams, {
    enabled: !!designationParams?.departmentId && row.pocDesignationMode === "existing",
    scope: "company-setup-poc",
  });

  const designationOptions = useMemo(() => {
    return pickItemsArray(designationsQuery.data)
      .map(toIdNameOption)
      .filter((o): o is { value: string; label: string } => o !== null);
  }, [designationsQuery.data]);

  const designationSelectOptions = useMemo(() => {
    const base = designationOptions;
    if (
      row.pocDesignationId.trim() &&
      row.pocDesignationTitle.trim() &&
      !base.some((o) => o.value === row.pocDesignationId.trim())
    ) {
      return [
        { value: row.pocDesignationId.trim(), label: row.pocDesignationTitle.trim() },
        ...base,
      ];
    }
    return base.length > 0
      ? base
      : [
          {
            value: "",
            label: designationsQuery.isLoading ? "Loading…" : "— Select designation —",
          },
        ];
  }, [
    designationOptions,
    row.pocDesignationId,
    row.pocDesignationTitle,
    designationsQuery.isLoading,
  ]);

  const roleSelectOptions =
    roleOptions.length > 0
      ? roleOptions
      : [{ value: "", label: rolesLoading ? "Loading…" : "— Select role —" }];

  useEffect(() => {
    if (!roleOptions.length) return;
    const scope = row.pocWideResellerScope ? "wide_reseller" : "parent_company";
    const adminRoleId = resolveRoleIdForExternalAdminScope(scope, roleSelectOptions);
    if (adminRoleId && row.roleId !== adminRoleId) {
      updateChildRow(childIndex, { roleId: adminRoleId });
    }
  }, [
    childIndex,
    roleOptions.length,
    row.pocWideResellerScope,
    row.roleId,
    roleSelectOptions,
    updateChildRow,
  ]);

  const departmentSelectOptions =
    departmentOptions.length > 0
      ? departmentOptions
      : [
          {
            value: "",
            label: departmentsLoading
              ? "Loading…"
              : "No external departments found for this reseller",
          },
        ];

  useLayoutEffect(() => {
    if (showPocPickFromList) return;
    if (row.pocDepartmentMode !== "existing" && row.pocDesignationMode !== "existing") return;
    updateChildRow(childIndex, {
      pocDepartmentMode: "new",
      pocDepartmentId: "",
      pocDesignationMode: "new",
      pocDesignationId: "",
      pocDesignationTitle: "",
    });
  }, [
    showPocPickFromList,
    childIndex,
    row.pocDepartmentMode,
    row.pocDesignationMode,
    updateChildRow,
  ]);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2, width: "100%", mt: 0.5 }}>
      <Typography variant="medium" color="white" fontWeight={600}>
        Point of contact (POC)
      </Typography>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
          gap: 2,
          width: "100%",
        }}
      >
        <InputField
          label="First name"
          placeholder="Ali"
          value={row.pocFirstName}
          disabled={controlsDisabled}
          scrollAnchorPath={resolvePath("pocInvite.firstName")}
          error={!!apiMsg("pocInvite.firstName")}
          helperText={apiMsg("pocInvite.firstName") || undefined}
          onChange={(e) => updateChildRow(childIndex, { pocFirstName: e.target.value })}
        />
        <InputField
          label="Middle name (optional)"
          placeholder="—"
          value={row.pocMiddleName}
          disabled={controlsDisabled}
          scrollAnchorPath={resolvePath("pocInvite.middleName")}
          error={!!apiMsg("pocInvite.middleName")}
          helperText={apiMsg("pocInvite.middleName") || undefined}
          onChange={(e) => updateChildRow(childIndex, { pocMiddleName: e.target.value })}
        />
        <InputField
          label="Last name"
          placeholder="Raza"
          value={row.pocLastName}
          disabled={controlsDisabled}
          sx={{ gridColumn: { sm: "1 / -1" } }}
          scrollAnchorPath={resolvePath("pocInvite.lastName")}
          error={!!apiMsg("pocInvite.lastName")}
          helperText={apiMsg("pocInvite.lastName") || undefined}
          onChange={(e) => updateChildRow(childIndex, { pocLastName: e.target.value })}
        />
      </Box>
      <InputField
        label="POC email"
        placeholder="ali.raza@client.example"
        type="email"
        value={row.pocEmail}
        disabled={controlsDisabled}
        inputProps={{ maxLength: 255 }}
        scrollAnchorPath={resolvePath("pocInvite.pocEmail")}
        error={!!apiMsg("pocInvite.pocEmail")}
        helperText={apiMsg("pocInvite.pocEmail") || undefined}
        onChange={(e) => updateChildRow(childIndex, { pocEmail: e.target.value })}
      />

      <Box data-setup-scroll-anchor={resolvePath("pocInvite.wideResellerScope")}>
        <UserAdminScopeFields
          theme={theme}
          userType="External"
          internalScope="standard"
          externalScope={row.pocWideResellerScope ? "wide_reseller" : "parent_company"}
          onInternalScopeChange={() => {}}
          onExternalScopeChange={(scope: ExternalAdminScope) => {
            const adminRoleId = resolveRoleIdForExternalAdminScope(scope, roleSelectOptions);
            updateChildRow(childIndex, {
              pocWideResellerScope: scope === "wide_reseller",
              ...(adminRoleId ? { roleId: adminRoleId } : {}),
            });
          }}
          disabled={controlsDisabled}
          showInternal={false}
        />
        {apiMsg("pocInvite.wideResellerScope") ? (
          <Typography variant="caption" sx={{ color: theme.palette.error.main, display: "block", mt: 0.5 }}>
            {apiMsg("pocInvite.wideResellerScope")}
          </Typography>
        ) : null}
      </Box>

      <Box>
        <SelectField
          label="Role"
          value={row.roleId}
          disabled
          scrollAnchorPath={resolvePath("pocInvite.roleId")}
          onChange={(id) => updateChildRow(childIndex, { roleId: id })}
          options={roleSelectOptions}
        />
        {apiMsg("pocInvite.roleId") ? (
          <Typography variant="caption" sx={{ color: theme.palette.error.main, display: "block", mt: 0.5 }}>
            {apiMsg("pocInvite.roleId")}
          </Typography>
        ) : null}
      </Box>

      <Typography variant="body2" sx={{ color: theme.app.dashboard.textMuted, fontWeight: 600 }}>
        Department
      </Typography>
      <FormControl component="fieldset" sx={{ width: "100%", m: 0, p: 0, border: "none" }}>
        <RadioGroup
          row
          value={row.pocDepartmentMode}
          onChange={(e) => {
            if (controlsDisabled) return;
            const v = e.target.value;
            if (!showPocPickFromList) return;
            if (v !== "existing" && v !== "new") return;
            if (v === "new") {
              updateChildRow(childIndex, {
                pocDepartmentMode: "new",
                pocDepartmentId: "",
                pocDesignationMode: "new",
                pocDesignationId: "",
                pocDesignationTitle: "",
              });
            } else {
              updateChildRow(childIndex, {
                pocDepartmentMode: "existing",
                pocDepartmentName: "",
                pocDepartmentNewDescription: "",
              });
            }
          }}
        >
          {showPocPickFromList ? (
            <FormControlLabel
              value="existing"
              control={
                <Radio
                  size="small"
                  sx={{
                    color: theme.app.dashboard.textMuted,
                    "&.Mui-checked": { color: theme.app.dashboard.accentBlue },
                  }}
                />
              }
              label={<Typography variant="body2">Pick from list</Typography>}
              sx={{ mr: 2 }}
            />
          ) : null}
          <FormControlLabel
            value="new"
            control={
              <Radio
                size="small"
                disabled={controlsDisabled}
                sx={{
                  color: theme.app.dashboard.textMuted,
                  "&.Mui-checked": { color: theme.app.dashboard.accentBlue },
                }}
              />
            }
            label={<Typography variant="body2">New department</Typography>}
          />
        </RadioGroup>
      </FormControl>

      {row.pocDepartmentMode === "existing" ? (
        <Box>
          <SelectField
            label="Department"
            value={row.pocDepartmentId}
            disabled={controlsDisabled}
            scrollAnchorPath={`${resolvePath("pocInvite.departmentId")},${resolvePath("pocInvite.departmentName")}`}
            onChange={(id) => {
              const label = departmentOptions.find((o) => o.value === id)?.label ?? "";
              updateChildRow(childIndex, {
                pocDepartmentId: id,
                pocDepartmentName: label,
                pocDesignationId: "",
                pocDesignationTitle: "",
              });
            }}
            options={departmentSelectOptions}
          />
          {apiMsg("pocInvite.departmentId") || apiMsg("pocInvite.departmentName") ? (
            <Typography variant="caption" sx={{ color: theme.palette.error.main, display: "block", mt: 0.5 }}>
              {apiMsg("pocInvite.departmentId") || apiMsg("pocInvite.departmentName")}
            </Typography>
          ) : null}
        </Box>
      ) : (
        <>
          <InputField
            label="New department name"
            placeholder="Operations"
            value={row.pocDepartmentName}
            disabled={controlsDisabled}
            scrollAnchorPath={resolvePath("pocInvite.departmentName")}
            error={!!apiMsg("pocInvite.departmentName")}
            helperText={apiMsg("pocInvite.departmentName") || undefined}
            onChange={(e) => updateChildRow(childIndex, { pocDepartmentName: e.target.value })}
          />
          <InputField
            label="Department details (optional)"
            placeholder="Brief description, location, or notes for this department"
            value={row.pocDepartmentNewDescription}
            disabled={controlsDisabled}
            inputProps={{ maxLength: 500 }}
            scrollAnchorPath={resolvePath("pocInvite.departmentDetails")}
            error={!!apiMsg("pocInvite.departmentDetails")}
            helperText={apiMsg("pocInvite.departmentDetails") || undefined}
            onChange={(e) =>
              updateChildRow(childIndex, { pocDepartmentNewDescription: e.target.value })
            }
          />
        </>
      )}

      <Typography variant="body2" sx={{ color: theme.app.dashboard.textMuted, fontWeight: 600 }}>
        Designation
      </Typography>
      <FormControl component="fieldset" sx={{ width: "100%", m: 0, p: 0, border: "none" }}>
        <RadioGroup
          row
          value={row.pocDesignationMode}
          onChange={(e) => {
            if (controlsDisabled) return;
            const v = e.target.value;
            if (!showPocPickFromList) return;
            if (v !== "existing" && v !== "new") return;
            updateChildRow(childIndex, {
              pocDesignationMode: v,
              pocDesignationId: "",
              pocDesignationTitle: "",
              pocDesignationNewDetails: "",
            });
          }}
        >
          {showPocPickFromList ? (
            <FormControlLabel
              value="existing"
              control={
                <Radio
                  size="small"
                  disabled={row.pocDepartmentMode === "new"}
                  sx={{
                    color: theme.app.dashboard.textMuted,
                    "&.Mui-checked": { color: theme.app.dashboard.accentBlue },
                  }}
                />
              }
              label={<Typography variant="body2">Pick from list</Typography>}
              sx={{ mr: 2 }}
            />
          ) : null}
          <FormControlLabel
            value="new"
            control={
              <Radio
                size="small"
                disabled={controlsDisabled}
                sx={{
                  color: theme.app.dashboard.textMuted,
                  "&.Mui-checked": { color: theme.app.dashboard.accentBlue },
                }}
              />
            }
            label={<Typography variant="body2">New designation</Typography>}
          />
        </RadioGroup>
      </FormControl>

      {row.pocDesignationMode === "existing" && row.pocDepartmentMode === "existing" ? (
        <Box>
          <SelectField
            label="Designation"
            value={row.pocDesignationId}
            disabled={controlsDisabled}
            scrollAnchorPath={`${resolvePath("pocInvite.designationId")},${resolvePath("pocInvite.designationTitle")}`}
            onChange={(id) => {
              const label =
                designationOptions.find((o) => o.value === id)?.label ??
                designationSelectOptions.find((o) => o.value === id)?.label ??
                "";
              updateChildRow(childIndex, {
                pocDesignationId: id,
                pocDesignationTitle: label,
              });
            }}
            options={designationSelectOptions}
          />
          {apiMsg("pocInvite.designationId") || apiMsg("pocInvite.designationTitle") ? (
            <Typography variant="caption" sx={{ color: theme.palette.error.main, display: "block", mt: 0.5 }}>
              {apiMsg("pocInvite.designationId") || apiMsg("pocInvite.designationTitle")}
            </Typography>
          ) : null}
        </Box>
      ) : (
        <>
          <InputField
            label="Designation title"
            placeholder="Head of IT"
            value={row.pocDesignationTitle}
            disabled={controlsDisabled}
            scrollAnchorPath={resolvePath("pocInvite.designationTitle")}
            error={!!apiMsg("pocInvite.designationTitle")}
            helperText={apiMsg("pocInvite.designationTitle") || undefined}
            onChange={(e) => updateChildRow(childIndex, { pocDesignationTitle: e.target.value })}
          />
          <InputField
            label="Designation details (optional)"
            placeholder="Scope, grade, or other context for this designation"
            value={row.pocDesignationNewDetails}
            disabled={controlsDisabled}
            inputProps={{ maxLength: 500 }}
            scrollAnchorPath={resolvePath("pocInvite.designationDetails")}
            error={!!apiMsg("pocInvite.designationDetails")}
            helperText={apiMsg("pocInvite.designationDetails") || undefined}
            onChange={(e) =>
              updateChildRow(childIndex, { pocDesignationNewDetails: e.target.value })
            }
          />
        </>
      )}
    </Box>
  );
}
