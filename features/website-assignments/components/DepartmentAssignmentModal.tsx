"use client";

import { useEffect, useMemo, useState } from "react";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import type { ShiftCoverage } from "@/api/types/shift-coverage.types";
import type {
  OperatingChannels,
  ServiceChannel,
  WebsiteDepartmentRosterRow,
} from "@/api/types/website-assignments.types";
import {
  canShowExternalSlots,
  canShowInternalSlots,
  isChannelAllowed,
} from "@/lib/website-assignments/channel-helpers";
import { usePutDepartmentRosterMutation } from "@/lib/hooks";
import { extractApiErrorMessageForToast, publishAppToast } from "@/lib/notify";
import { extractShiftCoverageFromAssignResponse } from "@/lib/website-assignments/shift-coverage";
import { Button, FormModal, Typography } from "@/components/common";
import { ShiftCoverageBanner } from "@/components/common/ShiftCoverageBanner/ShiftCoverageBanner";
import { type SlotDraft } from "./RosterSlotPicker";
import { RosterUsersPickerTable } from "./RosterUsersPickerTable";
import {
  buildDepartmentPutBody,
  clearChannelDraft,
  rosterDraftHasChanges,
  slotsFromRoster,
} from "../utils/roster-draft.utils";

export interface DepartmentAssignmentModalProps {
  open: boolean;
  onClose: () => void;
  websiteId: string;
  department: WebsiteDepartmentRosterRow;
  operatingChannels: OperatingChannels;
  allowedChannels: ServiceChannel[];
  canEdit: boolean;
  onCoverage?: (coverage: ShiftCoverage | null) => void;
}

export function DepartmentAssignmentModal({
  open,
  onClose,
  websiteId,
  department,
  operatingChannels,
  allowedChannels,
  canEdit,
  onCoverage,
}: DepartmentAssignmentModalProps) {
  const theme = useTheme() as AppTheme;
  const [internalDraft, setInternalDraft] = useState<SlotDraft>(() =>
    slotsFromRoster(department.roster.internal),
  );
  const [externalDraft, setExternalDraft] = useState<SlotDraft>(() =>
    slotsFromRoster(department.roster.external),
  );
  const [shiftCoverage, setShiftCoverage] = useState<ShiftCoverage | null>(null);

  const internalBaseline = useMemo(
    () => slotsFromRoster(department.roster.internal),
    [department.roster.internal],
  );
  const externalBaseline = useMemo(
    () => slotsFromRoster(department.roster.external),
    [department.roster.external],
  );

  useEffect(() => {
    if (!open) return;
    setInternalDraft(slotsFromRoster(department.roster.internal));
    setExternalDraft(slotsFromRoster(department.roster.external));
    setShiftCoverage(null);
  }, [open, department]);

  const putRosterMutation = usePutDepartmentRosterMutation(websiteId);

  const showInternal =
    canShowInternalSlots(operatingChannels) && isChannelAllowed("Internal", allowedChannels);
  const showExternal =
    canShowExternalSlots(operatingChannels) && isChannelAllowed("External", allowedChannels);

  const hasChanges = rosterDraftHasChanges(
    internalDraft,
    externalDraft,
    internalBaseline,
    externalBaseline,
  );

  const handleSave = async () => {
    if (!canEdit) return;
    try {
      const res = await putRosterMutation.mutateAsync({
        departmentId: department.departmentId,
        body: buildDepartmentPutBody({
          showInternal,
          showExternal,
          internalDraft,
          externalDraft,
        }),
      });
      const cov = extractShiftCoverageFromAssignResponse(res);
      if (cov) {
        setShiftCoverage(cov);
        onCoverage?.(cov);
      }
      publishAppToast({ message: "Team assignments saved.", variant: "success" });
      onClose();
    } catch (e) {
      publishAppToast({
        message: extractApiErrorMessageForToast(e, "Could not save team assignments"),
        variant: "error",
      });
    }
  };

  const saving = putRosterMutation.isPending;

  return (
    <FormModal
      open={open}
      fitContent
      maxWidth={920}
      title={`Manage agents — ${department.departmentName}`}
      description="Select multiple Primary and Secondary agents per channel. Online primaries receive chats first (fewest active chats wins)."
      onClose={onClose}
      onSave={() => void handleSave()}
      primaryButtonLabel={saving ? "Saving…" : "Save assignments"}
      primaryButtonDisabled={!canEdit || !hasChanges || saving}
      cancelButtonLabel="Close"
    >
      <ShiftCoverageBanner coverage={shiftCoverage} onDismiss={() => setShiftCoverage(null)} />

      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {showInternal ? (
          <Box>
            <RosterUsersPickerTable
              websiteId={websiteId}
              operatingChannels={operatingChannels}
              channel="Internal"
              departmentId={department.departmentId}
              departmentName={department.departmentName}
              draft={internalDraft}
              canEdit={canEdit}
              onChange={setInternalDraft}
            />
            {canEdit ? (
              <Button
                type="button"
                variant="outlined"
                size="small"
                sx={{ mt: 1 }}
                disabled={saving}
                onClick={() => setInternalDraft(clearChannelDraft("Internal"))}
              >
                Clear internal slots
              </Button>
            ) : null}
          </Box>
        ) : null}

        {showInternal && showExternal ? <Divider sx={{ borderColor: "divider" }} /> : null}

        {showExternal ? (
          <Box>
            <RosterUsersPickerTable
              websiteId={websiteId}
              operatingChannels={operatingChannels}
              channel="External"
              departmentId={department.departmentId}
              departmentName={department.departmentName}
              draft={externalDraft}
              canEdit={canEdit}
              onChange={setExternalDraft}
            />
            {canEdit ? (
              <Button
                type="button"
                variant="outlined"
                size="small"
                sx={{ mt: 1 }}
                disabled={saving}
                onClick={() => setExternalDraft(clearChannelDraft("External"))}
              >
                Clear external slots
              </Button>
            ) : null}
          </Box>
        ) : null}

        {!showInternal && !showExternal ? (
          <Typography variant="body2" sx={{ color: theme.app.dashboard.textMuted }}>
            No assignment channels are enabled for this website. Update service scheduling operating
            mode first.
          </Typography>
        ) : null}
      </Box>
    </FormModal>
  );
}
