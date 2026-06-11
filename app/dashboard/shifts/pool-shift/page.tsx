"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Chip from "@mui/material/Chip";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import { AttachMoney as AttachMoneyIcon } from "@mui/icons-material";
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
  SearchBar,
  SearchSubmitButton,
  ToolbarFilterPopover,
  FilterPanelHeader,
  ToolbarFilterPopoverPanel,
} from "@/components/common";
import type { DataTableColumn } from "@/components/common";
import { gradientPrimaryButtonSx } from "@/components/common/Button/Button.styles";
import {
  rolesCard,
  rolesFooterRow,
  rolesIconBox,
  rolesPageWrapper,
  rolesPaginationWrapper,
} from "../../roles/roles.styles";
import { footerMutedText, pageWrapper } from "../../companies/overview.styles";
import { publishAppToast } from "@/lib/notify";
import { formatIsoDate, isRecord, pickNum, pickStr, unwrapApiData } from "@/lib/utils/core";
import {
  HRMS_SHIFTS_LIST_SEARCH_MAX,
  clampWorkingDaysMask,
  effectiveWorkingDaysMask,
  formatWorkingDaysMaskHuman,
  HRMS_DEFAULT_WORKING_DAYS_MASK,
} from "@/lib/utils/hrms";
import {
  useAssignPoolShiftMutation,
  useCompaniesByResellerQuery,
  useCompaniesSetupResellersQuery,
  useDepartmentsListQuery,
  usePoolShiftAssignmentsListQuery,
  usePoolsListQuery,
  useRemovePoolShiftAssignmentMutation,
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
  poolShiftActionsSx,
  poolShiftHeaderChipSx,
  poolShiftFilterHintSx,
  poolShiftFilterPopoverPairRowSx,
  poolShiftFilterPopoverStackSx,
  poolShiftHeaderWrapSx,
  poolShiftIconSx,
  poolShiftCardHintSx,
  poolShiftSubtextSx,
} from "./pool-shift.styles";

const PAGE_LIMIT = 8;

const DEPT_KIND_OPTIONS: { value: "Internal" | "External"; label: string }[] = [
  { value: "Internal", label: "Internal" },
  { value: "External", label: "External" },
];

type AssignmentRow = {
  id: string;
  poolName: string;
  shiftName: string;
  effectiveFrom: string;
  effectiveTo: string;
  weekSummary: string;
};

