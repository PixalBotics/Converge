"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Box from "@mui/material/Box";
import Alert from "@mui/material/Alert";
import Chip from "@mui/material/Chip";
import { alpha, useTheme, type SxProps, type Theme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import {
  Typography,
  Button,
  InputField,
  SelectField,
  FormModal,
  ConfirmActionModal,
  SegmentedControl,
  ToolbarFilterPopoverPanel,
} from "@/components/common";
import type { DataTableColumn } from "@/components/common";
import { gradientPrimaryButtonSx } from "@/components/common/Button/Button.styles";
import { rolesPageWrapper } from "../roles/roles.styles";
import { pageWrapper } from "../companies/overview.styles";
import { publishAppToast } from "@/lib/notify";
import {
  useCompaniesByResellerQuery,
  useCompaniesSetupResellersQuery,
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
  shiftApiTimeToTimeInputValue,
  unwrapApiData,
} from "@/lib/utils/core";
import {
  HRMS_SHIFTS_LIST_SEARCH_MAX,
  hrmsList403UserMessage,
  resolveShiftDetailObject,
  clampWorkingDaysMask,
  formatWorkingDaysMaskHuman,
  HRMS_DEFAULT_WORKING_DAYS_MASK,
  workingWeekdaysFromApiRecord,
} from "@/lib/utils/hrms";
import { useDebouncedValue } from "@/lib/hooks/use-debounced-value";
import { ShiftsTableCard, WorkingWeekDayToggles, type ShiftRow } from "./components";
import { useAuth, sessionMayPickInternalUserScope } from "@/lib/auth";
import { canShiftAction } from "@/lib/permissions";
import { extractParentCompaniesFromByResellerTree, pickItemsArray, toIdNameOption } from "@/app/dashboard/user-page/components/add-user-modal.utils";
import type { JsonRecord } from "@/api";

const PAGE_LIMIT = 8;

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
  const { hasOperational, isPlatformAdmin, user: authUser } = useAuth();
  const mayPickInternal = useMemo(
    () => sessionMayPickInternalUserScope(isPlatformAdmin, authUser?.userType),
    [isPlatformAdmin, authUser?.userType],
  );
  const canCreateShift = canShiftAction(hasOperational, "create");
  const canUpdateShift = canShiftAction(hasOperational, "update");
  const canDeleteShift = canShiftAction(hasOperational, "delete");
  const [searchInput, setSearchInput] = useState("");
  const debouncedSearchInput = useDebouncedValue(searchInput, 400);
  const catalogSearch = useMemo(
    () => debouncedSearchInput.trim().slice(0, HRMS_SHIFTS_LIST_SEARCH_MAX),
    [debouncedSearchInput],
  );
  const [page, setPage] = useState(1);
  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<ShiftRow | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ShiftRow | null>(null);

  const [shiftNameField, setShiftNameField] = useState("");
  const [startTimeField, setStartTimeField] = useState("");
  const [endTimeField, setEndTimeField] = useState("");
  const [breakMinutesField, setBreakMinutesField] = useState("");
  const [timezoneField, setTimezoneField] = useState("Asia/Karachi");
  const [createWorkingMask, setCreateWorkingMask] = useState(HRMS_DEFAULT_WORKING_DAYS_MASK);
  const [createCatalogScope, setCreateCatalogScope] = useState<"platform" | "tenant">("platform");
  const [createOwnerResellerId, setCreateOwnerResellerId] = useState("");
  const [createOwnerParentCompanyId, setCreateOwnerParentCompanyId] = useState("");
  const [narrowResellerId, setNarrowResellerId] = useState("");
  const [narrowParentCompanyId, setNarrowParentCompanyId] = useState("");
  const [listCatalogFilter, setListCatalogFilter] = useState<"all" | "internal" | "external">("external");
  const [filterPanelOpen, setFilterPanelOpen] = useState(false);

  const [editName, setEditName] = useState("");
  const [editStartTime, setEditStartTime] = useState("");
  const [editEndTime, setEditEndTime] = useState("");
  const [editBreakMinutes, setEditBreakMinutes] = useState("");
  const [editTimezone, setEditTimezone] = useState("Asia/Karachi");
  const [editWorkingMask, setEditWorkingMask] = useState(HRMS_DEFAULT_WORKING_DAYS_MASK);
  const hydratedEditIdRef = useRef<string>("");

  const narrowResellersQuery = useCompaniesSetupResellersQuery({
    enabled: mayPickInternal && (listCatalogFilter === "external" || listCatalogFilter === "all"),
  });
  const narrowParentCompaniesQuery = useCompaniesByResellerQuery(
    narrowResellerId.trim(),
    { view: "tree", sortBy: "name", sortOrder: "asc", all: true },
    {
      enabled:
        mayPickInternal &&
        (listCatalogFilter === "external" || listCatalogFilter === "all") &&
        narrowResellerId.trim().length > 0,
    },
  );

  const narrowResellerOptions = useMemo(() => {
    const base = pickItemsArray(narrowResellersQuery.data)
      .map(toIdNameOption)
      .filter((o): o is { value: string; label: string } => o !== null);
    return [
      { value: "", label: narrowResellersQuery.isLoading ? "Loading resellers…" : "— All resellers —" },
      ...base,
    ];
  }, [narrowResellersQuery.data, narrowResellersQuery.isLoading]);

  const narrowParentOptions = useMemo(() => {
    const base = extractParentCompaniesFromByResellerTree(narrowParentCompaniesQuery.data);
    return [
      {
        value: "",
        label:
          narrowResellerId.trim().length === 0
            ? "Select reseller to narrow by parent"
            : narrowParentCompaniesQuery.isLoading
              ? "Loading parent companies…"
              : "— All parents (no narrow) —",
      },
      ...base,
    ];
  }, [narrowParentCompaniesQuery.data, narrowParentCompaniesQuery.isLoading, narrowResellerId]);

  useEffect(() => {
    setNarrowParentCompanyId("");
  }, [narrowResellerId]);

  useEffect(() => {
    if (listCatalogFilter === "external" || listCatalogFilter === "all") return;
    setNarrowResellerId("");
    setNarrowParentCompanyId("");
  }, [listCatalogFilter]);

  const createResellersQuery = useCompaniesSetupResellersQuery({
    enabled: mayPickInternal && createOpen && createCatalogScope === "tenant",
  });
  const createParentCompaniesQuery = useCompaniesByResellerQuery(
    createOwnerResellerId.trim(),
    { view: "tree", sortBy: "name", sortOrder: "asc", all: true },
    {
      enabled:
        mayPickInternal &&
        createOpen &&
        createCatalogScope === "tenant" &&
        createOwnerResellerId.trim().length > 0,
    },
  );

  const createResellerOptions = useMemo(() => {
    const base = pickItemsArray(createResellersQuery.data)
      .map(toIdNameOption)
      .filter((o): o is { value: string; label: string } => o !== null);
    return [
      { value: "", label: createResellersQuery.isLoading ? "Loading resellers…" : "— Select reseller —" },
      ...base,
    ];
  }, [createResellersQuery.data, createResellersQuery.isLoading]);

  const createParentOptions = useMemo(() => {
    const base = extractParentCompaniesFromByResellerTree(createParentCompaniesQuery.data);
    return [
      {
        value: "",
        label:
          createOwnerResellerId.trim().length === 0
            ? "Select reseller first"
            : createParentCompaniesQuery.isLoading
              ? "Loading parent companies…"
              : "— Select parent company —",
      },
      ...base,
    ];
  }, [createParentCompaniesQuery.data, createParentCompaniesQuery.isLoading, createOwnerResellerId]);

  useEffect(() => {
    setCreateOwnerParentCompanyId("");
  }, [createOwnerResellerId]);

  useEffect(() => {
    if (createCatalogScope === "platform") {
      setCreateOwnerResellerId("");
      setCreateOwnerParentCompanyId("");
    }
  }, [createCatalogScope]);

  const timezoneOptions = useMemo(() => {
    return [{ value: "", label: "— Select timezone —" }, ...getTimezoneOptions()];
  }, []);

  const shiftsQuery = useShiftsListQuery(
    {
      page,
      limit: PAGE_LIMIT,
      ...(catalogSearch ? { search: catalogSearch } : {}),
      ...(mayPickInternal
        ? {
            shiftScope:
              listCatalogFilter === "all"
                ? ("all" as const)
                : listCatalogFilter === "internal"
                  ? ("internal" as const)
                  : ("external" as const),
          }
        : {}),
      ...(mayPickInternal &&
      (listCatalogFilter === "external" || listCatalogFilter === "all") &&
      narrowParentCompanyId.trim()
        ? { parentCompanyId: narrowParentCompanyId.trim() }
        : {}),
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
    const wm = pickNum(obj, ["workingDaysMask", "working_days_mask"]);
    setEditWorkingMask(wm != null ? clampWorkingDaysMask(wm) : HRMS_DEFAULT_WORKING_DAYS_MASK);

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
        const catalogRaw = pickStr(r, ["catalog"]).toLowerCase();
        const catalogLabel =
          catalogRaw === "tenant" ? "External" : catalogRaw === "platform" ? "Internal" : catalogRaw ? catalogRaw : "—";
        const ownerReseller = pickStr(r, ["ownerResellerName", "owner_reseller_name"]);
        const ownerParent = pickStr(r, ["ownerParentCompanyName", "owner_parent_company_name"]);
        const ownerDisplay =
          [ownerReseller, ownerParent]
            .map((s) => s.trim())
            .filter(Boolean)
            .join(" · ") || "—";
        const wk = workingWeekdaysFromApiRecord(r);
        const wm = pickNum(r, ["workingDaysMask", "working_days_mask"]);
        const workingDaysSummary = wk?.length
          ? wk.join(", ")
          : wm != null
            ? formatWorkingDaysMaskHuman(clampWorkingDaysMask(wm))
            : formatWorkingDaysMaskHuman(HRMS_DEFAULT_WORKING_DAYS_MASK);
        return {
          id,
          shiftName: pickStr(r, ["name", "shiftName"]) || "—",
          startTime: pickStr(r, ["startTime"]) || "—",
          endTime: pickStr(r, ["endTime"]) || "—",
          breakMinutes: pickNum(r, ["breakMinutes"]),
          timezone: pickStr(r, ["timezone"]) || "—",
          catalogLabel,
          ownerDisplay,
          workingDaysSummary,
        } satisfies ShiftRow;
      })
      .filter((x): x is ShiftRow => x !== null);
  }, [items]);

  useEffect(() => {
    setPage(1);
  }, [catalogSearch, listCatalogFilter, narrowParentCompanyId]);

  useEffect(() => {
    setPage((p) => (p > pageCount ? pageCount : p));
  }, [pageCount]);

  const footerRangeStart = tableRows.length > 0 ? (page - 1) * PAGE_LIMIT + 1 : 0;
  const footerRangeEnd = (page - 1) * PAGE_LIMIT + tableRows.length;

  const columns = useMemo<DataTableColumn<ShiftRow>[]>(
    () => [
      {
        id: "shiftName",
        label: "Shift",
        render: (_, row) => (
          <Typography
            variant="medium"
            sx={{ fontWeight: 600, color: theme.app.text.primary, letterSpacing: "-0.02em" }}
          >
            {row.shiftName}
          </Typography>
        ),
      },
      {
        id: "catalogLabel",
        label: "Scope",
        render: (v) => {
          const s = String(v ?? "—");
          if (s === "—") {
            return (
              <Chip
                size="small"
                label="—"
                sx={{
                  height: 26,
                  fontWeight: 600,
                  fontSize: 11,
                  borderRadius: 2,
                  border: `1px solid ${alpha(theme.app.dashboard.white95, 0.12)}`,
                  bgcolor: alpha(theme.app.dashboard.white95, 0.05),
                  color: theme.app.dashboard.textMuted,
                }}
              />
            );
          }
          const internal = s === "Internal";
          return (
            <Chip
              size="small"
              label={s}
              sx={{
                height: 26,
                fontWeight: 700,
                fontSize: 11,
                letterSpacing: "0.05em",
                textTransform: "uppercase",
                borderRadius: 2,
                border: "1px solid",
                ...(internal
                  ? {
                      color: alpha(theme.app.dashboard.accentGreenLight, 0.98),
                      borderColor: alpha(theme.app.dashboard.accentGreen, 0.5),
                      bgcolor: alpha(theme.app.dashboard.accentGreen, 0.14),
                      boxShadow: `0 0 0 1px ${alpha(theme.app.dashboard.accentGreen, 0.08)}`,
                    }
                  : {
                      color: alpha(theme.app.dashboard.blueTint, 0.98),
                      borderColor: alpha(theme.app.dashboard.accentBlue, 0.5),
                      bgcolor: alpha(theme.app.dashboard.accentBlue, 0.16),
                      boxShadow: `0 0 0 1px ${alpha(theme.app.dashboard.accentBlue, 0.08)}`,
                    }),
              }}
            />
          );
        },
      },
      {
        id: "ownerDisplay",
        label: "Owner",
        render: (_, row) => (
          <Typography
            variant="caption"
            component="div"
            noWrap
            title={row.ownerDisplay}
            sx={{
              color: theme.app.dashboard.textMuted,
              lineHeight: 1.5,
              maxWidth: 200,
            }}
          >
            {row.ownerDisplay}
          </Typography>
        ),
      },
      {
        id: "workingDaysSummary",
        label: "Working week",
        render: (_, row) => (
          <Typography
            variant="caption"
            component="div"
            title={row.workingDaysSummary}
            sx={{
              color: theme.app.dashboard.textMuted,
              lineHeight: 1.55,
              maxWidth: 220,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical" as const,
              overflow: "hidden",
            }}
          >
            {row.workingDaysSummary}
          </Typography>
        ),
      },
      { id: "startTime", label: "Start", cellVariant: "muted" },
      { id: "endTime", label: "End", cellVariant: "muted" },
      {
        id: "breakMinutes",
        label: "Break",
        render: (v) =>
          v == null || v === "" ? (
            <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted }}>
              —
            </Typography>
          ) : (
            <Chip
              size="small"
              label={`${v} min`}
              variant="outlined"
              sx={{
                height: 24,
                fontSize: 11,
                fontWeight: 600,
                borderColor: alpha(theme.app.dashboard.white95, 0.2),
                color: alpha(theme.app.dashboard.white95, 0.88),
                bgcolor: alpha(theme.app.dashboard.white95, 0.04),
              }}
            />
          ),
      },
      {
        id: "timezone",
        label: "Timezone",
        cellVariant: "muted",
        render: (_, row) => (
          <Typography
            variant="caption"
            sx={{
              fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
              fontSize: 11,
              color: alpha(theme.app.dashboard.textMuted, 0.95),
              letterSpacing: "0.02em",
            }}
          >
            {row.timezone}
          </Typography>
        ),
      },
    ],
    [theme],
  );

  const resetListFilters = useCallback(() => {
    setListCatalogFilter("external");
    setNarrowResellerId("");
    setNarrowParentCompanyId("");
    setPage(1);
  }, []);

  const shiftsFilterPanel = useMemo(() => {
    if (!mayPickInternal) return null;
    const sectionRule = `1px solid ${alpha(theme.app.dashboard.white95, 0.1)}`;
    return (
      <ToolbarFilterPopoverPanel
        footer={
          <>
            <Button type="button" variant="secondary" onClick={resetListFilters}>
              Reset
            </Button>
            <Button type="button" variant="primary" sx={gradientPrimaryButtonSx} onClick={() => setFilterPanelOpen(false)}>
              Done
            </Button>
          </>
        }
      >
        <Typography variant="medium" fontWeight={700} sx={{ color: theme.app.text.primary, mb: 1.5 }}>
          Filters
        </Typography>
        <SegmentedControl
          options={[
            { value: "all", label: "All" },
            { value: "internal", label: "Internal" },
            { value: "external", label: "External" },
          ]}
          value={listCatalogFilter}
          onChange={(v) => setListCatalogFilter(v as "all" | "internal" | "external")}
          sx={{
            width: "100%",
            display: "flex",
            "& .MuiToggleButtonGroup-grouped": { flex: 1, minWidth: 0 },
          }}
        />

        {listCatalogFilter === "external" || listCatalogFilter === "all" ? (
          <Box
            sx={{
              mt: 2,
              pt: 2,
              display: "grid",
              gap: 1.75,
              borderTop: sectionRule,
              bgcolor: alpha(theme.app.dashboard.white95, 0.03),
            }}
          >
            <SelectField
              label="Reseller"
              value={narrowResellerId}
              onChange={(v) => {
                setNarrowResellerId(v);
                setNarrowParentCompanyId("");
              }}
              options={narrowResellerOptions}
              menuMaxRows={6}
            />
            <SelectField
              label="Parent company"
              value={narrowParentCompanyId}
              onChange={setNarrowParentCompanyId}
              options={narrowParentOptions}
              searchable
              searchPlaceholder="Search parent…"
              menuMaxRows={7}
              disabled={!narrowResellerId.trim()}
            />
          </Box>
        ) : null}
      </ToolbarFilterPopoverPanel>
    );
  }, [
    mayPickInternal,
    theme,
    listCatalogFilter,
    narrowResellerId,
    narrowParentCompanyId,
    narrowResellerOptions,
    narrowParentOptions,
    resetListFilters,
  ]);

  const resetForm = () => {
    setShiftNameField("");
    setStartTimeField("");
    setEndTimeField("");
    setBreakMinutesField("");
    setTimezoneField("Asia/Karachi");
    setCreateWorkingMask(HRMS_DEFAULT_WORKING_DAYS_MASK);
    setCreateCatalogScope("platform");
    setCreateOwnerResellerId("");
    setCreateOwnerParentCompanyId("");
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
    if (mayPickInternal && createCatalogScope === "tenant") {
      if (!createOwnerResellerId.trim() || !createOwnerParentCompanyId.trim()) {
        publishAppToast({
          variant: "error",
          message: "For an external (client) template, select reseller and parent company.",
        });
        return;
      }
    }

    const body: JsonRecord = {
      name,
      startTime: startTimeField.trim(),
      endTime: endTimeField.trim(),
      ...(breakMinutes != null ? { breakMinutes } : {}),
      timezone: timezoneField.trim(),
      workingDaysMask: clampWorkingDaysMask(createWorkingMask),
    };
    if (mayPickInternal && createCatalogScope === "tenant") {
      body.ownerResellerId = createOwnerResellerId.trim();
      body.ownerParentCompanyId = createOwnerParentCompanyId.trim();
    }

    createMutation.mutate(
      body,
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

  const shiftsList403 = useMemo(() => hrmsList403UserMessage(shiftsQuery.error), [shiftsQuery.error]);

  return (
    <Box sx={[pageWrapper, rolesPageWrapper] as SxProps<Theme>}>
      <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 2, mb: 1.5 }}>
        <Box>
          <Typography variant="regularLarge" fontWeight={700} color="white" sx={{ letterSpacing: "-0.03em" }}>
            Shifts
          </Typography>
          <Typography variant="body2" sx={{ mt: 0.75, color: theme.app.dashboard.textMuted, maxWidth: 520 }}>
            Shift templates and weekly patterns.
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

      {shiftsList403 ? (
        <Alert severity="error" sx={{ mb: 1.5 }}>
          {shiftsList403}
        </Alert>
      ) : null}

      <ShiftsTableCard
        rows={tableRows}
        columns={columns}
        isLoading={(shiftsQuery.isLoading || shiftsQuery.isFetching) && !shiftsList403}
        searchInput={searchInput}
        onSearchInputChange={(v) => setSearchInput(v.slice(0, HRMS_SHIFTS_LIST_SEARCH_MAX))}
        showSearchSubmitButton={false}
        page={page}
        pageCount={pageCount}
        emptyState={{
          title: "No shift templates",
          description: shiftsList403 ? "Access denied for the current filters." : "Try another search or page.",
        }}
        footerText={
          shiftsList403
            ? shiftsList403
            : shiftsQuery.isLoading
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
        filterPanel={mayPickInternal ? shiftsFilterPanel : undefined}
        filterOpen={mayPickInternal ? filterPanelOpen : false}
        onFilterOpenChange={mayPickInternal ? setFilterPanelOpen : undefined}
        filterButtonActive={
          mayPickInternal &&
          (listCatalogFilter !== "external" ||
            Boolean(narrowResellerId.trim()) ||
            Boolean(narrowParentCompanyId.trim()))
        }
      />

      <FormModal
        open={createOpen}
        title="Add shift"
        description="Create a shift template (weekly pattern + timezone). External sessions create external-scoped templates automatically."
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
        maxWidth={640}
        fitContent
      >
        <InputField
          label="Shift name"
          placeholder="Morning"
          value={shiftNameField}
          onChange={(e) => setShiftNameField(e.target.value)}
        />
        {mayPickInternal ? (
          <SelectField
            label="Template scope"
            value={createCatalogScope}
            onChange={(v) => setCreateCatalogScope(v as "platform" | "tenant")}
            options={[
              { value: "platform", label: "Internal (shared catalog)" },
              { value: "tenant", label: "External (reseller + parent company)" },
            ]}
            menuMaxRows={4}
          />
        ) : null}
        {mayPickInternal && createCatalogScope === "tenant" ? (
          <>
            <SelectField
              label="Reseller"
              value={createOwnerResellerId}
              onChange={setCreateOwnerResellerId}
              options={createResellerOptions}
              menuMaxRows={8}
            />
            <SelectField
              label="Parent company"
              value={createOwnerParentCompanyId}
              onChange={setCreateOwnerParentCompanyId}
              options={createParentOptions}
              searchable
              searchPlaceholder="Search parent…"
              menuMaxRows={7}
              disabled={!createOwnerResellerId.trim()}
            />
          </>
        ) : null}
        <Box
          sx={{
            mt: 0.5,
            mb: 1.25,
            pl: 1.5,
            borderLeft: `3px solid ${alpha(theme.app.dashboard.accentBlue, 0.65)}`,
          }}
        >
          <Typography
            variant="caption"
            sx={{
              fontWeight: 700,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: alpha(theme.app.dashboard.white95, 0.45),
            }}
          >
            Daily schedule
          </Typography>
          <Typography variant="caption" sx={{ display: "block", mt: 0.35, color: theme.app.dashboard.textMuted, lineHeight: 1.5 }}>
            Wall-clock start/end, break length, and IANA timezone used for attendance and weekly off detection.
          </Typography>
        </Box>
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
        <WorkingWeekDayToggles
          value={createWorkingMask}
          onChange={setCreateWorkingMask}
          disabled={createMutation.isPending}
        />
      </FormModal>

      <ConfirmActionModal
        open={deleteTarget != null}
        title="Delete shift?"
        description={deleteTarget ? `Delete shift “${deleteTarget.shiftName}”?` : "Delete this shift?"}
        confirmLabel={deleteMutation.isPending ? "Deleting…" : "Delete"}
        cancelLabel="Cancel"
        confirmButtonVariant="danger"
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
        description="Update name, schedule, timezone, and weekly working pattern for this template."
        onClose={() => {
          if (updateMutation.isPending) return;
          setEditTarget(null);
          setEditName("");
          setEditStartTime("");
          setEditEndTime("");
          setEditBreakMinutes("");
          setEditTimezone("Asia/Karachi");
          setEditWorkingMask(HRMS_DEFAULT_WORKING_DAYS_MASK);
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
                workingDaysMask: clampWorkingDaysMask(editWorkingMask),
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
        maxWidth={640}
        fitContent
      >
        <InputField label="Shift name" value={editName} onChange={(e) => setEditName(e.target.value)} />
        <Box
          sx={{
            mt: 0.25,
            mb: 1.25,
            pl: 1.5,
            borderLeft: `3px solid ${alpha(theme.app.dashboard.accentBlue, 0.65)}`,
          }}
        >
          <Typography
            variant="caption"
            sx={{
              fontWeight: 700,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: alpha(theme.app.dashboard.white95, 0.45),
            }}
          >
            Daily schedule
          </Typography>
          <Typography variant="caption" sx={{ display: "block", mt: 0.35, color: theme.app.dashboard.textMuted, lineHeight: 1.5 }}>
            Times and timezone; working week below applies to check-in eligibility by day.
          </Typography>
        </Box>
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
        <WorkingWeekDayToggles
          value={editWorkingMask}
          onChange={setEditWorkingMask}
          disabled={updateMutation.isPending}
        />
      </FormModal>
    </Box>
  );
}
