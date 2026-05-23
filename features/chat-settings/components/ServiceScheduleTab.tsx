"use client";

import { useEffect, useMemo, useState } from "react";
import Add from "@mui/icons-material/Add";
import ArrowForward from "@mui/icons-material/ArrowForward";
import DeleteOutline from "@mui/icons-material/DeleteOutline";
import Groups from "@mui/icons-material/Groups";
import Save from "@mui/icons-material/Save";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { Button, Checkbox, InputField, SelectField, Typography } from "@/components/common";
import { buildTimezoneSelectOptions } from "@/lib/utils/core/timezone-options";
import { ServiceWeekdayPicker } from "@/features/website-assignments/components/ServiceWeekdayPicker";
import {
  WEEKDAY_CODES,
  normalizeDaysOfWeek,
  type WeekdayCode,
} from "@/features/website-assignments/utils/schedule-weekday.utils";
import { gradientPrimaryButtonSx } from "@/components/common/Button/Button.styles";
import { publishAppToast } from "@/lib/notify";
import { extractApiErrorMessageForToast } from "@/lib/notify/extract-api-message";
import type { DepartmentCatalogOption } from "../utils/catalog";
import {
  CrossMidnightToggle,
  DepartmentCatalogPanel,
  SchedulingSectionCard,
  SchedulingStepBar,
} from "@/features/website-assignments/components/ServiceSchedulingSections";
import {
  gapPolicyCardSx,
  scheduleFormActionBarSx,
  serviceWindowCardSx,
} from "@/features/website-assignments/styles/website-assignment-ui.styles";
import {
  useSaveServiceSchedulingMutation,
  useServiceSchedulingQuery,
} from "../hooks/useServiceScheduling";
import {
  fromTimeInputValue,
  timesLikelyCrossMidnight,
  toTimeInputValue,
} from "@/features/website-assignments/utils/schedule-time.utils";
import {
  buildSaveBody,
  bundleToDraft,
  canShowExternalSlots,
  canShowInternalSlots,
  defaultSchedulingDraft,
  emptyScheduleWindow,
  emptyTopic,
  validateSchedulingDraft,
} from "./service-scheduling-form.utils";
import type {
  OperatingChannels,
  ServiceScheduleWindow,
  ServiceSchedulingTopic,
} from "@/services/chat/service-scheduling.types";

const GAP_POLICY_OPTIONS = [
  {
    value: "queue_until_next_window",
    label: "Queue until next window",
    description: "Visitors can start a chat outside hours; they wait until the next service window.",
  },
  {
    value: "offline_message",
    label: "Offline outside hours",
    description: "Outside service hours, chats are not queued — show your offline message instead.",
  },
] as const;

const CHANNEL_MODE_OPTIONS: { value: OperatingChannels; label: string }[] = [
  { value: "internal_only", label: "Internal only" },
  { value: "external_only", label: "External only" },
  { value: "both", label: "Internal + External" },
];

interface ServiceScheduleTabProps {
  websiteId: string;
  departments: DepartmentCatalogOption[];
  departmentsLoading?: boolean;
  canView: boolean;
  canEdit: boolean;
  /** Called after a successful save (e.g. show success panel). */
  onSaved?: () => void;
  /** Optional — save then open agent roster. */
  onSaveAndGoToRoster?: () => void;
  rosterHref?: string;
}

