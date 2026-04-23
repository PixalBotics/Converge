"use client";

import Box from "@mui/material/Box";
import type { AppTheme } from "@/theme/theme";
import { FormModal, InputField, SelectField, Typography } from "@/components/common";

export type SelectOption = { value: string; label: string };
export type SelectedUserMeta = {
  name: string;
  email: string;
  type: "Internal" | "External";
  resellerId: string;
  parentCompanyId: string;
  departmentName: string;
  designationName: string;
};

export type UserShiftAssignModalProps = {
  theme: AppTheme;
  open: boolean;
  onClose: () => void;
  onSave: () => void;
  isSaving: boolean;
  userId: string;
  onUserIdChange: (id: string) => void;
  userOptions: SelectOption[];
  shiftId: string;
  onShiftIdChange: (id: string) => void;
  shiftOptions: SelectOption[];
  effectiveFrom: string;
  onEffectiveFromChange: (v: string) => void;
  effectiveTo: string;
  onEffectiveToChange: (v: string) => void;
  showPickUserHint: boolean;
  selectedUserMeta: SelectedUserMeta | null;
};

export function UserShiftAssignModal({
  theme,
  open,
  onClose,
  onSave,
  isSaving,
  userId,
  onUserIdChange,
  userOptions,
  shiftId,
  onShiftIdChange,
  shiftOptions,
  effectiveFrom,
  onEffectiveFromChange,
  effectiveTo,
  onEffectiveToChange,
  showPickUserHint,
  selectedUserMeta,
}: UserShiftAssignModalProps) {
  return (
    <FormModal
      open={open}
      title="Add user shift"
      description="Assign a shift to a user (date range)."
      onClose={onClose}
      onSave={onSave}
      primaryButtonLabel={isSaving ? "Saving…" : "Assign"}
      primaryButtonDisabled={isSaving}
      cancelButtonLabel="Close"
      maxWidth={600}
      fitContent
    >
      {showPickUserHint ? (
        <Typography variant="body2" sx={{ color: theme.app.dashboard.textMuted }}>
          Pick a user first, then assign a shift.
        </Typography>
      ) : null}

      <SelectField
        label="User"
        value={userId}
        onChange={onUserIdChange}
        options={userOptions}
        searchable
        searchPlaceholder="Search user…"
        menuMaxRows={8}
      />
      {selectedUserMeta ? (
        <Box
          sx={{
            borderRadius: 2,
            border: "1px solid rgba(255,255,255,0.1)",
            bgcolor: "rgba(255,255,255,0.02)",
            p: 1.25,
            display: "grid",
            gap: 0.4,
          }}
        >
          <Typography variant="body2" sx={{ color: "white", fontWeight: 700 }}>
            {selectedUserMeta.name} ({selectedUserMeta.type})
          </Typography>
          <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted }}>
            {selectedUserMeta.email}
          </Typography>
          <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted }}>
            Department: {selectedUserMeta.departmentName}
          </Typography>
          <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted }}>
            Designation: {selectedUserMeta.designationName}
          </Typography>
          {selectedUserMeta.type === "External" ? (
            <>
              <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted }}>
                Reseller ID: {selectedUserMeta.resellerId}
              </Typography>
              <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted }}>
                Parent Company ID: {selectedUserMeta.parentCompanyId}
              </Typography>
            </>
          ) : null}
        </Box>
      ) : null}
      <SelectField
        label="Shift"
        value={shiftId}
        onChange={onShiftIdChange}
        options={shiftOptions}
        searchable
        searchPlaceholder="Search shift…"
        menuMaxRows={7}
      />
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 2 }}>
        <InputField
          label="Effective from"
          type="date"
          value={effectiveFrom}
          onChange={(e) => onEffectiveFromChange(e.target.value)}
        />
        <InputField
          label="Effective to"
          type="date"
          value={effectiveTo}
          onChange={(e) => onEffectiveToChange(e.target.value)}
        />
      </Box>
    </FormModal>
  );
}

