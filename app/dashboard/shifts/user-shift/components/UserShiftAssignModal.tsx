"use client";

import Box from "@mui/material/Box";
import type { AppTheme } from "@/theme/theme";
import { FormModal, InputField, SelectField, Typography } from "@/components/common";

export type SelectOption = { value: string; label: string };

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

