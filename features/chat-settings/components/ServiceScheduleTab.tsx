"use client";

import { useEffect, useMemo, useState } from "react";
import Save from "@mui/icons-material/Save";
import Schedule from "@mui/icons-material/Schedule";
import Box from "@mui/material/Box";
import Checkbox from "@mui/material/Checkbox";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { Button, InputField, SelectField, Typography } from "@/components/common";
import { VisitorTopicsEditor } from "@/features/chat-settings/components/VisitorTopicsEditor";
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
  useSaveVisitorTopicsMutation,
  useServiceSchedulingQuery,
  useVisitorTopicsQuery,
} from "../hooks/useServiceScheduling";
import {
  fromTimeInputValue,
  timesLikelyCrossMidnight,
  toTimeInputValue,
} from "@/features/website-assignments/utils/schedule-time.utils";
import {
  buildScheduleSaveBody,
  buildVisitorTopicsSaveBody,
  bundleToDraft,
  canShowExternalSlots,
  canShowInternalSlots,
  defaultSchedulingDraft,
  emptyScheduleWindow,
  emptyTopic,
  isTwentyFourHourWindow,
  singleServiceWindow,
  topicsBundleToDraft,
  twentyFourHourScheduleWindow,
  validateScheduleDraft,
  validateVisitorTopicsDraft,
  type ServiceSchedulingDraft,
} from "./service-scheduling-form.utils";
import type {
  OperatingChannels,
  ServiceScheduleWindow,
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
}

function ScheduleWindowsEditor({
  title,
  windows,
  canEdit,
  onChange,
  allowTwentyFourHours = true,
}: {
  title: string;
  windows: ServiceScheduleWindow[];
  canEdit: boolean;
  onChange: (windows: ServiceScheduleWindow[]) => void;
  allowTwentyFourHours?: boolean;
}) {
  const theme = useTheme() as AppTheme;
  const win = singleServiceWindow(windows)[0]!;
  const is24Hours = isTwentyFourHourWindow(win);

  const setWindow = (next: ServiceScheduleWindow) => {
    onChange(singleServiceWindow([next]));
  };

  const patchWindow = (patch: Partial<ServiceScheduleWindow>) => {
    setWindow({ ...win, ...patch });
  };

  const setWindowDays = (days: WeekdayCode[]) => {
    patchWindow({ daysOfWeek: days.length ? days : [...WEEKDAY_CODES] });
  };

  const patchWindowTimes = (
    patch: Partial<Pick<ServiceScheduleWindow, "startTime" | "endTime">>,
  ) => {
    const startTime = patch.startTime ?? win.startTime;
    const endTime = patch.endTime ?? win.endTime;
    const likely = timesLikelyCrossMidnight(startTime, endTime);
    setWindow({
      ...win,
      ...patch,
      ...(likely && !win.crossesMidnight ? { crossesMidnight: true } : {}),
    });
  };

  const setTwentyFourHours = (enabled: boolean) => {
    if (enabled) {
      setWindow(twentyFourHourScheduleWindow());
      return;
    }
    setWindow(emptyScheduleWindow());
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {title ? (
        <Typography fontWeight={700} sx={{ fontSize: 15 }}>
          {title}
        </Typography>
      ) : null}
      {allowTwentyFourHours ? (
        <Box
          sx={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 1.5,
            mb: 1.5,
            p: 1.25,
            borderRadius: 1.5,
            border: `1px solid ${is24Hours ? theme.palette.primary.main + "55" : theme.app.dashboard.cardBorder}`,
            bgcolor: is24Hours ? `${theme.palette.primary.main}12` : "transparent",
          }}
        >
          <Box sx={{ display: "flex", gap: 1, minWidth: 0 }}>
            <Schedule sx={{ fontSize: 20, color: theme.palette.primary.light, mt: 0.15 }} />
            <Box>
              <Typography fontWeight={700} sx={{ fontSize: 14, mb: 0.35 }}>
                24 hours
              </Typography>
              <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted, lineHeight: 1.45 }}>
                Site accepts chats all week, around the clock.
              </Typography>
            </Box>
          </Box>
          <Checkbox
            checked={is24Hours}
            disabled={!canEdit}
            onChange={(_: unknown, checked: boolean) => setTwentyFourHours(checked)}
            sx={{ flexShrink: 0, mt: -0.5 }}
          />
        </Box>
      ) : null}

      <Box sx={serviceWindowCardSx(Boolean(win.crossesMidnight && !is24Hours))}>
        {allowTwentyFourHours && is24Hours ? (
          <Typography variant="body2" sx={{ color: theme.app.dashboard.textMuted, lineHeight: 1.55 }}>
            Service is open <strong>24/7</strong> (Sun–Sat). Save when you are done.
          </Typography>
        ) : (
          <>
            <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted, display: "block", mb: 0.75 }}>
              Days of week
            </Typography>
            <Box sx={{ mb: 1.5 }}>
              <ServiceWeekdayPicker
                value={normalizeDaysOfWeek(win.daysOfWeek as Array<string | number>)}
                disabled={!canEdit}
                onChange={(days) => setWindowDays(days)}
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
                  patchWindowTimes({
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
                  patchWindowTimes({
                    endTime: fromTimeInputValue((e.target as HTMLInputElement).value),
                  })
                }
              />
            </Box>
            <CrossMidnightToggle
              checked={Boolean(win.crossesMidnight)}
              disabled={!canEdit}
              onChange={(v) => patchWindow({ crossesMidnight: v })}
            />
          </>
        )}
      </Box>
    </Box>
  );
}

