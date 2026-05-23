"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Box from "@mui/material/Box";
import Alert from "@mui/material/Alert";
import IconButton from "@mui/material/IconButton";
import Chip from "@mui/material/Chip";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import { AccessTime as AccessTimeIcon } from "@mui/icons-material";
import DeleteIcon from "@mui/icons-material/Delete";
import type { SxProps, Theme } from "@mui/material/styles";
import { alpha, useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import {
  Typography,
  DashboardCard,
  Button,
  SelectField,
  DataTable,
  dataTableActionButton,
  TablePagination,
  InputField,
  FormModal,
  ConfirmActionModal,
  SegmentedControl,
  SearchBar,
  SearchSubmitButton,
  ToolbarFilterPopover,
  ToolbarFilterPopoverPanel,
} from "@/components/common";
import type { DataTableColumn } from "@/components/common";
import { gradientPrimaryButtonSx, pillCompanionChipSx } from "@/components/common/Button/Button.styles";
import { rolesCard, rolesIconBox, rolesPageWrapper } from "../../roles/roles.styles";
import { footerMutedText, pageWrapper } from "../../companies/overview.styles";
import { publishAppToast } from "@/lib/notify";
import { formatIsoDate, isRecord, pickNum, pickStr, unwrapApiData } from "@/lib/utils/core";
import {
  HRMS_SHIFTS_LIST_SEARCH_MAX,
  hrmsList403UserMessage,
  buildHrmsDepartmentShiftsListQueryRecord,
  type HrmsShiftsListShiftScope,
  clampWorkingDaysMask,
  effectiveWorkingDaysMask,
  formatWorkingDaysMaskHuman,
  HRMS_DEFAULT_WORKING_DAYS_MASK,
} from "@/lib/utils/hrms";
import {
  useCompaniesByResellerQuery,
  useCompaniesSetupResellersQuery,
  useDepartmentsListQuery,
  useDepartmentShiftsListQuery,
  useEnableDepartmentShiftMutation,
  useRemoveDepartmentShiftMutation,
  useShiftsListQuery,
} from "@/lib/hooks/query";
import { extractParentCompaniesFromByResellerTree, pickItemsArray, toIdNameOption } from "@/app/dashboard/user-page/components/add-user-modal.utils";
import { useAuth, sessionMayPickInternalUserScope } from "@/lib/auth";
import { WorkingWeekDayToggles } from "@/app/dashboard/shifts/components";
import {
  departmentsCardHeader,
  departmentsSearchFieldWrapper,
  departmentsSearchRow,
} from "@/app/dashboard/website-assigning/website-assigning.styles";
import {
  departmentShiftActionsSx,
  departmentShiftFilterHintSx,
  departmentShiftFilterPopoverPairRowSx,
  departmentShiftFilterPopoverStackSx,
  departmentShiftHeaderWrapSx,
  departmentShiftIconSx,
  departmentShiftSubtextSx,
} from "./department-shift.styles";

const PAGE_LIMIT = 8;

const DEPT_KIND_OPTIONS: { value: "Internal" | "External"; label: string }[] = [
  { value: "Internal", label: "Internal" },
  { value: "External", label: "External" },
];

type AssignmentRow = {
  id: string;
  departmentName: string;
  shiftName: string;
  /** Platform = both owner ids null on linked shift; Tenant otherwise. */
  shiftTemplate: "Platform" | "Tenant" | "—";
  effectiveFrom: string;
  effectiveTo: string;
  weekSummary: string;
};

function shiftTemplateCatalogLabel(shift: Record<string, unknown> | null): "Platform" | "Tenant" | "—" {
  if (!shift) return "—";
  const orv = shift["ownerResellerId"] ?? shift["owner_reseller_id"];
  const opv = shift["ownerParentCompanyId"] ?? shift["owner_parent_company_id"];
  const orStr = orv == null || orv === "" ? "" : String(orv).trim();
  const opStr = opv == null || opv === "" ? "" : String(opv).trim();
  if (!orStr && !opStr) return "Platform";
  return "Tenant";
}

export default function DepartmentShiftPage() {
  const theme = useTheme() as AppTheme;
  const { isPlatformAdmin, user: authUser } = useAuth();
  const mayPickInternal = useMemo(
    () => sessionMayPickInternalUserScope(isPlatformAdmin, authUser?.userType),
    [isPlatformAdmin, authUser?.userType],
  );

  const [filterDeptKind, setFilterDeptKind] = useState<"Internal" | "External">("Internal");
  const effectiveFilterKind: "Internal" | "External" = mayPickInternal ? filterDeptKind : "External";

  const [filterResellerId, setFilterResellerId] = useState("");
  const [filterParentCompanyId, setFilterParentCompanyId] = useState("");
  const [filterDepartmentId, setFilterDepartmentId] = useState("");

  const [page, setPage] = useState(1);
  const [listShiftScope, setListShiftScope] = useState<HrmsShiftsListShiftScope>("all");
  const [listSearchDraft, setListSearchDraft] = useState("");
  const [listAppliedSearch, setListAppliedSearch] = useState("");

  const [listFilterOpen, setListFilterOpen] = useState(false);

  const [assignOpen, setAssignOpen] = useState(false);
  const [removeTarget, setRemoveTarget] = useState<AssignmentRow | null>(null);

  const [assignDeptKind, setAssignDeptKind] = useState<"Internal" | "External">("Internal");
  const effectiveAssignKind: "Internal" | "External" = mayPickInternal ? assignDeptKind : "External";

  const [assignResellerId, setAssignResellerId] = useState("");
  const [assignParentCompanyId, setAssignParentCompanyId] = useState("");
  const [assignDepartmentId, setAssignDepartmentId] = useState("");

  const [shiftId, setShiftId] = useState("");
  const [effectiveFrom, setEffectiveFrom] = useState("");
  const [effectiveTo, setEffectiveTo] = useState("");
  const [assignOverrideWeek, setAssignOverrideWeek] = useState(false);
  const [assignWorkingMask, setAssignWorkingMask] = useState(HRMS_DEFAULT_WORKING_DAYS_MASK);

  const filterInternalDepartmentsQuery = useDepartmentsListQuery(
    effectiveFilterKind === "Internal" ? { all: true, type: "Internal" } : undefined,
    { enabled: effectiveFilterKind === "Internal", scope: "dept-shift-filter-internal-depts" },
  );
  const filterResellersQuery = useCompaniesSetupResellersQuery({
    enabled: effectiveFilterKind === "External",
  });
  const filterParentCompaniesQuery = useCompaniesByResellerQuery(
    filterResellerId.trim(),
    { view: "tree", sortBy: "name", sortOrder: "asc", all: true },
    { enabled: effectiveFilterKind === "External" && Boolean(filterResellerId.trim()) },
  );
  const filterExternalDepartmentsQuery = useDepartmentsListQuery(
    effectiveFilterKind === "External" && filterResellerId.trim() && filterParentCompanyId.trim()
      ? {
          all: true,
          type: "External",
          resellerId: filterResellerId.trim(),
          parentCompanyId: filterParentCompanyId.trim(),
        }
      : undefined,
    {
      enabled:
        effectiveFilterKind === "External" &&
        Boolean(filterResellerId.trim()) &&
        Boolean(filterParentCompanyId.trim()),
      scope: "dept-shift-filter-external-depts",
    },
  );

  const assignInternalDepartmentsQuery = useDepartmentsListQuery(
    assignOpen && effectiveAssignKind === "Internal" ? { all: true, type: "Internal" } : undefined,
    { enabled: assignOpen && effectiveAssignKind === "Internal", scope: "dept-shift-assign-internal-depts" },
  );
  const assignResellersQuery = useCompaniesSetupResellersQuery({
    enabled: assignOpen && effectiveAssignKind === "External",
  });
  const assignParentCompaniesQuery = useCompaniesByResellerQuery(
    assignResellerId.trim(),
    { view: "tree", sortBy: "name", sortOrder: "asc", all: true },
    { enabled: assignOpen && effectiveAssignKind === "External" && Boolean(assignResellerId.trim()) },
  );
  const assignExternalDepartmentsQuery = useDepartmentsListQuery(
    assignOpen && effectiveAssignKind === "External" && assignResellerId.trim() && assignParentCompanyId.trim()
      ? {
          all: true,
          type: "External",
          resellerId: assignResellerId.trim(),
          parentCompanyId: assignParentCompanyId.trim(),
        }
      : undefined,
    {
      enabled:
        assignOpen &&
        effectiveAssignKind === "External" &&
        Boolean(assignResellerId.trim()) &&
        Boolean(assignParentCompanyId.trim()),
      scope: "dept-shift-assign-external-depts",
    },
  );

  useEffect(() => {
    setFilterResellerId("");
    setFilterParentCompanyId("");
    setFilterDepartmentId("");
    setListSearchDraft("");
    setListAppliedSearch("");
    setListShiftScope(mayPickInternal ? "all" : "external");
  }, [filterDeptKind, mayPickInternal]);

  useEffect(() => {
    setFilterParentCompanyId("");
    setFilterDepartmentId("");
  }, [filterResellerId]);

  useEffect(() => {
    setFilterDepartmentId("");
  }, [filterParentCompanyId]);

  useEffect(() => {
    setAssignResellerId("");
    setAssignParentCompanyId("");
    setAssignDepartmentId("");
    setShiftId("");
  }, [assignDeptKind]);

  useEffect(() => {
    setAssignParentCompanyId("");
    setAssignDepartmentId("");
  }, [assignResellerId]);

  useEffect(() => {
    setAssignDepartmentId("");
  }, [assignParentCompanyId]);

  const filterResellerOptions = useMemo(() => {
    const base = pickItemsArray(filterResellersQuery.data)
      .map(toIdNameOption)
      .filter((o): o is { value: string; label: string } => o !== null);
    return [
      {
        value: "",
        label: filterResellersQuery.isLoading ? "Loading resellers…" : "— Select reseller —",
      },
      ...base,
    ];
  }, [filterResellersQuery.data, filterResellersQuery.isLoading]);

  const filterParentCompanyOptions = useMemo(() => {
    const base = extractParentCompaniesFromByResellerTree(filterParentCompaniesQuery.data);
    return [
      {
        value: "",
        label:
          !filterResellerId.trim()
            ? "Select reseller first"
            : filterParentCompaniesQuery.isLoading
              ? "Loading parent companies…"
              : "— Select parent company —",
      },
      ...base,
    ];
  }, [filterParentCompaniesQuery.data, filterParentCompaniesQuery.isLoading, filterResellerId]);

  const filterDepartmentOptions = useMemo(() => {
    const source =
      effectiveFilterKind === "Internal"
        ? filterInternalDepartmentsQuery.data
        : filterExternalDepartmentsQuery.data;
    const loading =
      effectiveFilterKind === "Internal"
        ? filterInternalDepartmentsQuery.isLoading
        : filterExternalDepartmentsQuery.isLoading;
    const base = pickItemsArray(source)
      .map(toIdNameOption)
      .filter((o): o is { value: string; label: string } => o !== null);
    const prompt =
      effectiveFilterKind === "External" && !filterParentCompanyId.trim()
        ? "Select parent company first"
        : loading
          ? "Loading departments…"
          : "— Select department —";
    return [{ value: "", label: prompt }, ...base];
  }, [
    effectiveFilterKind,
    filterInternalDepartmentsQuery.data,
    filterInternalDepartmentsQuery.isLoading,
    filterExternalDepartmentsQuery.data,
    filterExternalDepartmentsQuery.isLoading,
    filterParentCompanyId,
  ]);

  const assignResellerOptions = useMemo(() => {
    const base = pickItemsArray(assignResellersQuery.data)
      .map(toIdNameOption)
      .filter((o): o is { value: string; label: string } => o !== null);
    return [
      {
        value: "",
        label: assignResellersQuery.isLoading ? "Loading resellers…" : "— Select reseller —",
      },
      ...base,
    ];
  }, [assignResellersQuery.data, assignResellersQuery.isLoading]);

  const assignParentCompanyOptions = useMemo(() => {
    const base = extractParentCompaniesFromByResellerTree(assignParentCompaniesQuery.data);
    return [
      {
        value: "",
        label:
          !assignResellerId.trim()
            ? "Select reseller first"
            : assignParentCompaniesQuery.isLoading
              ? "Loading parent companies…"
              : "— Select parent company —",
      },
      ...base,
    ];
  }, [assignParentCompaniesQuery.data, assignParentCompaniesQuery.isLoading, assignResellerId]);

  const assignDepartmentOptions = useMemo(() => {
    const source =
      effectiveAssignKind === "Internal" ? assignInternalDepartmentsQuery.data : assignExternalDepartmentsQuery.data;
    const loading =
      effectiveAssignKind === "Internal"
        ? assignInternalDepartmentsQuery.isLoading
        : assignExternalDepartmentsQuery.isLoading;
    const base = pickItemsArray(source)
      .map(toIdNameOption)
      .filter((o): o is { value: string; label: string } => o !== null);
    const prompt =
      effectiveAssignKind === "External" && !assignParentCompanyId.trim()
        ? "Select parent company first"
        : loading
          ? "Loading departments…"
          : "— Select department —";
    return [{ value: "", label: prompt }, ...base];
  }, [
    effectiveAssignKind,
    assignInternalDepartmentsQuery.data,
    assignInternalDepartmentsQuery.isLoading,
    assignExternalDepartmentsQuery.data,
    assignExternalDepartmentsQuery.isLoading,
    assignParentCompanyId,
  ]);

  const listParams = useMemo(
    () =>
      buildHrmsDepartmentShiftsListQueryRecord({
        page,
        limit: PAGE_LIMIT,
        ...(filterDepartmentId.trim() ? { departmentId: filterDepartmentId.trim() } : {}),
        ...(effectiveFilterKind === "External" && filterParentCompanyId.trim()
          ? { parentCompanyId: filterParentCompanyId.trim() }
          : {}),
        ...(listAppliedSearch.trim()
          ? { search: listAppliedSearch.trim().slice(0, HRMS_SHIFTS_LIST_SEARCH_MAX) }
          : {}),
        shiftScope: mayPickInternal ? listShiftScope : "external",
      }),
    [
      page,
      filterDepartmentId,
      effectiveFilterKind,
      filterParentCompanyId,
      listAppliedSearch,
      mayPickInternal,
      listShiftScope,
    ],
  );
  const listQuery = useDepartmentShiftsListQuery(listParams, {
    enabled: true,
    scope: "dept-shifts",
  });
  const deptShiftsList403 = useMemo(() => hrmsList403UserMessage(listQuery.error), [listQuery.error]);
  const assignMutation = useEnableDepartmentShiftMutation();
  const removeMutation = useRemoveDepartmentShiftMutation();

  const shiftCatalogParentCompanyId = useMemo(() => {
    if (assignOpen && effectiveAssignKind === "External" && assignParentCompanyId.trim()) {
      return assignParentCompanyId.trim();
    }
    if (!assignOpen && effectiveFilterKind === "External" && filterParentCompanyId.trim()) {
      return filterParentCompanyId.trim();
    }
    return "";
  }, [
    assignOpen,
    effectiveAssignKind,
    assignParentCompanyId,
    effectiveFilterKind,
    filterParentCompanyId,
  ]);

  const shiftCatalogKind = assignOpen ? effectiveAssignKind : effectiveFilterKind;

  const shiftsQuery = useShiftsListQuery(
    {
      all: true,
      shiftScope: shiftCatalogKind === "Internal" ? "internal" : "external",
      ...(shiftCatalogParentCompanyId ? { parentCompanyId: shiftCatalogParentCompanyId } : {}),
    },
    { enabled: true, scope: "dept-shift-templates" },
  );
  const shiftOptions = useMemo(() => {
    const payload = unwrapApiData(shiftsQuery.data);
    const payloadObj = isRecord(payload) ? payload : null;
    const items = Array.isArray(payloadObj?.["items"]) ? (payloadObj?.["items"] as unknown[]).filter(isRecord) : [];
    const base = items
      .map((r) => {
        const id = pickStr(r, ["id"]);
        const name = pickStr(r, ["name"]);
        if (!id || !name) return null;
        const cat = pickStr(r, ["catalog"]).toLowerCase();
        const scopeLabel = cat === "platform" ? "Internal" : cat === "tenant" ? "External" : "";
        const label = scopeLabel ? `${name} (${scopeLabel})` : name;
        return { value: id, label };
      })
      .filter((o): o is { value: string; label: string } => o !== null);
    return [{ value: "", label: "— Select shift —" }, ...base];
  }, [shiftsQuery.data]);

  const payload = unwrapApiData(listQuery.data);
  const payloadObj = isRecord(payload) ? payload : null;
  const items = useMemo(() => {
    const arr = payloadObj?.["items"];
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

  useEffect(() => {
    setPage(1);
  }, [
    filterDepartmentId,
    listShiftScope,
    listAppliedSearch,
    effectiveFilterKind,
    filterParentCompanyId,
    filterResellerId,
    filterDeptKind,
  ]);

  useEffect(() => {
    if (mayPickInternal) return;
    setListShiftScope("external");
  }, [mayPickInternal]);

  useEffect(() => {
    setPage((p) => (p > pageCount ? pageCount : p));
  }, [pageCount]);

  const selectedDepartmentLabel = useMemo(() => {
    if (!filterDepartmentId.trim()) return "";
    return filterDepartmentOptions.find((o) => o.value === filterDepartmentId)?.label ?? "";
  }, [filterDepartmentId, filterDepartmentOptions]);

  const tableRows = useMemo<AssignmentRow[]>(() => {
    return items
      .map((r) => {
        const id = pickStr(r, ["id"]);
        if (!id) return null;
        const departmentName =
          pickStr(isRecord(r["department"]) ? (r["department"] as Record<string, unknown>) : null, ["name"]) ||
          selectedDepartmentLabel ||
          "—";
        const shiftObj = isRecord(r["shift"]) ? (r["shift"] as Record<string, unknown>) : null;
        const shiftName =
          pickStr(shiftObj, ["name"]) ||
          pickStr(r, ["shiftName"]) ||
          "—";
        const fromRaw = pickStr(r, ["effectiveFrom", "from", "startDate"]);
        const toRaw = pickStr(r, ["effectiveTo", "to", "endDate"]);
        const rawAssign = r["workingDaysMask"] ?? r["working_days_mask"];
        let assignMask: number | null = null;
        if (rawAssign !== null && rawAssign !== undefined && rawAssign !== "") {
          const n = typeof rawAssign === "number" ? rawAssign : Number(rawAssign);
          if (Number.isFinite(n) && n >= 1 && n <= 127) assignMask = Math.trunc(n);
        }
        const tmplMask = pickNum(shiftObj, ["workingDaysMask", "working_days_mask"]);
        const eff = effectiveWorkingDaysMask(assignMask, tmplMask);
        const weekSummary =
          assignMask != null
            ? formatWorkingDaysMaskHuman(clampWorkingDaysMask(assignMask))
            : `Inherited (${formatWorkingDaysMaskHuman(eff)})`;
        const shiftTemplate = shiftTemplateCatalogLabel(shiftObj);
        return {
          id,
          departmentName,
          shiftName,
          shiftTemplate,
          effectiveFrom: formatIsoDate(fromRaw),
          effectiveTo: formatIsoDate(toRaw),
          weekSummary,
        };
      })
      .filter((x): x is AssignmentRow => x !== null);
  }, [items, selectedDepartmentLabel]);

  const footerRangeStart = tableRows.length > 0 ? (page - 1) * PAGE_LIMIT + 1 : 0;
  const footerRangeEnd = (page - 1) * PAGE_LIMIT + tableRows.length;

  const columns = useMemo<DataTableColumn<AssignmentRow>[]>(
    () => [
      { id: "departmentName", label: "Department" },
      { id: "shiftName", label: "Shift" },
      {
        id: "shiftTemplate",
        label: "Template",
        render: (_, row) => (
          <Chip
            size="small"
            label={row.shiftTemplate}
            variant="outlined"
            sx={{
              height: 24,
              fontWeight: 600,
              borderColor: alpha(theme.app.dashboard.white95, 0.25),
              color: theme.app.dashboard.white95,
            }}
          />
        ),
      },
      { id: "weekSummary", label: "Working week" },
      { id: "effectiveFrom", label: "Effective from" },
      { id: "effectiveTo", label: "Effective to" },
    ],
    [theme],
  );

  const filterHint = useMemo(() => {
    if (filterDepartmentId.trim()) return "Filtered by department";
    if (effectiveFilterKind === "External" && (filterResellerId.trim() || filterParentCompanyId.trim())) {
      return "Narrow assignments with reseller / parent filters, or pick a department";
    }
    return "Showing all departments";
  }, [effectiveFilterKind, filterDepartmentId, filterResellerId, filterParentCompanyId]);

  const filterClearDisabled = useMemo(() => {
    const scopeAtDefault = mayPickInternal ? listShiftScope === "all" : listShiftScope === "external";
    return (
      !listSearchDraft.trim() &&
      !listAppliedSearch.trim() &&
      scopeAtDefault &&
      !filterDepartmentId.trim() &&
      !filterResellerId.trim() &&
      !filterParentCompanyId.trim() &&
      (!mayPickInternal || filterDeptKind === "Internal")
    );
  }, [
    mayPickInternal,
    filterDeptKind,
    filterDepartmentId,
    filterResellerId,
    filterParentCompanyId,
    listSearchDraft,
    listAppliedSearch,
    listShiftScope,
  ]);

  const clearFilters = useCallback(() => {
    setFilterDeptKind(mayPickInternal ? "Internal" : "External");
    setFilterResellerId("");
    setFilterParentCompanyId("");
    setFilterDepartmentId("");
    setListShiftScope(mayPickInternal ? "all" : "external");
    setListSearchDraft("");
    setListAppliedSearch("");
  }, [mayPickInternal]);

  const handleListSearchApply = useCallback(() => {
    setListAppliedSearch(listSearchDraft.trim().slice(0, HRMS_SHIFTS_LIST_SEARCH_MAX));
    setPage(1);
  }, [listSearchDraft]);

  const departmentShiftListFilterPanel = useMemo(() => {
    return (
      <ToolbarFilterPopoverPanel
        footer={
          <>
            <Button type="button" variant="secondary" disabled={filterClearDisabled} onClick={clearFilters}>
              Clear filters
            </Button>
            <Button type="button" variant="primary" sx={gradientPrimaryButtonSx} onClick={() => setListFilterOpen(false)}>
              Done
            </Button>
          </>
        }
      >
        <Typography variant="medium" fontWeight={700} sx={{ color: theme.app.text.primary, mb: 1.5 }}>
          Filters
        </Typography>
        {mayPickInternal ? (
          <Box sx={{ mb: 2 }}>
            <Typography variant="caption" sx={{ display: "block", mb: 0.75, color: theme.app.dashboard.textMuted }}>
              Shift template scope (list)
            </Typography>
            <SegmentedControl
              options={[
                { value: "all", label: "All" },
                { value: "internal", label: "Internal" },
                { value: "external", label: "External" },
              ]}
              value={listShiftScope}
              onChange={(v) => setListShiftScope(v as HrmsShiftsListShiftScope)}
              sx={{
                width: "100%",
                display: "flex",
                "& .MuiToggleButtonGroup-grouped": { flex: 1, minWidth: 0 },
              }}
            />
          </Box>
        ) : null}
        <Box sx={departmentShiftFilterPopoverStackSx}>
            {mayPickInternal ? (
              <SelectField
                label="Department type"
                value={filterDeptKind}
                onChange={(v) => setFilterDeptKind(v as "Internal" | "External")}
                options={DEPT_KIND_OPTIONS}
                menuMaxRows={4}
              />
            ) : null}
            {effectiveFilterKind === "External" ? (
              <Box sx={departmentShiftFilterPopoverPairRowSx}>
                <SelectField
                  label="Reseller"
                  value={filterResellerId}
                  onChange={setFilterResellerId}
                  options={filterResellerOptions}
                  menuMaxRows={8}
                />
                <SelectField
                  label="Parent company"
                  value={filterParentCompanyId}
                  onChange={setFilterParentCompanyId}
                  options={filterParentCompanyOptions}
                  searchable
                  searchPlaceholder="Search parent company…"
                  menuMaxRows={7}
                  disabled={!filterResellerId.trim()}
                />
              </Box>
            ) : null}
            <SelectField
              label="Department"
              value={filterDepartmentId}
              onChange={setFilterDepartmentId}
              options={filterDepartmentOptions}
              searchable
              searchPlaceholder="Search department…"
              menuMaxRows={8}
              disabled={effectiveFilterKind === "External" && !filterParentCompanyId.trim()}
            />
          </Box>
          <Typography variant="body2" sx={{ ...departmentShiftFilterHintSx, mt: 1.5 }}>
            {filterHint}
          </Typography>
      </ToolbarFilterPopoverPanel>
    );
  }, [
    theme,
    mayPickInternal,
    listShiftScope,
    filterDeptKind,
    effectiveFilterKind,
    filterResellerId,
    filterParentCompanyId,
    filterDepartmentId,
    filterResellerOptions,
    filterParentCompanyOptions,
    filterDepartmentOptions,
    filterHint,
    filterClearDisabled,
    clearFilters,
  ]);

  const resetAssignModal = () => {
    setAssignDeptKind(mayPickInternal ? "Internal" : "External");
    setAssignResellerId("");
    setAssignParentCompanyId("");
    setAssignDepartmentId("");
    setShiftId("");
    setEffectiveFrom("");
    setEffectiveTo("");
    setAssignOverrideWeek(false);
    setAssignWorkingMask(HRMS_DEFAULT_WORKING_DAYS_MASK);
  };

  const handleAssign = () => {
    if (!assignDepartmentId.trim()) {
      publishAppToast({ variant: "error", message: "Please select a department." });
      return;
    }
    if (!shiftId.trim()) {
      publishAppToast({ variant: "error", message: "Please select a shift." });
      return;
    }
    if (!effectiveFrom.trim()) {
      publishAppToast({ variant: "error", message: "Please select effective from date." });
      return;
    }
    if (!effectiveTo.trim()) {
      publishAppToast({ variant: "error", message: "Please select effective to date." });
      return;
    }

    assignMutation.mutate(
      {
        departmentId: assignDepartmentId.trim(),
        shiftId: shiftId.trim(),
        effectiveFrom: effectiveFrom.trim(),
        effectiveTo: effectiveTo.trim(),
        ...(assignOverrideWeek ? { workingDaysMask: clampWorkingDaysMask(assignWorkingMask) } : {}),
      },
      {
        onSuccess: () => {
          publishAppToast({ variant: "success", message: "Department shift assigned successfully." });
          setAssignOpen(false);
          resetAssignModal();
        },
        onError: () => publishAppToast({ variant: "error", message: "Could not assign shift." }),
      },
    );
  };

  return (
    <Box sx={[pageWrapper, rolesPageWrapper] as SxProps<Theme>}>
      <Box sx={departmentShiftHeaderWrapSx}>
        <Box>
          <Typography variant="regularLarge" fontWeight={700} color="white">
            Department shift assignments
          </Typography>
          <Typography variant="body2" sx={departmentShiftSubtextSx}>
            Default shifts for a department (applies to users without user/pool overrides).
          </Typography>
        </Box>
        <Box sx={departmentShiftActionsSx}>
          <Chip
            label={`${totalEntries} assignment${totalEntries === 1 ? "" : "s"}`}
            variant="outlined"
            sx={pillCompanionChipSx}
          />
          <Button variant="primary" sx={gradientPrimaryButtonSx} onClick={() => setAssignOpen(true)}>
            Assign shift
          </Button>
        </Box>
      </Box>

      <DashboardCard
        sx={{
          ...rolesCard,
          border: `1px solid ${alpha(theme.palette.common.white, 0.14)}`,
        }}
      >
        <Box sx={[departmentsCardHeader, { pb: 1.25 }] as SxProps<Theme>}>
          <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5, minWidth: 0 }}>
            <Box sx={rolesIconBox}>
              <AccessTimeIcon sx={departmentShiftIconSx} />
            </Box>
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="mediumLarge" fontWeight={600} color="white">
                Assigned shifts
              </Typography>
              <Typography variant="body2" sx={departmentShiftSubtextSx}>
                Search and filter department shift assignments. Use Assign shift to add new assignments.
              </Typography>
            </Box>
          </Box>
          <Box sx={departmentsSearchRow}>
            <Box sx={departmentsSearchFieldWrapper}>
              <SearchBar
                value={listSearchDraft}
                onChange={(v) => setListSearchDraft(v.slice(0, HRMS_SHIFTS_LIST_SEARCH_MAX))}
                placeholder="Search by shift or department name…"
              />
            </Box>
            <SearchSubmitButton
              disabled={listSearchDraft.trim() === listAppliedSearch.trim()}
              onClick={handleListSearchApply}
            />
            <ToolbarFilterPopover
              open={listFilterOpen}
              onOpenChange={setListFilterOpen}
              active={!filterClearDisabled}
            >
              {departmentShiftListFilterPanel}
            </ToolbarFilterPopover>
          </Box>
        </Box>

        {deptShiftsList403 ? (
          <Alert severity="error" sx={{ mb: 1.5 }}>
            {deptShiftsList403}
          </Alert>
        ) : null}

        <Box sx={{ px: { xs: 1.5, sm: 2 }, pb: 0 }}>
          <DataTable<AssignmentRow>
            columns={columns}
            rows={tableRows}
            isLoading={(listQuery.isLoading || listQuery.isFetching) && !deptShiftsList403}
            getRowId={(row) => row.id}
            minWidth={920}
            actionColumn={{
              label: "Action",
              render: (row) => (
                <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                  <IconButton
                    size="small"
                    sx={{
                      ...dataTableActionButton,
                      color: "#ff6b6b",
                      opacity: removeMutation.isPending ? 0.7 : 1,
                    }}
                    aria-label="Remove assignment"
                    disabled={removeMutation.isPending}
                    onClick={() => {
                      setRemoveTarget(row);
                    }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
              ),
            }}
          />
        </Box>

        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 2, px: { xs: 1.5, sm: 2 }, pb: { xs: 1.5, sm: 2 } }}>
          <Typography variant="medium" sx={footerMutedText(theme)}>
            {deptShiftsList403
              ? deptShiftsList403
              : listQuery.isLoading
                ? "Loading…"
                : tableRows.length === 0
                  ? "No shift assignments found for the current filter."
                  : `Showing data ${footerRangeStart} to ${footerRangeEnd} of ${totalEntries} entries`}
          </Typography>
          <TablePagination page={page} pageCount={pageCount} onPageChange={setPage} />
        </Box>
      </DashboardCard>

      <FormModal
        open={assignOpen}
        title="Assign shift to department"
        description={
          mayPickInternal
            ? "Pick department type (Internal or External), then department, shift, and dates."
            : "Pick reseller, parent company, department, shift, and dates."
        }
        onClose={() => {
          if (assignMutation.isPending) return;
          setAssignOpen(false);
          resetAssignModal();
        }}
        onSave={handleAssign}
        primaryButtonLabel={assignMutation.isPending ? "Saving…" : "Assign"}
        primaryButtonDisabled={assignMutation.isPending}
        cancelButtonLabel="Close"
        maxWidth={600}
        fitContent
      >
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          {mayPickInternal ? (
            <SelectField
              label="Department type"
              value={assignDeptKind}
              onChange={(v) => setAssignDeptKind(v as "Internal" | "External")}
              options={DEPT_KIND_OPTIONS}
              menuMaxRows={4}
            />
          ) : null}
          {effectiveAssignKind === "External" ? (
            <>
              <SelectField
                label="Reseller"
                value={assignResellerId}
                onChange={setAssignResellerId}
                options={assignResellerOptions}
                menuMaxRows={8}
              />
              <SelectField
                label="Parent company"
                value={assignParentCompanyId}
                onChange={setAssignParentCompanyId}
                options={assignParentCompanyOptions}
                searchable
                searchPlaceholder="Search parent company…"
                menuMaxRows={7}
                disabled={!assignResellerId.trim()}
              />
            </>
          ) : null}
          <SelectField
            label="Department"
            value={assignDepartmentId}
            onChange={setAssignDepartmentId}
            options={assignDepartmentOptions}
            searchable
            searchPlaceholder="Search department…"
            menuMaxRows={8}
            disabled={effectiveAssignKind === "External" && !assignParentCompanyId.trim()}
          />
          <SelectField
            label="Shift"
            value={shiftId}
            onChange={setShiftId}
            options={shiftOptions}
            searchable
            searchPlaceholder="Search shift…"
            menuMaxRows={7}
          />
          <Box
            sx={{
              mt: 1,
              pt: 1.5,
              borderTop: `1px solid ${alpha(theme.app.dashboard.white95, 0.1)}`,
            }}
          >
            <Typography
              variant="caption"
              sx={{
                display: "block",
                mb: 1,
                fontWeight: 700,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: alpha(theme.app.dashboard.white95, 0.42),
              }}
            >
              Weekly pattern override
            </Typography>
            <FormControlLabel
              control={
                <Checkbox
                  checked={assignOverrideWeek}
                  onChange={(e) => setAssignOverrideWeek(e.target.checked)}
                  disabled={assignMutation.isPending}
                  size="small"
                />
              }
              label={
                <Box>
                  <Typography variant="body2" color="white" sx={{ fontWeight: 600 }}>
                    Use custom working days
                  </Typography>
                  <Typography variant="caption" sx={{ display: "block", color: theme.app.dashboard.textMuted, mt: 0.25, lineHeight: 1.45 }}>
                    Inherits the shift template when off. Pool copies use the same mask when enabled.
                  </Typography>
                </Box>
              }
              sx={{ alignItems: "flex-start", ml: 0, mr: 0, mb: assignOverrideWeek ? 1 : 0 }}
            />
            {assignOverrideWeek ? (
              <WorkingWeekDayToggles
                value={assignWorkingMask}
                onChange={setAssignWorkingMask}
                disabled={assignMutation.isPending}
              />
            ) : null}
          </Box>
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 2 }}>
            <InputField
              label="Effective from"
              type="date"
              value={effectiveFrom}
              onChange={(e) => setEffectiveFrom(e.target.value)}
            />
            <InputField
              label="Effective to"
              type="date"
              value={effectiveTo}
              onChange={(e) => setEffectiveTo(e.target.value)}
            />
          </Box>
        </Box>
      </FormModal>

      <ConfirmActionModal
        open={removeTarget != null}
        title="Remove assignment?"
        description="Remove this department shift assignment?"
        confirmLabel={removeMutation.isPending ? "Removing…" : "Remove"}
        cancelLabel="Cancel"
        confirmButtonVariant="danger"
        isLoading={removeMutation.isPending}
        onDismiss={() => {
          if (removeMutation.isPending) return;
          setRemoveTarget(null);
        }}
        onConfirm={() => {
          const target = removeTarget;
          if (!target) return;
          removeMutation.mutate(target.id, {
            onSuccess: () => {
              publishAppToast({ variant: "success", message: "Assignment removed." });
              setRemoveTarget(null);
            },
            onError: () => publishAppToast({ variant: "error", message: "Could not remove assignment." }),
          });
        }}
      />
    </Box>
  );
}