export default function PoolShiftPage() {
  const theme = useTheme() as AppTheme;
  const { isPlatformAdmin, user: authUser } = useAuth();
  const mayPickInternal = useMemo(
    () => sessionMayPickInternalUserScope(isPlatformAdmin, authUser),
    [isPlatformAdmin, authUser],
  );

  const [filterDeptKind, setFilterDeptKind] = useState<"Internal" | "External">("Internal");
  const effectiveFilterKind: "Internal" | "External" = mayPickInternal ? filterDeptKind : "External";

  const [filterResellerId, setFilterResellerId] = useState("");
  const [filterParentCompanyId, setFilterParentCompanyId] = useState("");
  const [filterDepartmentId, setFilterDepartmentId] = useState("");
  const [filterPoolId, setFilterPoolId] = useState("");

  const [page, setPage] = useState(1);
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
  const [assignPoolId, setAssignPoolId] = useState("");

  const [shiftId, setShiftId] = useState("");
  const [effectiveFrom, setEffectiveFrom] = useState("");
  const [effectiveTo, setEffectiveTo] = useState("");
  const [assignOverrideWeek, setAssignOverrideWeek] = useState(false);
  const [assignWorkingMask, setAssignWorkingMask] = useState(HRMS_DEFAULT_WORKING_DAYS_MASK);

  const filterInternalDepartmentsQuery = useDepartmentsListQuery(
    effectiveFilterKind === "Internal" ? { all: true, type: "Internal" } : undefined,
    { enabled: effectiveFilterKind === "Internal", scope: "pool-shift-filter-internal-depts" },
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
      scope: "pool-shift-filter-external-depts",
    },
  );

  const filterPoolsQuery = usePoolsListQuery(
    filterDepartmentId.trim() ? { departmentId: filterDepartmentId.trim(), all: true } : undefined,
    { enabled: Boolean(filterDepartmentId.trim()), scope: "pool-shift-filter-pools" },
  );

  const assignInternalDepartmentsQuery = useDepartmentsListQuery(
    assignOpen && effectiveAssignKind === "Internal" ? { all: true, type: "Internal" } : undefined,
    { enabled: assignOpen && effectiveAssignKind === "Internal", scope: "pool-shift-assign-internal-depts" },
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
      scope: "pool-shift-assign-external-depts",
    },
  );
  const assignPoolsQuery = usePoolsListQuery(
    assignDepartmentId.trim() ? { departmentId: assignDepartmentId.trim(), all: true } : undefined,
    { enabled: assignOpen && Boolean(assignDepartmentId.trim()), scope: "pool-shift-assign-pools" },
  );

  useEffect(() => {
    setFilterResellerId("");
    setFilterParentCompanyId("");
    setFilterDepartmentId("");
    setFilterPoolId("");
    setListSearchDraft("");
    setListAppliedSearch("");
  }, [filterDeptKind]);

  useEffect(() => {
    setFilterParentCompanyId("");
    setFilterDepartmentId("");
    setFilterPoolId("");
  }, [filterResellerId]);

  useEffect(() => {
    setFilterDepartmentId("");
    setFilterPoolId("");
  }, [filterParentCompanyId]);

  useEffect(() => {
    setFilterPoolId("");
  }, [filterDepartmentId]);

  useEffect(() => {
    setAssignResellerId("");
    setAssignParentCompanyId("");
    setAssignDepartmentId("");
    setAssignPoolId("");
    setShiftId("");
  }, [assignDeptKind]);

  useEffect(() => {
    setAssignParentCompanyId("");
    setAssignDepartmentId("");
    setAssignPoolId("");
  }, [assignResellerId]);

  useEffect(() => {
    setAssignDepartmentId("");
    setAssignPoolId("");
  }, [assignParentCompanyId]);

  useEffect(() => {
    setAssignPoolId("");
  }, [assignDepartmentId]);

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

  const filterPoolOptions = useMemo(() => {
    const payload = unwrapApiData(filterPoolsQuery.data);
    const payloadObj = isRecord(payload) ? payload : null;
    const items = Array.isArray(payloadObj?.["items"]) ? (payloadObj?.["items"] as unknown[]).filter(isRecord) : [];
    const base = items
      .map((r) => {
        const id = pickStr(r, ["id"]);
        const name = pickStr(r, ["name"]);
        if (!id || !name) return null;
        return { value: id, label: name };
      })
      .filter((o): o is { value: string; label: string } => o !== null);
    const prompt = !filterDepartmentId.trim()
      ? "Select department first"
      : filterPoolsQuery.isLoading
        ? "Loading pools…"
        : "— Select pool —";
    return [{ value: "", label: prompt }, ...base];
  }, [filterPoolsQuery.data, filterPoolsQuery.isLoading, filterDepartmentId]);

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

  const assignPoolOptions = useMemo(() => {
    const payload = unwrapApiData(assignPoolsQuery.data);
    const payloadObj = isRecord(payload) ? payload : null;
    const items = Array.isArray(payloadObj?.["items"]) ? (payloadObj?.["items"] as unknown[]).filter(isRecord) : [];
    const base = items
      .map((r) => {
        const id = pickStr(r, ["id"]);
        const name = pickStr(r, ["name"]);
        if (!id || !name) return null;
        return { value: id, label: name };
      })
      .filter((o): o is { value: string; label: string } => o !== null);
    const prompt = !assignDepartmentId.trim()
      ? "Select department first"
      : assignPoolsQuery.isLoading
        ? "Loading pools…"
        : "— Select pool —";
    return [{ value: "", label: prompt }, ...base];
  }, [assignPoolsQuery.data, assignPoolsQuery.isLoading, assignDepartmentId]);

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
    { enabled: true, scope: "pool-shift-templates" },
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

  const selectedPoolLabel = useMemo(() => {
    if (!filterPoolId.trim()) return "";
    return filterPoolOptions.find((o) => o.value === filterPoolId)?.label ?? "";
  }, [filterPoolId, filterPoolOptions]);

  const listParams = useMemo(
    () =>
      filterPoolId.trim()
        ? { poolId: filterPoolId.trim(), page, limit: PAGE_LIMIT }
        : { all: true as const, page, limit: PAGE_LIMIT },
    [filterPoolId, page],
  );
  const listQuery = usePoolShiftAssignmentsListQuery(listParams, {
    enabled: true,
    scope: "pool-shift",
  });
  const assignMutation = useAssignPoolShiftMutation();
  const removeMutation = useRemovePoolShiftAssignmentMutation();

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
    setListSearchDraft("");
    setListAppliedSearch("");
  }, [filterPoolId]);

  useEffect(() => {
    setPage((p) => (p > pageCount ? pageCount : p));
  }, [pageCount]);

  const tableRows = useMemo<AssignmentRow[]>(() => {
    return items
      .map((r) => {
        const id = pickStr(r, ["id"]);
        if (!id) return null;
        const poolName =
          pickStr(isRecord(r["pool"]) ? (r["pool"] as Record<string, unknown>) : null, ["name"]) ||
          selectedPoolLabel ||
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
        return {
          id,
          poolName,
          shiftName,
          effectiveFrom: formatIsoDate(fromRaw),
          effectiveTo: formatIsoDate(toRaw),
          weekSummary,
        };
      })
      .filter((x): x is AssignmentRow => x !== null);
  }, [items, selectedPoolLabel]);

  const listSearchNorm = useMemo(() => listAppliedSearch.trim().toLowerCase(), [listAppliedSearch]);

  const listDisplayRows = useMemo(() => {
    if (!listSearchNorm) return tableRows;
    return tableRows.filter((row) => {
      const hay = [row.poolName, row.shiftName, row.weekSummary, row.effectiveFrom, row.effectiveTo]
        .join(" ")
        .toLowerCase();
      return hay.includes(listSearchNorm);
    });
  }, [tableRows, listSearchNorm]);

  const footerRangeStart = tableRows.length > 0 ? (page - 1) * PAGE_LIMIT + 1 : 0;
  const footerRangeEnd = (page - 1) * PAGE_LIMIT + tableRows.length;

  const columns = useMemo<DataTableColumn<AssignmentRow>[]>(
    () => [
      { id: "poolName", label: "Pool" },
      { id: "shiftName", label: "Shift" },
      { id: "weekSummary", label: "Working week" },
      { id: "effectiveFrom", label: "Effective from" },
      { id: "effectiveTo", label: "Effective to" },
    ],
    [],
  );

  const filterHint = useMemo(() => {
    if (filterPoolId.trim()) return "List is limited to the selected pool.";
    if (filterDepartmentId.trim()) return "Optional: pick a pool to narrow the list; leave pool empty to keep all assignments visible.";
    if (effectiveFilterKind === "External" && (filterResellerId.trim() || filterParentCompanyId.trim())) {
      return "Use department (and optionally pool) to narrow external assignments.";
    }
    return "Showing all pool assignments. Open Filter to narrow by department or pool.";
  }, [effectiveFilterKind, filterPoolId, filterDepartmentId, filterResellerId, filterParentCompanyId]);

  const filterClearDisabled = useMemo(
    () =>
      !listSearchDraft.trim() &&
      !listAppliedSearch.trim() &&
      !filterPoolId.trim() &&
      !filterDepartmentId.trim() &&
      !filterResellerId.trim() &&
      !filterParentCompanyId.trim() &&
      (!mayPickInternal || filterDeptKind === "Internal"),
    [
      mayPickInternal,
      filterDeptKind,
      listSearchDraft,
      listAppliedSearch,
      filterPoolId,
      filterDepartmentId,
      filterResellerId,
      filterParentCompanyId,
    ],
  );

  const clearFilters = useCallback(() => {
    setFilterDeptKind(mayPickInternal ? "Internal" : "External");
    setFilterResellerId("");
    setFilterParentCompanyId("");
    setFilterDepartmentId("");
    setFilterPoolId("");
    setListSearchDraft("");
    setListAppliedSearch("");
  }, [mayPickInternal]);

  const handleListSearchApply = useCallback(() => {
    setListAppliedSearch(listSearchDraft.trim().slice(0, HRMS_SHIFTS_LIST_SEARCH_MAX));
    setPage(1);
  }, [listSearchDraft]);

  const poolShiftListFilterPanel = useMemo(() => {
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
        <FilterPanelHeader title="Filters" />
        <Box sx={poolShiftFilterPopoverStackSx}>
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
              <Box sx={poolShiftFilterPopoverPairRowSx}>
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
            <SelectField
              label="Pool"
              value={filterPoolId}
              onChange={setFilterPoolId}
              options={filterPoolOptions}
              searchable
              searchPlaceholder="Search pool…"
              menuMaxRows={7}
              disabled={!filterDepartmentId.trim()}
            />
          </Box>
          <Typography variant="body2" sx={{ ...poolShiftFilterHintSx, mt: 1.5 }}>
            {filterHint}
          </Typography>
      </ToolbarFilterPopoverPanel>
    );
  }, [
    mayPickInternal,
    filterDeptKind,
    effectiveFilterKind,
    filterResellerId,
    filterParentCompanyId,
    filterDepartmentId,
    filterPoolId,
    filterResellerOptions,
    filterParentCompanyOptions,
    filterDepartmentOptions,
    filterPoolOptions,
    filterHint,
    filterClearDisabled,
    clearFilters,
  ]);

  const resetAssignModal = () => {
    setAssignDeptKind(mayPickInternal ? "Internal" : "External");
    setAssignResellerId("");
    setAssignParentCompanyId("");
    setAssignDepartmentId("");
    setAssignPoolId("");
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
    if (!assignPoolId.trim()) {
      publishAppToast({ variant: "error", message: "Please select a pool." });
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
        poolId: assignPoolId.trim(),
        shiftId: shiftId.trim(),
        effectiveFrom: effectiveFrom.trim(),
        effectiveTo: effectiveTo.trim(),
        ...(assignOverrideWeek ? { workingDaysMask: clampWorkingDaysMask(assignWorkingMask) } : {}),
      },
      {
        onSuccess: () => {
          publishAppToast({ variant: "success", message: "Pool shift assigned successfully." });
          setAssignOpen(false);
          resetAssignModal();
        },
        onError: () => publishAppToast({ variant: "error", message: "Could not assign shift." }),
      },
    );
  };

  const listAssignmentsFooterText = useMemo(() => {
    if (listQuery.isLoading || listQuery.isFetching) return "Loading…";
    if (listAppliedSearch.trim()) {
      if (listDisplayRows.length === 0) return "No assignments on this page match your search.";
      return `${listDisplayRows.length} row(s) on this page match your search (current page only).`;
    }
    return `Showing data ${footerRangeStart} to ${footerRangeEnd} of ${totalEntries} entries`;
  }, [
    listQuery.isFetching,
    listQuery.isLoading,
    listAppliedSearch,
    listDisplayRows.length,
    footerRangeStart,
    footerRangeEnd,
    totalEntries,
  ]);

  return (
    <Box sx={[pageWrapper, rolesPageWrapper] as SxProps<Theme>}>
      <Box sx={poolShiftHeaderWrapSx}>
        <Box>
          <Typography variant="regularLarge" fontWeight={700} color="white">
            Pool shift assignments
          </Typography>
          <Typography variant="body2" sx={poolShiftSubtextSx}>
            Default shifts for a pool (applies to users without a user override).
          </Typography>
        </Box>
        <Box sx={poolShiftActionsSx}>
          <Chip
            label={`${totalEntries} assignment${totalEntries === 1 ? "" : "s"}`}
            variant="outlined"
            sx={poolShiftHeaderChipSx}
          />
          <Button variant="primary" sx={gradientPrimaryButtonSx} onClick={() => setAssignOpen(true)}>
            Add pool shift
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
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, minWidth: 0 }}>
            <Box sx={rolesIconBox}>
              <AttachMoneyIcon sx={poolShiftIconSx} />
            </Box>
            <Typography variant="mediumLarge" fontWeight={600} color="white">
              Assigned shifts
            </Typography>
          </Box>
          <Box sx={departmentsSearchRow}>
            <Box sx={departmentsSearchFieldWrapper}>
              <SearchBar
                value={listSearchDraft}
                onChange={(v) => setListSearchDraft(v.slice(0, HRMS_SHIFTS_LIST_SEARCH_MAX))}
                placeholder="Search by pool, shift, or dates…"
              />
            </Box>
            <SearchSubmitButton
              disabled={listSearchDraft.trim() === listAppliedSearch.trim()}
              onClick={handleListSearchApply}
            />
            <ToolbarFilterPopover open={listFilterOpen} onOpenChange={setListFilterOpen} active={!filterClearDisabled}>
              {poolShiftListFilterPanel}
            </ToolbarFilterPopover>
          </Box>
        </Box>

        <Typography variant="body2" sx={poolShiftCardHintSx}>
          Use Filter to narrow by department or pool. Search applies to the current page after you press Search.
        </Typography>

        <DataTable<AssignmentRow>
          columns={columns}
          rows={listDisplayRows}
          isLoading={listQuery.isLoading || listQuery.isFetching}
          getRowId={(row) => row.id}
          minWidth={720}
          actionColumn={{
            label: "Action",
            render: (row) => (
              <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                <IconButton
                  size="small"
                  sx={{
                    ...dataTableActionButton,
                    color: theme.app.dashboard.accentRedLight,
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

        <Box sx={rolesFooterRow}>
          <Typography variant="medium" sx={footerMutedText(theme)}>
            {listAssignmentsFooterText}
          </Typography>
          <Box sx={rolesPaginationWrapper}>
            <TablePagination page={page} pageCount={pageCount} onPageChange={setPage} />
          </Box>
        </Box>
      </DashboardCard>

      <FormModal
        open={assignOpen}
        title="Add pool shift"
        description={
          mayPickInternal
            ? "Pick department type, department and pool here (independent from list filters)."
            : "Pick reseller, parent company, department and pool (independent from list filters)."
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
            label="Pool"
            value={assignPoolId}
            onChange={setAssignPoolId}
            options={assignPoolOptions}
            searchable
            searchPlaceholder="Search pool…"
            menuMaxRows={7}
            disabled={!assignDepartmentId.trim()}
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
                    Inherits the shift template when off. Sent only for this pool assignment.
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
        description="Remove this pool shift assignment?"
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
