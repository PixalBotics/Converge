"use client";

import { useMemo, useState } from "react";
import Box from "@mui/material/Box";
import FormControlLabel from "@mui/material/FormControlLabel";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import { alpha, useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { Button, SelectField, Typography } from "@/components/common";
import type { PocEditRow } from "./ChildCompanyPocPanel";
import { CompanyPocSummaryBlock } from "./CompanyPocSummaryBlock";
import { CompanySetupChildPocBlock } from "./CompanySetupChildPocBlock";
import { normalizePocsFromCarrier } from "@/lib/companies/parent-detail-pocs";
import { extractUsersRows } from "@/app/dashboard/user-page/utils";
import { pickItemsArray, toIdNameOption } from "@/app/dashboard/user-page/components/add-user-modal.utils";
import {
  buildPocInviteForRow,
  emptyDraftChildRow,
  isChildRowPocComplete,
  type DraftChildPayload,
} from "@/lib/companies/setup-draft.utils";
import { useDepartmentsListQuery, useRolesListQuery, useUsersListQuery } from "@/lib/hooks/query";

import type { JsonRecord } from "@/api";
import type { ParentCompanyChildDetail } from "@/api/types/companies.types";

export type ChildCompanyPocEditorProps = {
  child: ParentCompanyChildDetail;
  resellerId: string;
  parentCompanyId: string;
  pocs: PocEditRow[];
  onPocsChange: (next: PocEditRow[]) => void;
  disabled?: boolean;
};

export function ChildCompanyPocEditor({
  child,
  resellerId,
  parentCompanyId,
  pocs,
  onPocsChange,
  disabled,
}: ChildCompanyPocEditorProps) {
  const theme = useTheme() as AppTheme;

  const displayRows = useMemo(() => normalizePocsFromCarrier(child), [child]);

  const [mode, setMode] = useState<"existing" | "invite">("existing");
  const [selectedUserId, setSelectedUserId] = useState("");
  const [inviteRow, setInviteRow] = useState<DraftChildPayload>(() => emptyDraftChildRow());

  const usersQuery = useUsersListQuery(
    { parentCompanyId: parentCompanyId.trim(), page: 1, limit: 200 },
    { enabled: parentCompanyId.trim().length > 0 },
  );
  const userRows = useMemo(() => extractUsersRows(usersQuery.data), [usersQuery.data]);
  const userOptions = useMemo(() => {
    const base = userRows.map((u) => ({
      value: u.id,
      label: `${u.user} · ${u.email}`,
    }));
    return [{ value: "", label: usersQuery.isLoading ? "Loading users…" : "— Select user —" }, ...base];
  }, [userRows, usersQuery.isLoading]);

  const rolesQuery = useRolesListQuery(undefined, { enabled: true });
  const roleOptions = useMemo(() => {
    return pickItemsArray(rolesQuery.data)
      .map(toIdNameOption)
      .filter((o): o is { value: string; label: string } => o !== null);
  }, [rolesQuery.data]);

  const departmentsQuery = useDepartmentsListQuery(
    { all: true, type: "External", resellerId: resellerId.trim(), parentCompanyId: parentCompanyId.trim() } as JsonRecord,
    { enabled: Boolean(resellerId.trim() && parentCompanyId.trim()), scope: `child-poc:${child.id}` },
  );
  const departmentOptions = useMemo(() => {
    return pickItemsArray(departmentsQuery.data)
      .map(toIdNameOption)
      .filter((o): o is { value: string; label: string } => o !== null);
  }, [departmentsQuery.data]);

  const updateInviteRow = (_: number, patch: Partial<DraftChildPayload>) => {
    setInviteRow((prev) => ({ ...prev, ...patch }));
  };

  const addExistingUserRow = () => {
    const uid = selectedUserId.trim();
    if (!uid) return;
    onPocsChange([...pocs, { userId: uid }]);
    setSelectedUserId("");
  };

  const addInviteRow = () => {
    if (!isChildRowPocComplete(inviteRow)) return;
    const invite = buildPocInviteForRow(inviteRow);
    if (!invite) return;
    onPocsChange([...pocs, { pocInvite: invite as unknown as Record<string, unknown> }]);
    setInviteRow(emptyDraftChildRow());
  };

  const clearAll = () => onPocsChange([]);

  const sectionLabelSx = {
    fontSize: "0.6875rem",
    fontWeight: 700,
    letterSpacing: "0.08em",
    textTransform: "uppercase" as const,
    color: theme.app.dashboard.textMuted,
    mb: 1,
  };

  return (
    <Box sx={{ mt: 2, pt: 2.25, borderTop: `1px solid ${alpha(theme.app.dashboard.cardBorder, 0.85)}` }}>
      <Typography sx={sectionLabelSx}>Point of contact (POC)</Typography>
      <CompanyPocSummaryBlock title="Current contacts" rows={displayRows} />

      <Box sx={{ mt: 2, display: "flex", flexWrap: "wrap", gap: 1.5, alignItems: "center", justifyContent: "space-between" }}>
        <RadioGroup
          row
          value={mode}
          onChange={(_, v) => setMode(v as "existing" | "invite")}
          sx={{ gap: 2 }}
        >
          <FormControlLabel value="existing" control={<Radio size="small" />} label="Existing user" sx={{ color: theme.app.text.primary }} />
          <FormControlLabel value="invite" control={<Radio size="small" />} label="New invite" sx={{ color: theme.app.text.primary }} />
        </RadioGroup>

        <Button type="button" variant="outlined" color="error" size="small" disabled={disabled} onClick={clearAll}>
          Clear POCs
        </Button>
      </Box>

      {mode === "existing" ? (
        <Box sx={{ mt: 2, display: "flex", flexDirection: "column", gap: 1.5, maxWidth: 520 }}>
          <SelectField label="User under this parent" value={selectedUserId} onChange={setSelectedUserId} options={userOptions} menuMaxRows={8} disabled={disabled} />
          <Button type="button" variant="primary" size="small" sx={{ alignSelf: "flex-start" }} disabled={disabled} onClick={addExistingUserRow}>
            Add to save payload
          </Button>
        </Box>
      ) : (
        <Box sx={{ mt: 2, maxWidth: 760 }}>
          <CompanySetupChildPocBlock
            row={inviteRow}
            childIndex={0}
            updateChildRow={updateInviteRow}
            roleOptions={roleOptions}
            departmentOptions={departmentOptions}
            rolesLoading={rolesQuery.isLoading}
            departmentsLoading={departmentsQuery.isLoading}
            controlsDisabled={Boolean(disabled)}
          />
          <Button type="button" variant="primary" size="small" sx={{ mt: 2 }} disabled={disabled} onClick={addInviteRow}>
            Add invite to save payload
          </Button>
        </Box>
      )}

      {pocs.length > 0 ? (
        <Typography variant="caption" sx={{ display: "block", mt: 2, color: theme.app.dashboard.textMuted }}>
          {pocs.length} POC row(s) queued — will be saved when you click the single child company Save button.
        </Typography>
      ) : null}
    </Box>
  );
}