function ScheduleWindowsEditor({
  title,
  windows,
  canEdit,
  onChange,
}: {
  title: string;
  windows: ServiceScheduleWindow[];
  canEdit: boolean;
  onChange: (windows: ServiceScheduleWindow[]) => void;
}) {
  const theme = useTheme() as AppTheme;

  const patchWindow = (index: number, patch: Partial<ServiceScheduleWindow>) => {
    onChange(windows.map((w, i) => (i === index ? { ...w, ...patch } : w)));
  };

  const setWindowDays = (index: number, days: WeekdayCode[]) => {
    patchWindow(index, { daysOfWeek: days.length ? days : [...WEEKDAY_CODES] });
  };

  const patchWindowTimes = (
    index: number,
    patch: Partial<Pick<ServiceScheduleWindow, "startTime" | "endTime">>,
  ) => {
    const current = windows[index];
    if (!current) return;
    const startTime = patch.startTime ?? current.startTime;
    const endTime = patch.endTime ?? current.endTime;
    const likely = timesLikelyCrossMidnight(startTime, endTime);
    patchWindow(index, {
      ...patch,
      ...(likely && !current.crossesMidnight ? { crossesMidnight: true } : {}),
    });
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {title ? (
        <Typography fontWeight={700} sx={{ fontSize: 15 }}>
          {title}
        </Typography>
      ) : null}
      {windows.map((win, index) => (
        <Box
          key={`${title}-window-${index}`}
          sx={serviceWindowCardSx(Boolean(win.crossesMidnight))}
        >
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.5 }}>
            <Typography fontWeight={600} sx={{ fontSize: 14 }}>
              Window {index + 1}
            </Typography>
            {canEdit && windows.length > 1 ? (
              <IconButton
                size="small"
                aria-label="Remove window"
                onClick={() => onChange(windows.filter((_, i) => i !== index))}
              >
                <DeleteOutline fontSize="small" />
              </IconButton>
            ) : null}
          </Box>
          <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted, display: "block", mb: 0.75 }}>
            Days of week
          </Typography>
          <Box sx={{ mb: 1.5 }}>
            <ServiceWeekdayPicker
              value={normalizeDaysOfWeek(win.daysOfWeek as Array<string | number>)}
              disabled={!canEdit}
              onChange={(days) => setWindowDays(index, days)}
            />
          </Box>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
              gap: 1.25,
              mb: 1.5,
            }}
          >
            <InputField
              label="Start time"
              type="time"
              inputProps={{ step: 60 }}
              value={toTimeInputValue(win.startTime)}
              disabled={!canEdit}
              onChange={(e) =>
                patchWindowTimes(index, {
                  startTime: fromTimeInputValue((e.target as HTMLInputElement).value),
                })
              }
            />
            <InputField
              label="End time"
              type="time"
              inputProps={{ step: 60 }}
              value={toTimeInputValue(win.endTime)}
              disabled={!canEdit}
              onChange={(e) =>
                patchWindowTimes(index, {
                  endTime: fromTimeInputValue((e.target as HTMLInputElement).value),
                })
              }
            />
          </Box>
          <CrossMidnightToggle
            checked={Boolean(win.crossesMidnight)}
            disabled={!canEdit}
            onChange={(v) => patchWindow(index, { crossesMidnight: v })}
          />
        </Box>
      ))}
      {canEdit ? (
        <Button
          type="button"
          variant="outlined"
          startIcon={<Add />}
          onClick={() => onChange([...windows, emptyScheduleWindow()])}
          sx={{ alignSelf: "flex-start" }}
        >
          Add window
        </Button>
      ) : null}
    </Box>
  );
}

function TimezoneSelect({
  value,
  disabled,
  onChange,
  helperText,
}: {
  value: string;
  disabled?: boolean;
  onChange: (tz: string) => void;
  helperText?: string;
}) {
  const options = useMemo(() => buildTimezoneSelectOptions(value), [value]);
  return (
    <Box>
      <SelectField
        label="Timezone (IANA)"
        value={value}
        onChange={onChange}
        options={options}
        disabled={disabled}
        searchPlaceholder="Search timezone…"
        menuMaxRows={4}
      />
      {helperText ? (
        <Typography variant="caption" sx={{ display: "block", mt: 0.75, opacity: 0.85 }}>
          {helperText}
        </Typography>
      ) : null}
    </Box>
  );
}