function TimezoneSelect({
  label = "Timezone (IANA)",
  value,
  disabled,
  onChange,
  helperText,
}: {
  label?: string;
  value: string;
  disabled?: boolean;
  onChange: (tz: string) => void;
  helperText?: string;
}) {
  const options = useMemo(() => buildTimezoneSelectOptions(value), [value]);
  return (
    <Box>
      <SelectField
        label={label}
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
}: ServiceScheduleTabProps) {
  const theme = useTheme() as AppTheme;
  const schedulingQuery = useServiceSchedulingQuery(websiteId, canView);
  const visitorTopicsQuery = useVisitorTopicsQuery(websiteId, canView);
  const saveScheduleMutation = useSaveServiceSchedulingMutation(websiteId);
  const saveTopicsMutation = useSaveVisitorTopicsMutation(websiteId);

  const [draft, setDraft] = useState<ServiceSchedulingDraft>(() => defaultSchedulingDraft());

  useEffect(() => {
    if (schedulingQuery.data) {
      setDraft((prev) => ({
        ...bundleToDraft(schedulingQuery.data),
        topics: prev.topics,
      }));
    }
  }, [schedulingQuery.data]);

  useEffect(() => {
    if (visitorTopicsQuery.data) {
      setDraft((prev) => ({
        ...prev,
        topics: topicsBundleToDraft(visitorTopicsQuery.data),
      }));
    }
  }, [visitorTopicsQuery.data]);

  const allowTwentyFourHours = draft.operatingChannels !== "both";

  useEffect(() => {
    if (allowTwentyFourHours) return;
    setDraft((p) => {
      const internalWin = singleServiceWindow(p.internalWindows)[0]!;
      const externalWin = singleServiceWindow(p.externalWindows)[0]!;
      const internal24 = isTwentyFourHourWindow(internalWin);
      const external24 = isTwentyFourHourWindow(externalWin);
      if (!internal24 && !external24) return p;
      return {
        ...p,
        ...(internal24 ? { internalWindows: singleServiceWindow([emptyScheduleWindow()]) } : {}),
        ...(external24 ? { externalWindows: singleServiceWindow([emptyScheduleWindow()]) } : {}),
      };
    });
  }, [allowTwentyFourHours]);

  const internalDeptOptions = useMemo(
    () => departments.filter((d) => d.departmentType === "Internal"),
    [departments],
  );
  const externalDeptOptions = useMemo(
    () => departments.filter((d) => d.departmentType === "External"),
    [departments],
  );


  const runSaveSchedule = (afterSuccess?: () => void) => {
    const err = validateScheduleDraft(draft);
    if (err) {
      publishAppToast({ message: err, variant: "error" });
      return;
    }
    saveScheduleMutation.mutate(buildScheduleSaveBody(draft), {
      onSuccess: () => {
        publishAppToast({ message: "Service schedule saved", variant: "success" });
        afterSuccess?.();
      },
      onError: (e) =>
        publishAppToast({
          message: extractApiErrorMessageForToast(e, "Save failed"),
          variant: "error",
        }),
    });
  };

  const runSaveTopics = () => {
    const err = validateVisitorTopicsDraft(draft.topics);
    if (err) {
      publishAppToast({ message: err, variant: "error" });
      return;
    }
    saveTopicsMutation.mutate(buildVisitorTopicsSaveBody(draft.topics), {
      onSuccess: () => {
        publishAppToast({ message: "Inquire topics saved", variant: "success" });
      },
      onError: (e) =>
        publishAppToast({
          message: extractApiErrorMessageForToast(e, "Could not save inquire topics"),
          variant: "error",
        }),
    });
  };

  const handleSave = () => runSaveSchedule(onSaved);

  if (!canView) {
    return (
      <Typography sx={{ color: theme.app.dashboard.textMuted }}>
        You need chat-widget:view or chat-widget:update to load service scheduling.
      </Typography>
    );
  }

  if (schedulingQuery.isLoading || visitorTopicsQuery.isLoading) {
    return (
      <Typography sx={{ color: theme.app.dashboard.textMuted, py: 2 }}>
        Loading service scheduling…
      </Typography>
    );
  }

  if (schedulingQuery.isError || visitorTopicsQuery.isError) {
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
        Set operating mode and service hours, then save schedule. Inquire topics use a separate API — save them in step 3.
      </Typography>

      <SchedulingStepBar activeStep={activeStep} />

      <SchedulingSectionCard
        step={1}
        title="Operating mode"
        subtitle="Controls internal, external, or both channels for this website."
      >
      <SelectField
        label="Operating mode"
        value={draft.operatingChannels}
        onChange={(v) => setDraft((p) => ({ ...p, operatingChannels: v as OperatingChannels }))}
        options={CHANNEL_MODE_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
        disabled={!canEdit}
        menuMaxRows={6}
      />
      {!allowTwentyFourHours ? (
        <Typography
          variant="caption"
          sx={{ display: "block", mt: 1.25, color: theme.app.dashboard.textMuted, lineHeight: 1.5 }}
        >
          Internal + External mode requires separate internal and external service hours — 24 hours is not
          available.
        </Typography>
      ) : null}

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
          subtitle="Wall-clock hours for internal agents in this website's internal timezone."
        >
        <Box sx={{ mb: 2.5 }}>
          <TimezoneSelect
            label="Internal timezone (IANA)"
            value={draft.internalTimezone}
            disabled={!canEdit}
            onChange={(tz) =>
              setDraft((p) => ({
                ...p,
                internalTimezone: tz,
                timezone: tz,
              }))
            }
            helperText="Example: Asia/Karachi — used for internal service window times."
          />
        </Box>
        <ScheduleWindowsEditor
          title=""
          windows={draft.internalWindows}
          canEdit={canEdit}
          allowTwentyFourHours={allowTwentyFourHours}
          onChange={(internalWindows) =>
            setDraft((p) => ({ ...p, internalWindows: singleServiceWindow(internalWindows) }))
          }
        />
        </SchedulingSectionCard>
      ) : null}

      {canShowExternalSlots(draft.operatingChannels) ? (
        <SchedulingSectionCard
          step={2}
          title="External service hours"
          subtitle={
            canShowInternalSlots(draft.operatingChannels)
              ? "When external agents are on duty — separate timezone from internal hours."
              : "When external agents are on duty for this website."
          }
        >
        <Box sx={{ mb: 2.5 }}>
          <TimezoneSelect
            label="External timezone (IANA)"
            value={draft.externalTimezone}
            disabled={!canEdit}
            onChange={(tz) => setDraft((p) => ({ ...p, externalTimezone: tz }))}
            helperText="Example: America/New_York — used for external service window times."
          />
        </Box>
        <ScheduleWindowsEditor
          title=""
          windows={draft.externalWindows}
          canEdit={canEdit}
          allowTwentyFourHours={allowTwentyFourHours}
          onChange={(externalWindows) =>
            setDraft((p) => ({ ...p, externalWindows: singleServiceWindow(externalWindows) }))
          }
        />
        </SchedulingSectionCard>
      ) : null}

      <SchedulingSectionCard
        step={3}
        title="Visitor topics"
        subtitle="Saved per website (same rows as Chat Box Design → Inquiry topics). Each topic needs internal and external departments."
      >
        <VisitorTopicsEditor
          topics={draft.topics.map((t) => ({
            routingKey: t.routingKey,
            clientLabel: t.clientLabel,
            internalDepartmentId: t.internalDepartmentId,
            externalDepartmentId: t.externalDepartmentId,
            internalPoolId: t.internalPoolId,
            externalPoolId: t.externalPoolId,
            isActive: t.isActive,
          }))}
          onChange={(rows) =>
            setDraft((p) => ({
              ...p,
              topics: rows.map((row, i) => ({
                ...emptyTopic(i),
                ...p.topics[i],
                routingKey: row.routingKey,
                clientLabel: row.clientLabel,
                internalDepartmentId: row.internalDepartmentId,
                externalDepartmentId: row.externalDepartmentId,
                internalPoolId: row.internalPoolId ?? null,
                externalPoolId: row.externalPoolId ?? null,
                isActive: row.isActive !== false,
                displayOrder: i,
              })),
            }))
          }
          canEdit={canEdit}
          showDepartmentCatalog
          showActive
          departments={departments}
          departmentsLoading={departmentsLoading}
          internalDeptOptions={internalDeptOptions}
          externalDeptOptions={externalDeptOptions}
          internalDeptWarning={
            internalDeptOptions.length === 0 && !departmentsLoading ? (
              <>
                No internal departments found. Create an <strong>Internal</strong> department under
                HRMS → Departments (reseller scope), then refresh this page.
              </>
            ) : null
          }
          minRows={1}
        />
        {canEdit ? (
          <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end" }}>
            <Button
              type="button"
              variant="primary"
              sx={gradientPrimaryButtonSx}
              startIcon={<Save sx={{ fontSize: 18 }} />}
              disabled={saveTopicsMutation.isPending}
              onClick={runSaveTopics}
            >
              {saveTopicsMutation.isPending ? "Saving…" : "Save inquire topics"}
            </Button>
          </Box>
        ) : null}
      </SchedulingSectionCard>

      {canEdit ? (
        <Box sx={scheduleFormActionBarSx}>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="body2" fontWeight={700} sx={{ color: theme.app.text.primary, mb: 0.35 }}>
              Save schedule
            </Typography>
            <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted, lineHeight: 1.5 }}>
              Operating mode and service hours only (not inquire topics).
            </Typography>
          </Box>
          <Button
            type="button"
            variant="primary"
            sx={gradientPrimaryButtonSx}
            startIcon={<Save sx={{ fontSize: 18 }} />}
            disabled={saveScheduleMutation.isPending}
            onClick={handleSave}
          >
            {saveScheduleMutation.isPending ? "Saving…" : "Save schedule"}
          </Button>
        </Box>
      ) : null}
    </Box>
  );
}
