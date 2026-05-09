"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Box from "@mui/material/Box";
import { useTheme } from "@mui/material/styles";
import type { SxProps, Theme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import {
  Typography,
  Button,
  InputField,
  SelectField,
  FormModal,
  ConfirmActionModal,
} from "@/components/common";
import type { DataTableColumn } from "@/components/common";
import { gradientPrimaryButtonSx } from "@/components/common/Button/Button.styles";
import { rolesPageWrapper } from "../roles/roles.styles";
import { pageWrapper } from "../companies/overview.styles";
import { publishAppToast } from "@/lib/notify";
import {
  useCreateShiftMutation,
  useDeleteShiftMutation,
  useShiftQuery,
  useShiftsListQuery,
  useUpdateShiftMutation,
} from "@/lib/hooks/query";
import {
  isRecord,
  pickNum,
  pickStr,
  resolveShiftDetailObject,
  shiftApiTimeToTimeInputValue,
  unwrapApiData,
} from "@/lib/utils";
import { ShiftsTableCard } from "./components";
import { useAuth } from "@/lib/auth";
import { canShiftAction } from "@/lib/permissions";

const PAGE_LIMIT = 8;

export type ShiftRow = {
  id: string;
  shiftName: string;
  startTime: string;
  endTime: string;
  breakMinutes: number | null;
  timezone: string;
};

function getTimezoneOptions(): { value: string; label: string }[] {
  const fallback = [
    "Asia/Karachi",
    "Asia/Dubai",
    "Asia/Riyadh",
    "Asia/Kolkata",
    "Asia/Bangkok",
    "Asia/Singapore",
    "Europe/London",
    "Europe/Berlin",
    "Europe/Istanbul",
    "America/New_York",
    "America/Chicago",
    "America/Los_Angeles",
    "Australia/Sydney",
  ];
  try {
    const supported = (Intl as unknown as { supportedValuesOf?: (key: "timeZone") => string[] }).supportedValuesOf?.("timeZone");
    const list = Array.isArray(supported) && supported.length > 0 ? supported : fallback;
    return list.map((tz) => ({ value: tz, label: tz }));
  } catch {
    return fallback.map((tz) => ({ value: tz, label: tz }));
  }
}

export default function ShiftsPage() {
  const theme = useTheme() as AppTheme;
  const { hasOperational } = useAuth();
  const canCreateShift = canShiftAction(hasOperational, "create");
  const canUpdateShift = canShiftAction(hasOperational, "update");
  const canDeleteShift = canShiftAction(hasOperational, "delete");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<ShiftRow | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ShiftRow | null>(null);

  const [shiftNameField, setShiftNameField] = useState("");
  const [startTimeField, setStartTimeField] = useState("");
  const [endTimeField, setEndTimeField] = useState("");
  const [breakMinutesField, setBreakMinutesField] = useState("");
  const [timezoneField, setTimezoneField] = useState("Asia/Karachi");

  const [editName, setEditName] = useState("");
  const [editStartTime, setEditStartTime] = useState("");
  const [editEndTime, setEditEndTime] = useState("");
  const [editBreakMinutes, setEditBreakMinutes] = useState("");
  const [editTimezone, setEditTimezone] = useState("Asia/Karachi");
  const hydratedEditIdRef = useRef<string>("");

  const timezoneOptions = useMemo(() => {
    return [{ value: "", label: "— Select timezone —" }, ...getTimezoneOptions()];
  }, []);

  const shiftsQuery = useShiftsListQuery(
    {
      page,
      limit: PAGE_LIMIT,
      ...(search.trim() ? { search: search.trim() } : {}),
    },
    { enabled: true, scope: "shifts-page" },
  );
  const createMutation = useCreateShiftMutation();
  const updateMutation = useUpdateShiftMutation();
  const deleteMutation = useDeleteShiftMutation();
  const shiftDetailQuery = useShiftQuery(editTarget?.id, {
    enabled: editTarget != null,
    scope: "shifts-edit-modal",
  });

  useEffect(() => {
    const editId = editTarget?.id ?? "";
    if (!editId) return;
    if (hydratedEditIdRef.current === editId) return;

    const obj = resolveShiftDetailObject(shiftDetailQuery.data);
    if (!obj) return;

    const name = pickStr(obj, ["name", "shiftName", "shift_name"]);
    const startRaw = pickStr(obj, ["startTime", "start_time"]);
    const endRaw = pickStr(obj, ["endTime", "end_time"]);
    const tz = pickStr(obj, ["timezone", "timeZone", "time_zone"]);
    const breakMin = pickNum(obj, ["breakMinutes", "break_minutes"]);
    const effectiveTz = tz || "Asia/Karachi";

    setEditName(name);
    setEditTimezone(effectiveTz);
    setEditStartTime(shiftApiTimeToTimeInputValue(startRaw, effectiveTz));
    setEditEndTime(shiftApiTimeToTimeInputValue(endRaw, effectiveTz));
    setEditBreakMinutes(breakMin != null ? String(breakMin) : "");

    hydratedEditIdRef.current = editId;
  }, [editTarget?.id, shiftDetailQuery.data]);

  const payload = unwrapApiData(shiftsQuery.data);
  const payloadObj = isRecord(payload) ? payload : null;
  const items = useMemo(() => {
    if (!payloadObj) return [];
    const arr = payloadObj["items"];
    return Array.isArray(arr) ? (arr as unknown[]).filter(isRecord) : [];
  }, [payloadObj]);

  const totalEntries = useMemo(() => {
    const n = pickNum(payloadObj, ["total", "count", "totalCount"]);
    return n ?? items.length;
  }, [payloadObj, items.length]);

  const pageCount = useMemo(() => {
    const n = pickNum(payloadObj, ["totalPages"]);
    return n && n > 0 ? n : 1;
  }, [payloadObj]);

  const tableRows = useMemo<ShiftRow[]>(() => {
    return items
      .map((r) => {
        const id = pickStr(r, ["id"]);
        if (!id) return null;
        return {
          id,
          shiftName: pickStr(r, ["name", "shiftName"]) || "—",
          startTime: pickStr(r, ["startTime"]) || "—",
          endTime: pickStr(r, ["endTime"]) || "—",
          breakMinutes: pickNum(r, ["breakMinutes"]),
          timezone: pickStr(r, ["timezone"]) || "—",
        } satisfies ShiftRow;
      })
      .filter((x): x is ShiftRow => x !== null);
  }, [items]);

  useEffect(() => {
    setPage(1);
  }, [search]);

  useEffect(() => {
    setPage((p) => (p > pageCount ? pageCount : p));
  }, [pageCount]);

  const footerRangeStart = tableRows.length > 0 ? (page - 1) * PAGE_LIMIT + 1 : 0;
  const footerRangeEnd = (page - 1) * PAGE_LIMIT + tableRows.length;

  const columns = useMemo<DataTableColumn<ShiftRow>[]>(
    () => [
      { id: "shiftName", label: "Shift Name" },
      { id: "startTime", label: "Start Time" },
      { id: "endTime", label: "End Time" },
      { id: "breakMinutes", label: "Break (min)" },
      { id: "timezone", label: "Timezone" },
    ],
    [],
  );

  const resetForm = () => {
    setShiftNameField("");
    setStartTimeField("");
    setEndTimeField("");
    setBreakMinutesField("");
    setTimezoneField("Asia/Karachi");
  };

  const handleCancelForm = () => {
    resetForm();
  };

  const handleSaveShift = (opts?: { onSuccess?: () => void }) => {
    const name = shiftNameField.trim();
    if (!name) {
      publishAppToast({ variant: "error", message: "Please enter a shift name." });
      return;
    }
    if (!startTimeField.trim()) {
      publishAppToast({ variant: "error", message: "Please enter a start time." });
      return;
    }
    if (!endTimeField.trim()) {
      publishAppToast({ variant: "error", message: "Please enter an end time." });
      return;
    }
    const breakMinutes = breakMinutesField.trim() ? Number(breakMinutesField.trim()) : null;
    if (breakMinutesField.trim() && !Number.isFinite(breakMinutes)) {
      publishAppToast({ variant: "error", message: "Break minutes must be a number." });
      return;
    }
    if (!timezoneField.trim()) {
      publishAppToast({ variant: "error", message: "Please enter a timezone." });
      return;
    }

    createMutation.mutate(
      {
        name,
        startTime: startTimeField.trim(),
        endTime: endTimeField.trim(),
        ...(breakMinutes != null ? { breakMinutes } : {}),
        timezone: timezoneField.trim(),
      },
      {
        onSuccess: () => {
          publishAppToast({ variant: "success", message: `Shift “${name}” saved.` });
          resetForm();
          opts?.onSuccess?.();
        },
        onError: () => publishAppToast({ variant: "error", message: "Could not create shift." }),
      },
    );
  };

  return (
    <Box sx={[pageWrapper, rolesPageWrapper] as SxProps<Theme>}>
      <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 2, mb: 0.5 }}>
        <Box>
          <Typography variant="regularLarge" fontWeight={700} color="white">
            Shifts
          </Typography>
          <Typography variant="body2" sx={{ mt: 0.75, color: theme.app.dashboard.textMuted, maxWidth: 720 }}>
            Manage shift templates.
          </Typography>
        </Box>
        {canCreateShift ? (
          <Button
            variant="primary"
            sx={gradientPrimaryButtonSx}
            disabled={deleteMutation.isPending}
            onClick={() => setCreateOpen(true)}
          >
            Add shift
          </Button>
        ) : null}
      </Box>

      <ShiftsTableCard
        rows={tableRows}
        columns={columns}
        isLoading={shiftsQuery.isLoading || shiftsQuery.isFetching}
        search={search}
        onSearchChange={setSearch}
        page={page}
        pageCount={pageCount}
        footerText={
          shiftsQuery.isLoading
            ? "Loading…"
            : `Showing data ${footerRangeStart} to ${footerRangeEnd} of ${totalEntries} entries`
        }
        onPageChange={setPage}
        onEdit={(row) => {
          setEditTarget(row);
          hydratedEditIdRef.current = "";
          void shiftDetailQuery.refetch();
        }}
        onDelete={setDeleteTarget}
        disableActions={deleteMutation.isPending}
        canEdit={canUpdateShift}
        canDelete={canDeleteShift}
      />

      <FormModal
        open={createOpen}
        title="Add shift"
        description="Create a new shift template."
        onClose={() => {
          if (createMutation.isPending) return;
          setCreateOpen(false);
          handleCancelForm();
        }}
        onSave={() => {
          handleSaveShift({
            onSuccess: () => setCreateOpen(false),
          });
        }}
        primaryButtonLabel={createMutation.isPending ? "Saving…" : "Save shift"}
        primaryButtonDisabled={createMutation.isPending}
        cancelButtonLabel="Close"
        maxWidth={560}
        fitContent
      >
        <InputField
          label="Shift name"
          placeholder="Morning"
          value={shiftNameField}
          onChange={(e) => setShiftNameField(e.target.value)}
        />
        <InputField
          label="Start time"
          placeholder="09:00"
          type="time"
          inputProps={{ step: 60 }}
          value={startTimeField}
          onChange={(e) => setStartTimeField(e.target.value)}
        />
        <InputField
          label="End time"
          placeholder="17:00"
          type="time"
          inputProps={{ step: 60 }}
          value={endTimeField}
          onChange={(e) => setEndTimeField(e.target.value)}
        />
        <InputField
          label="Break minutes"
          placeholder="60"
          type="number"
          inputProps={{ min: 0, step: 5 }}
          value={breakMinutesField}
          onChange={(e) => setBreakMinutesField(e.target.value)}
        />
        <SelectField
          label="Timezone"
          value={timezoneField}
          onChange={setTimezoneField}
          options={timezoneOptions}
          searchable
          searchPlaceholder="Search timezone…"
          menuMaxRows={6}
        />
      </FormModal>

      <ConfirmActionModal
        open={deleteTarget != null}
        title="Delete shift?"
        description={deleteTarget ? `Delete shift “${deleteTarget.shiftName}”?` : "Delete this shift?"}
        confirmLabel={deleteMutation.isPending ? "Deleting…" : "Delete"}
        cancelLabel="Cancel"
        isLoading={deleteMutation.isPending}
        onDismiss={() => {
          if (deleteMutation.isPending) return;
          setDeleteTarget(null);
        }}
        onConfirm={() => {
          const target = deleteTarget;
          if (!target) return;
          deleteMutation.mutate(target.id, {
            onSuccess: () => {
              publishAppToast({ variant: "success", message: "Shift deleted." });
              setDeleteTarget(null);
            },
            onError: () => publishAppToast({ variant: "error", message: "Could not delete shift." }),
          });
        }}
      />

      <FormModal
        open={editTarget != null}
        title="Edit shift"
        description="Update shift template fields."
        onClose={() => {
          if (updateMutation.isPending) return;
          setEditTarget(null);
          setEditName("");
          setEditStartTime("");
          setEditEndTime("");
          setEditBreakMinutes("");
          setEditTimezone("Asia/Karachi");
        }}
        onSave={() => {
          const target = editTarget;
          if (!target) return;
          const name = editName.trim();
          if (!name) {
            publishAppToast({ variant: "error", message: "Please enter a shift name." });
            return;
          }
          if (!editStartTime.trim()) {
            publishAppToast({ variant: "error", message: "Please enter a start time." });
            return;
          }
          if (!editEndTime.trim()) {
            publishAppToast({ variant: "error", message: "Please enter an end time." });
            return;
          }
          const breakMinutes = editBreakMinutes.trim() ? Number(editBreakMinutes.trim()) : null;
          if (editBreakMinutes.trim() && !Number.isFinite(breakMinutes)) {
            publishAppToast({ variant: "error", message: "Break minutes must be a number." });
            return;
          }
          const timezone = editTimezone.trim();
          if (!timezone) {
            publishAppToast({ variant: "error", message: "Please enter a timezone." });
            return;
          }

          updateMutation.mutate(
            {
              id: target.id,
              body: {
                name,
                startTime: editStartTime.trim(),
                endTime: editEndTime.trim(),
                breakMinutes: breakMinutes ?? undefined,
                timezone,
              },
            },
            {
              onSuccess: () => {
                publishAppToast({ variant: "success", message: "Shift updated." });
                setEditTarget(null);
              },
              onError: () => publishAppToast({ variant: "error", message: "Could not update shift." }),
            },
          );
        }}
        primaryButtonLabel={updateMutation.isPending ? "Saving…" : "Save"}
        primaryButtonDisabled={updateMutation.isPending}
        cancelButtonLabel="Close"
        maxWidth={560}
        fitContent
      >
        <InputField label="Shift name" value={editName} onChange={(e) => setEditName(e.target.value)} />
        <InputField
          label="Start time"
          type="time"
          inputProps={{ step: 60 }}
          value={editStartTime}
          onChange={(e) => setEditStartTime(e.target.value)}
        />
        <InputField
          label="End time"
          type="time"
          inputProps={{ step: 60 }}
          value={editEndTime}
          onChange={(e) => setEditEndTime(e.target.value)}
        />
        <InputField
          label="Break minutes"
          type="number"
          inputProps={{ min: 0, step: 5 }}
          value={editBreakMinutes}
          onChange={(e) => setEditBreakMinutes(e.target.value)}
        />
        <SelectField
          label="Timezone"
          value={editTimezone}
          onChange={setEditTimezone}
          options={
            editTimezone && !timezoneOptions.some((o) => o.value === editTimezone)
              ? [{ value: editTimezone, label: editTimezone }, ...timezoneOptions]
              : timezoneOptions
          }
          searchable
          searchPlaceholder="Search timezone…"
          menuMaxRows={6}
        />
      </FormModal>
    </Box>
  );
}