export function ServiceScheduleTab({
  websiteId,
  departments,
  departmentsLoading = false,
  canView,
  canEdit,
  onSaved,
  onSaveAndGoToRoster,
  rosterHref,
}: ServiceScheduleTabProps) {
  const theme = useTheme() as AppTheme;
  const schedulingQuery = useServiceSchedulingQuery(websiteId, canView);
  const saveMutation = useSaveServiceSchedulingMutation(websiteId);

  const [draft, setDraft] = useState(() => defaultSchedulingDraft());

  useEffect(() => {
    if (schedulingQuery.data) {
      setDraft(bundleToDraft(schedulingQuery.data));
    }
  }, [schedulingQuery.data]);

  const internalDeptOptions = useMemo(
    () => departments.filter((d) => d.departmentType === "Internal"),
    [departments],
  );
  const externalDeptOptions = useMemo(
    () => departments.filter((d) => d.departmentType === "External"),
    [departments],
  );


  const patchTopic = (index: number, patch: Partial<ServiceSchedulingTopic>) => {
    setDraft((p) => ({
      ...p,
      topics: p.topics.map((t, i) => (i === index ? { ...t, ...patch } : t)),
    }));
  };

  const runSave = (afterSuccess?: () => void) => {
    const err = validateSchedulingDraft(draft);
    if (err) {
      publishAppToast({ message: err, variant: "error" });
      return;
    }
    saveMutation.mutate(buildSaveBody(draft), {
      onSuccess: () => {
        publishAppToast({ message: "Service scheduling saved", variant: "success" });
        afterSuccess?.();
      },
      onError: (e) =>
        publishAppToast({
          message: extractApiErrorMessageForToast(e, "Save failed"),
          variant: "error",
        }),
    });
  };

  const handleSave = () => runSave(onSaved);
  const handleSaveAndRoster = () => runSave(onSaveAndGoToRoster ?? onSaved);

  if (!canView) {
    return (
      <Typography sx={{ color: theme.app.dashboard.textMuted }}>
        You need chat-widget:view or chat-widget:update to load service scheduling.
      </Typography>
    );
  }

  if (schedulingQuery.isLoading) {
    return (
      <Typography sx={{ color: theme.app.dashboard.textMuted, py: 2 }}>
        Loading service scheduling…
      </Typography>
    );
  }

  if (schedulingQuery.isError) {
    return (
      <Typography sx={{ color: theme.palette.error.light }}>
        Could not load service scheduling. Refresh and try again.
      </Typography>
    );
  }

  const activeStep: 1 | 2 | 3 =
    draft.topics.some((t) => t.routingKey.trim() && t.internalDepartmentId.trim())
      ? 3
      : canShowInternalSlots(draft.operatingChannels) && draft.internalWindows.length > 0
        ? 2
        : 1;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 0, maxWidth: 1040 }}>
      <Typography variant="body2" sx={{ color: theme.app.dashboard.textMuted, lineHeight: 1.55, mb: 2 }}>
        Complete all three sections below, then save. Your next step is the <strong>Agent roster</strong>{" "}
        (Step 2) to assign Primary → Secondary → Backup per visitor topic.
      </Typography>

      <SchedulingStepBar activeStep={activeStep} />

      <SchedulingSectionCard
        step={1}
        title="Operating mode"
        subtitle="Controls which assignment channels appear on the roster (internal only, external only, or both)."
      >
      <SelectField
        label="Operating mode"
        value={draft.operatingChannels}
        onChange={(v) => setDraft((p) => ({ ...p, operatingChannels: v as OperatingChannels }))}
        options={CHANNEL_MODE_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
        disabled={!canEdit}
        menuMaxRows={6}
      />

      <Typography variant="caption" fontWeight={700} sx={{ display: "block", mt: 2, mb: 1 }}>
        Outside service hours
      </Typography>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
          gap: 1.25,
        }}
      >
        {GAP_POLICY_OPTIONS.map((opt) => {
          const selected = draft.gapPolicy === opt.value;
          return (
            <Box
              key={opt.value}
              role="button"
              tabIndex={canEdit ? 0 : -1}
              sx={gapPolicyCardSx(selected)}
              onClick={() => {
                if (!canEdit) return;
                setDraft((p) => ({ ...p, gapPolicy: opt.value }));
              }}
              onKeyDown={(e) => {
                if (!canEdit || (e.key !== "Enter" && e.key !== " ")) return;
                e.preventDefault();
                setDraft((p) => ({ ...p, gapPolicy: opt.value }));
              }}
            >
              <Typography fontWeight={700} sx={{ fontSize: 14, mb: 0.5 }}>
                {opt.label}
              </Typography>
              <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted, lineHeight: 1.45 }}>
                {opt.description}
              </Typography>
            </Box>
          );
        })}
      </Box>
      </SchedulingSectionCard>

      {canShowInternalSlots(draft.operatingChannels) ? (
        <SchedulingSectionCard
          step={2}
          title="Internal service hours"
          subtitle="Wall-clock hours for internal agents. Times use the timezone below (same for external windows when both channels are enabled)."
        >
        <Box sx={{ mb: 2.5 }}>
          <TimezoneSelect
            value={draft.timezone}
            disabled={!canEdit}
            onChange={(tz) => setDraft((p) => ({ ...p, timezone: tz }))}
            helperText="Example: Asia/Karachi — used to interpret start/end times and overnight (cross-midnight) windows."
          />
        </Box>
        <ScheduleWindowsEditor
          title=""
          windows={draft.internalWindows}
          canEdit={canEdit}
          onChange={(internalWindows) => setDraft((p) => ({ ...p, internalWindows }))}
        />
        </SchedulingSectionCard>
      ) : null}

      {canShowExternalSlots(draft.operatingChannels) ? (
        <SchedulingSectionCard
          step={2}
          title="External service hours"
          subtitle={
            canShowInternalSlots(draft.operatingChannels)
              ? "When external agents are on duty. Uses the same timezone as internal hours above."
              : "When external agents are on duty for this website."
          }
        >
        {!canShowInternalSlots(draft.operatingChannels) ? (
          <Box sx={{ mb: 2.5 }}>
            <TimezoneSelect
              value={draft.timezone}
              disabled={!canEdit}
              onChange={(tz) => setDraft((p) => ({ ...p, timezone: tz }))}
              helperText="IANA timezone for interpreting service window times."
            />
          </Box>
        ) : null}
        <ScheduleWindowsEditor
          title=""
          windows={draft.externalWindows}
          canEdit={canEdit}
          onChange={(externalWindows) => setDraft((p) => ({ ...p, externalWindows }))}
        />
        </SchedulingSectionCard>
      ) : null}

      <SchedulingSectionCard
        step={3}
        title="Visitor topics"
        subtitle="Each topic needs one internal and one external department (widget routing). Both are saved even when the site is internal-only."
      >
        <DepartmentCatalogPanel departments={departments} isLoading={departmentsLoading} />
        {internalDeptOptions.length === 0 && !departmentsLoading ? (
          <Typography
            variant="body2"
            sx={{
              color: theme.palette.warning.light,
              bgcolor: `${theme.palette.warning.main}14`,
              border: `1px solid ${theme.palette.warning.main}44`,
              borderRadius: 1.5,
              px: 1.5,
              py: 1,
              mb: 1.5,
            }}
          >
            No internal departments found. Create an <strong>Internal</strong> department under HRMS →
            Departments (reseller scope), then refresh this page.
          </Typography>
        ) : null}
        <Box sx={{ mt: 2 }}>
        {draft.topics.map((topic, index) => (
          <Box
            key={`topic-${index}`}
            sx={{
              p: 2,
              mb: 1.5,
              borderRadius: 2,
              border: `1px solid ${theme.app.dashboard.cardBorder}`,
            }}
          >
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
              <Typography fontWeight={600} sx={{ fontSize: 14 }}>
                Topic {index + 1}
              </Typography>
              {canEdit && draft.topics.length > 1 ? (
                <IconButton
                  size="small"
                  aria-label="Remove topic"
                  onClick={() =>
                    setDraft((p) => ({
                      ...p,
                      topics: p.topics.filter((_, i) => i !== index),
                    }))
                  }
                >
                  <DeleteOutline fontSize="small" />
                </IconButton>
              ) : null}
            </Box>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                gap: 1.25,
              }}
            >
              <InputField
                label="Routing key"
                value={topic.routingKey}
                disabled={!canEdit}
                onChange={(e) => patchTopic(index, { routingKey: (e.target as HTMLInputElement).value })}
                placeholder="billing"
              />
              <InputField
                label="Client label (widget)"
                value={topic.clientLabel}
                disabled={!canEdit}
                onChange={(e) => patchTopic(index, { clientLabel: (e.target as HTMLInputElement).value })}
              />
            </Box>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                gap: 1.25,
                mt: 1.25,
                p: 1.25,
                borderRadius: 1.5,
                border: `1px dashed ${theme.app.dashboard.cardBorder}`,
              }}
            >
              <SelectField
                label="Internal department"
                value={topic.internalDepartmentId}
                onChange={(v) => patchTopic(index, { internalDepartmentId: v })}
                options={[
                  { value: "", label: "Select internal department…" },
                  ...internalDeptOptions.map((d) => ({ value: d.id, label: d.label })),
                ]}
                disabled={!canEdit}
                menuMaxRows={8}
              />
              <SelectField
                label="External department"
                value={topic.externalDepartmentId}
                onChange={(v) => patchTopic(index, { externalDepartmentId: v })}
                options={[
                  { value: "", label: "Select external department…" },
                  ...externalDeptOptions.map((d) => ({ value: d.id, label: d.label })),
                ]}
                disabled={!canEdit}
                menuMaxRows={8}
              />
            </Box>
            <Box component="label" sx={{ display: "inline-flex", alignItems: "center", gap: 0.75, mt: 1 }}>
              <Checkbox
                checked={topic.isActive}
                disabled={!canEdit}
                onChange={(_, v) => patchTopic(index, { isActive: v })}
              />
              <Typography variant="caption">Active</Typography>
            </Box>
          </Box>
        ))}
        {canEdit ? (
          <Button
            type="button"
            variant="outlined"
            startIcon={<Add />}
            onClick={() =>
              setDraft((p) => ({
                ...p,
                topics: [...p.topics, emptyTopic(p.topics.length)],
              }))
            }
            sx={{ alignSelf: "flex-start" }}
          >
            Add topic
          </Button>
        ) : null}
        </Box>
      </SchedulingSectionCard>

      {canEdit ? (
        <Box sx={scheduleFormActionBarSx}>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="body2" fontWeight={700} sx={{ color: theme.app.text.primary, mb: 0.35 }}>
              Next: Agent roster
            </Typography>
            <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted, lineHeight: 1.5 }}>
              Save your schedule first, then assign agents by channel and visitor topic.
            </Typography>
          </Box>
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              gap: 1.25,
              flexShrink: 0,
            }}
          >
            <Button
              type="button"
              variant="outlined"
              startIcon={<Save sx={{ fontSize: 18 }} />}
              disabled={saveMutation.isPending}
              onClick={handleSave}
            >
              {saveMutation.isPending ? "Saving…" : "Save schedule"}
            </Button>
            <Button
              type="button"
              variant="primary"
              sx={{ ...gradientPrimaryButtonSx, minWidth: { sm: 220 } }}
              startIcon={<Groups sx={{ fontSize: 18 }} />}
              endIcon={<ArrowForward sx={{ fontSize: 18 }} />}
              disabled={saveMutation.isPending}
              onClick={handleSaveAndRoster}
            >
              {saveMutation.isPending ? "Saving…" : "Save & assign agents"}
            </Button>
          </Box>
        </Box>
      ) : null}
      {canEdit && rosterHref ? (
        <Typography variant="caption" sx={{ mt: 1, color: theme.app.dashboard.textMuted }}>
          Tip: use <strong>Save & assign agents</strong> to jump straight to the roster after saving.
        </Typography>
      ) : null}
    </Box>
  );
}
