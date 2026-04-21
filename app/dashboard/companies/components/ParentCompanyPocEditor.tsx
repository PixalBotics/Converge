"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Box from "@mui/material/Box";
import FormControlLabel from "@mui/material/FormControlLabel";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import { alpha, useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import type { JsonRecord } from "@/api";
import type { CompanyPocInviteSummary, ParentCompanyDetailNode } from "@/api/types/companies.types";
import { Button, SelectField, Typography } from "@/components/common";
import { CompanyPocSummaryBlock } from "./CompanyPocSummaryBlock";
import { CompanySetupChildPocBlock } from "./CompanySetupChildPocBlock";
import {
  useDepartmentsListQuery,
  useRolesListQuery,
  useUpdateParentCompanyMutation,
  useUsersListQuery,
} from "@/lib/hooks/query";
import { normalizePocsFromCarrier } from "@/lib/companies/parent-detail-pocs";
import {
  buildPocInviteForRow,
  emptyDraftChildRow,
  isChildRowPocComplete,
  type DraftChildPayload,
} from "@/lib/companies/setup-draft.utils";
import { extractNestFieldErrors } from "@/lib/companies/extract-nest-field-errors";
import { extractApiErrorMessageForToast } from "@/lib/notify/extract-api-message";
import { publishAppToast } from "@/lib/notify";
import { extractUsersRows } from "@/app/dashboard/user-page/utils";
import { pickItemsArray, toIdNameOption } from "@/app/dashboard/user-page/components/add-user-modal.utils";

function pocInviteToDraft(p: CompanyPocInviteSummary): DraftChildPayload {
  const base = emptyDraftChildRow();
  const deptName = String(p.departmentName ?? "").trim();
  const desTitle = String(p.designationTitle ?? "").trim();
  return {
    ...base,
    pocFirstName: String(p.firstName ?? "").trim(),
    pocMiddleName: String(p.middleName ?? "").trim(),
    pocLastName: String(p.lastName ?? "").trim(),
    pocEmail: String(p.pocEmail ?? p.email ?? "").trim(),
    roleId: String(p.roleId ?? "").trim(),
    pocDepartmentMode: deptName ? "new" : "existing",
    pocDepartmentId: "",
    pocDepartmentName: deptName,
    pocDepartmentNewDescription: String(p.departmentDetails ?? "").trim(),
    pocDesignationMode: desTitle ? "new" : "existing",
    pocDesignationId: "",
    pocDesignationTitle: desTitle,
    pocDesignationNewDetails: "",
  };
}

export type ParentCompanyPocEditorProps = {
  parentId: string;
  resellerId: string;
  parentCompany: ParentCompanyDetailNode;
};

export function ParentCompanyPocEditor({ parentId, resellerId, parentCompany }: ParentCompanyPocEditorProps) {
  const theme = useTheme() as AppTheme;
  const updateParentMutation = useUpdateParentCompanyMutation();

  const [pocMode, setPocMode] = useState<"existing" | "invite">("existing");
  const [selectedUserId, setSelectedUserId] = useState("");
  const [inviteRow, setInviteRow] = useState<DraftChildPayload>(() => emptyDraftChildRow());
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const displayRows = useMemo(() => normalizePocsFromCarrier(parentCompany), [parentCompany]);

  const pocInviteSignature = useMemo(() => JSON.stringify(parentCompany.pocInvite ?? null), [parentCompany.pocInvite]);

  const usersQuery = useUsersListQuery(
    { parentCompanyId: parentId.trim(), page: 1, limit: 200 },
    { enabled: parentId.trim().length > 0 },
  );
  const userRows = useMemo(() => extractUsersRows(usersQuery.data), [usersQuery.data]);
  const userOptions = useMemo(() => {
    const base = userRows.map((u) => ({
      value: u.id,
      label: `${u.user} · ${u.email}`,
    }));
    return [{ value: "", label: usersQuery.isLoading ? "Loading users…" : "— Select user under this parent —" }, ...base];
  }, [userRows, usersQuery.isLoading]);

  const rolesQuery = useRolesListQuery(undefined, { enabled: true });
  const roleOptions = useMemo(() => {
    return pickItemsArray(rolesQuery.data)
      .map(toIdNameOption)
      .filter((o): o is { value: string; label: string } => o !== null);
  }, [rolesQuery.data]);

  const departmentParams = useMemo(() => {
    const rid = resellerId.trim();
    const pid = parentId.trim();
    if (!rid || !pid) return undefined;
    return { resellerId: rid, parentCompanyId: pid, type: "External", all: true } as JsonRecord;
  }, [resellerId, parentId]);

  const departmentsQuery = useDepartmentsListQuery(departmentParams, {
    enabled: Boolean(departmentParams?.resellerId && departmentParams?.parentCompanyId),
    scope: "parent-company-poc",
  });
  const departmentOptions = useMemo(() => {
    return pickItemsArray(departmentsQuery.data)
      .map(toIdNameOption)
      .filter((o): o is { value: string; label: string } => o !== null);
  }, [departmentsQuery.data]);

  useEffect(() => {
    const invite = parentCompany.pocInvite;
    if (invite && typeof invite === "object") {
      setInviteRow(pocInviteToDraft(invite));
    } else {
      setInviteRow(emptyDraftChildRow());
    }
  }, [parentId, pocInviteSignature]);

  const updateInviteRow = useCallback((_: number, patch: Partial<DraftChildPayload>) => {
    setInviteRow((prev) => ({ ...prev, ...patch }));
  }, []);

  const handleSaveExistingUser = async () => {
    if (!selectedUserId.trim()) {
      publishAppToast({ variant: "error", message: "Select a user from the list." });
      return;
    }
    setFieldErrors({});
    const body: JsonRecord = { userId: selectedUserId.trim() };
    try {
      await updateParentMutation.mutateAsync({ parentId, body });
      publishAppToast({ variant: "success", message: "Primary contact linked to this parent company." });
      setSelectedUserId("");
    } catch (e) {
      const fields = extractNestFieldErrors(e);
      if (Object.keys(fields).length) setFieldErrors(fields);
      publishAppToast({
        variant: "error",
        message: extractApiErrorMessageForToast(e) || "Could not link user. Try the invite flow or verify the selected user.",
      });
    }
  };

  const handleSaveInvite = async () => {
    setFieldErrors({});
    if (!isChildRowPocComplete(inviteRow)) {
      publishAppToast({ variant: "error", message: "Fill all required POC fields (name, email, role, department, designation)." });
      return;
    }
    const pocInvite = buildPocInviteForRow(inviteRow);
    if (!pocInvite) return;
    try {
      await updateParentMutation.mutateAsync({ parentId, body: { pocInvite } });
      publishAppToast({ variant: "success", message: "POC invite saved on parent company." });
    } catch (e) {
      const fields = extractNestFieldErrors(e);
      if (Object.keys(fields).length) setFieldErrors(fields);
      publishAppToast({ variant: "error", message: extractApiErrorMessageForToast(e) || "Could not save invite." });
    }
  };

  const handleRemovePoc = async () => {
    setFieldErrors({});
    const contactRow = displayRows.find((r) => r.companyContactId);
    try {
      if (contactRow?.companyContactId) {
        const body: JsonRecord = { removeCompanyContactId: contactRow.companyContactId };
        await updateParentMutation.mutateAsync({ parentId, body });
      } else {
        await updateParentMutation.mutateAsync({ parentId, body: { pocInvite: null } });
      }
      publishAppToast({ variant: "success", message: "Primary contact removed." });
      setInviteRow(emptyDraftChildRow());
      setSelectedUserId("");
    } catch (e) {
      const fields = extractNestFieldErrors(e);
      if (Object.keys(fields).length) setFieldErrors(fields);
      publishAppToast({
        variant: "error",
        message:
          extractApiErrorMessageForToast(e) ||
          "Could not remove contact. Backend may expect a different payload (e.g. only pocInvite: null).",
      });
    }
  };

  const sectionLabelSx = {
    fontSize: "0.6875rem",
    fontWeight: 700,
    letterSpacing: "0.08em",
    textTransform: "uppercase" as const,
    color: theme.app.dashboard.textMuted,
    mb: 1,
  };

  return (
    <Box
      sx={{
        mt: 2,
        pt: 2.25,
        borderTop: `1px solid ${alpha(theme.app.dashboard.cardBorder, 0.85)}`,
      }}
    >
      <Typography sx={sectionLabelSx}>Update point of contact</Typography>
      <Typography variant="body2" sx={{ color: theme.app.dashboard.textMuted, mb: 2, lineHeight: 1.55, maxWidth: 640 }}>
        Pick someone already under this parent company, or send a new invite. Saves go through the same parent-company
        update API; the user dropdown uses the same list filter as the Users screen (by parent company).
      </Typography>

      <CompanyPocSummaryBlock rows={displayRows} />

      {displayRows.length > 0 ? (
        <Box sx={{ mt: 2, mb: 1 }}>
          <Button
            type="button"
            variant="outlined"
            color="error"
            size="small"
            disabled={updateParentMutation.isPending}
            onClick={() => void handleRemovePoc()}
          >
            {updateParentMutation.isPending ? "Removing…" : "Remove current POC"}
          </Button>
        </Box>
      ) : null}

      <RadioGroup row value={pocMode} onChange={(_, v) => setPocMode(v as "existing" | "invite")} sx={{ gap: 2, mb: 2, mt: 2 }}>
        <FormControlLabel value="existing" control={<Radio size="small" />} label="Existing user" sx={{ color: theme.app.text.primary }} />
        <FormControlLabel value="invite" control={<Radio size="small" />} label="New invite" sx={{ color: theme.app.text.primary }} />
      </RadioGroup>

      {pocMode === "existing" ? (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, maxWidth: 480 }}>
          <SelectField label="User under this parent" value={selectedUserId} onChange={setSelectedUserId} options={userOptions} menuMaxRows={8} />
          <Button
            type="button"
            variant="primary"
            size="small"
            sx={{ alignSelf: "flex-start" }}
            disabled={updateParentMutation.isPending}
            onClick={() => void handleSaveExistingUser()}
          >
            {updateParentMutation.isPending ? "Saving…" : "Save linked user as POC"}
          </Button>
        </Box>
      ) : (
        <Box sx={{ maxWidth: 720 }}>
          <CompanySetupChildPocBlock
            row={inviteRow}
            childIndex={0}
            updateChildRow={updateInviteRow}
            roleOptions={roleOptions}
            departmentOptions={departmentOptions}
            rolesLoading={rolesQuery.isLoading}
            departmentsLoading={departmentsQuery.isLoading}
            fieldErrors={fieldErrors}
          />
          <Button
            type="button"
            variant="primary"
            size="small"
            sx={{ mt: 2, alignSelf: "flex-start" }}
            disabled={updateParentMutation.isPending}
            onClick={() => void handleSaveInvite()}
          >
            {updateParentMutation.isPending ? "Saving…" : "Save POC invite"}
          </Button>
        </Box>
      )}
    </Box>
  );
}
