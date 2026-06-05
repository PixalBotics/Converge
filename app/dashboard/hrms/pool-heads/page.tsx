"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Box from "@mui/material/Box";
import Checkbox from "@mui/material/Checkbox";
import IconButton from "@mui/material/IconButton";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import {
  Person as PersonIcon,
  Delete as DeleteIcon,
  AccessTime as AccessTimeIcon,
} from "@mui/icons-material";
import type { SxProps, Theme } from "@mui/material/styles";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import {
  Button,
  Calendar,
  DashboardCard,
  DataTable,
  FormModal,
  InputField,
  SearchBar,
  SegmentedControl,
  SelectField,
  TablePagination,
  ToolbarFilterPopover,
  ToolbarFilterPopoverPanel,
  Typography,
  UserTypeBadge,
  dataTableActionButton,
} from "@/components/common";
import type { DataTableColumn } from "@/components/common";
import {
  rolesCard,
  rolesFooterRow,
  rolesIconBox,
  rolesPageWrapper,
  rolesPaginationWrapper,
} from "../../roles/roles.styles";
import { footerMutedText, pageWrapper } from "../../companies/overview.styles";
import { publishAppToast } from "@/lib/notify";
import { isRecord, pickNum, pickStr, unwrapApiData } from "@/lib/utils/core";
import {
  useAssignPoolHeadMutation,
  useCompaniesByResellerQuery,
  useCompaniesSetupResellersQuery,
  useDepartmentsListQuery,
  usePoolHeadsAttendanceQuery,
  usePoolHeadsListQuery,
  usePoolMembersListQuery,
  usePoolsListQuery,
  useRemovePoolHeadMutation,
} from "@/lib/hooks/query";
import {
  extractParentCompaniesFromByResellerTree,
  pickItemsArray,
  toIdNameOption,
} from "@/app/dashboard/user-page/components/add-user-modal.utils";
import { useAuth, sessionMayPickInternalUserScope } from "@/lib/auth";
import { canManagePoolHeads, canRemovePoolHead } from "@/lib/permissions";
import { resolveUserKind, type UserKind } from "@/lib/hrms/user-kind";
import { gradientPrimaryButtonSx } from "@/components/common/Button/Button.styles";
import {
  departmentsCardHeader,
  departmentsSearchFieldWrapper,
  departmentsSearchRow,
} from "@/app/dashboard/website-assigning/website-assigning.styles";

const PAGE_LIMIT = 12;
const ASSIGN_USER_TABLE_MAX_PX = 340;

type AssignPoolMemberRow = {
  id: string;
  user: string;
  email: string;
  department: string;
};

function poolMemberDisplayName(r: Record<string, unknown>): string {
  const first = pickStr(r, ["firstName", "first_name"]) || "";
  const last = pickStr(r, ["lastName", "last_name"]) || "";
  const joined = `${first} ${last}`.trim();
  if (joined) return joined;
  return pickStr(r, ["name", "fullName", "userName"]) || "—";
}

type PoolHeadRow = {
  id: string;
  userName: string;
  userEmail: string;
  userType: UserKind;
  resellerId: string;
  parentCompanyId: string;
  resellerName: string;
  parentCompanyName: string;
  poolId: string;
  poolName: string;
  departmentId: string;
  departmentName: string;
  designationName: string;
};

type AttendanceRow = {
  id: string;
  employeeName: string;
  userType: UserKind;
  resellerId: string;
  resellerName: string;
  parentCompanyId: string;
  parentCompanyName: string;
  poolName: string;
  date: string;
  status: string;
  checkIn: string;
  checkOut: string;
};

function extractItems(data: unknown): Record<string, unknown>[] {
  const payload = unwrapApiData(data);
  if (!payload) return [];
  if (Array.isArray(payload)) return payload.filter(isRecord);
  if (!isRecord(payload)) return [];
  const items = payload["items"];
  return Array.isArray(items) ? items.filter(isRecord) : [];
}

function extractTotal(data: unknown, fallback: number): number {
  const payload = unwrapApiData(data);
  if (!isRecord(payload)) return fallback;
  const n = pickNum(payload, ["total", "count", "totalCount"]);
  return n ?? fallback;
}

function extractTotalPages(data: unknown): number {
  const payload = unwrapApiData(data);
  if (!isRecord(payload)) return 1;
  const n = pickNum(payload, ["totalPages"]);
  return n && n > 0 ? n : 1;
}

function formatScopeId(value: string | undefined): string {
  const v = (value ?? "").trim();
  return v || "—";
}

function mapPoolHeadItem(r: Record<string, unknown>, idx: number): PoolHeadRow | null {
  const assignmentId = pickStr(r, ["id"]) || "";
  const user = isRecord(r["user"]) ? (r["user"] as Record<string, unknown>) : null;
  const pool = isRecord(r["pool"]) ? (r["pool"] as Record<string, unknown>) : null;
  const poolDepartment =
    pool && isRecord(pool["department"]) ? (pool["department"] as Record<string, unknown>) : null;
  const poolReseller =
    poolDepartment && isRecord(poolDepartment["reseller"])
      ? (poolDepartment["reseller"] as Record<string, unknown>)
      : null;
  const poolParentCompany =
    poolDepartment && isRecord(poolDepartment["parentCompany"])
      ? (poolDepartment["parentCompany"] as Record<string, unknown>)
      : null;
  const userDepartment =
    user && isRecord(user["department"]) ? (user["department"] as Record<string, unknown>) : null;
  const userDesignation =
    user && isRecord(user["designation"]) ? (user["designation"] as Record<string, unknown>) : null;
  const userParentCompany =
    user && isRecord(user["parentCompany"]) ? (user["parentCompany"] as Record<string, unknown>) : null;
  const dept =
    (isRecord(r["department"]) ? (r["department"] as Record<string, unknown>) : null) ??
    poolDepartment ??
    userDepartment;
  const firstName = pickStr(user, ["firstName", "first_name"]) || "";
  const middleName = pickStr(user, ["middleName", "middle_name"]) || "";
  const lastName = pickStr(user, ["lastName", "last_name"]) || "";
  const joinedName = `${firstName} ${middleName} ${lastName}`.replace(/\s+/g, " ").trim();
  const userName =
    joinedName ||
    pickStr(user, ["name", "fullName", "userName"]) ||
    pickStr(r, ["userName", "name"]) ||
    "—";
  const userEmail = pickStr(user, ["email"]) || pickStr(r, ["userEmail", "email"]) || "—";
  const rawType = pickStr(user, ["userType", "type", "user_type"]) || pickStr(r, ["userType", "user_type"]);
  const deptType =
    pickStr(poolDepartment, ["type"]) || pickStr(dept, ["type"]) || pickStr(r, ["departmentType"]);
  const userType = resolveUserKind(rawType, deptType);
  const resellerId = formatScopeId(
    pickStr(r, ["resellerId"]) ||
      pickStr(user, ["resellerId", "reseller_id"]) ||
      pickStr(poolReseller, ["id"]) ||
      pickStr(poolDepartment, ["resellerId", "reseller_id"]),
  );
  const resellerName =
    pickStr(r, ["resellerName"]) ||
    pickStr(poolReseller, ["name"]) ||
    pickStr(poolDepartment, ["resellerName"]) ||
    "—";
  const parentCompanyId = formatScopeId(
    pickStr(r, ["parentCompanyId", "parent_company_id"]) ||
      pickStr(r, ["userParentCompanyId"]) ||
      pickStr(user, ["parentCompanyId", "parent_company_id"]) ||
      pickStr(userParentCompany, ["id"]) ||
      pickStr(poolParentCompany, ["id"]) ||
      pickStr(poolDepartment, ["parentCompanyId", "parent_company_id"]),
  );
  const parentCompanyName =
    pickStr(r, ["parentCompanyName", "userParentCompanyName"]) ||
    pickStr(user, ["parentCompanyName"]) ||
    pickStr(userParentCompany, ["name"]) ||
    pickStr(poolParentCompany, ["name"]) ||
    pickStr(poolDepartment, ["parentCompanyName"]) ||
    "—";
  const poolId = pickStr(pool, ["id"]) || pickStr(r, ["poolId"]) || "";
  const poolName = pickStr(pool, ["name"]) || pickStr(r, ["poolName"]) || "—";
  const departmentId = pickStr(dept, ["id"]) || pickStr(r, ["departmentId", "poolDepartmentId"]) || "";
  const departmentName = pickStr(dept, ["name"]) || pickStr(r, ["departmentName", "poolDepartmentName"]) || "—";
  const designationName =
    pickStr(r, ["userDesignationName", "designationName"]) ||
    pickStr(userDesignation, ["name", "title"]) ||
    pickStr(user, ["designationName", "designation"]) ||
    "—";
  const id = assignmentId || `ph-${idx}`;
  if (!id) return null;
  return {
    id,
    userName,
    userEmail,
    userType,
    resellerId,
    parentCompanyId,
    resellerName,
    parentCompanyName,
    poolId,
    poolName,
    departmentId,
    departmentName,
    designationName,
  };
}

export default function PoolHeadsPage() {
  const theme = useTheme() as AppTheme;
  const { hasOperational, isPlatformAdmin, user: authUser } = useAuth();

  const mayPickInternalScope = sessionMayPickInternalUserScope(isPlatformAdmin, authUser?.userType);

  const headsUserTypeSegmentOptions = useMemo(
    () =>
      mayPickInternalScope
        ? [
            { value: "all", label: "All" },
            { value: "Internal", label: "Internal" },
            { value: "External", label: "External" },
          ]
        : [
            { value: "all", label: "All" },
            { value: "External", label: "External" },
          ],
    [mayPickInternalScope],
  );
  const canAssignPoolHead = canManagePoolHeads(hasOperational);
  const canRemovePoolHeadRow = canRemovePoolHead(hasOperational);
  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);

  const [mode, setMode] = useState<"heads" | "attendance">("heads");
  const [departmentId, setDepartmentId] = useState("");
  const [poolId, setPoolId] = useState("");
  const [page, setPage] = useState(1);
  /** Narrow the heads table by user kind (client-side on fetched rows). */
  const [headsUserTypeFilter, setHeadsUserTypeFilter] = useState<"all" | "Internal" | "External">("all");

  const [attendancePage, setAttendancePage] = useState(1);
  const [attendanceDate, setAttendanceDate] = useState(today);
  const [attendanceMemberName, setAttendanceMemberName] = useState("");
  const [filterPanelOpen, setFilterPanelOpen] = useState(false);
  /** List filter: which department slice to load (matches `GET /hrms/departments` query shape). */
  const [filterDeptKind, setFilterDeptKind] = useState<"Internal" | "External" | "all">(() =>
    mayPickInternalScope ? "Internal" : "External",
  );
  const [filterResellerId, setFilterResellerId] = useState("");
  const [filterParentCompanyId, setFilterParentCompanyId] = useState("");

  const [assignOpen, setAssignOpen] = useState(false);
  const [assignDepartmentId, setAssignDepartmentId] = useState("");
  const [assignPoolId, setAssignPoolId] = useState("");
  const [assignUserId, setAssignUserId] = useState("");
  const [assignUserTypeFilter, setAssignUserTypeFilter] = useState<"Internal" | "External">(() =>
    mayPickInternalScope ? "Internal" : "External",
  );
  const [assignExternalResellerId, setAssignExternalResellerId] = useState("");
  const [assignExternalParentCompanyId, setAssignExternalParentCompanyId] = useState("");
  const [assignMemberSearchInput, setAssignMemberSearchInput] = useState("");
  const [assignMemberSearchApplied, setAssignMemberSearchApplied] = useState("");

  const filterAllDeptsQuery = useDepartmentsListQuery(
    filterDeptKind === "all" ? { all: true } : undefined,
    { enabled: filterDeptKind === "all", scope: "pool-heads-filter-all-depts" },
  );
  const filterInternalDeptsQuery = useDepartmentsListQuery(
    filterDeptKind === "Internal" ? { all: true, type: "Internal" } : undefined,
    { enabled: filterDeptKind === "Internal", scope: "pool-heads-filter-internal-depts" },
  );
  const filterListResellersQuery = useCompaniesSetupResellersQuery({
    enabled: filterDeptKind === "External",
  });
  const filterListParentCompaniesQuery = useCompaniesByResellerQuery(
    filterResellerId.trim(),
    { view: "tree", sortBy: "name", sortOrder: "asc", all: true },
    { enabled: filterDeptKind === "External" && Boolean(filterResellerId.trim()) },
  );
  const filterExternalDeptsQuery = useDepartmentsListQuery(
    filterDeptKind === "External" && filterResellerId.trim() && filterParentCompanyId.trim()
      ? {
          all: true,
          type: "External",
          resellerId: filterResellerId.trim(),
          parentCompanyId: filterParentCompanyId.trim(),
        }
      : undefined,
    {
      enabled:
        filterDeptKind === "External" &&
        Boolean(filterResellerId.trim()) &&
        Boolean(filterParentCompanyId.trim()),
      scope: "pool-heads-filter-external-depts",
    },
  );

  const filterListResellerOptions = useMemo(() => {
    const base = pickItemsArray(filterListResellersQuery.data)
      .map(toIdNameOption)
      .filter((o): o is { value: string; label: string } => o !== null);
    return [{ value: "", label: filterListResellersQuery.isLoading ? "Loading resellers…" : "— Select reseller —" }, ...base];
  }, [filterListResellersQuery.data, filterListResellersQuery.isLoading]);

  const filterListParentCompanyOptions = useMemo(() => {
    const base = extractParentCompaniesFromByResellerTree(filterListParentCompaniesQuery.data);
    return [
      {
        value: "",
        label:
          !filterResellerId.trim()
            ? "Select reseller first"
            : filterListParentCompaniesQuery.isLoading
              ? "Loading parent companies…"
              : "— Select parent company —",
      },
      ...base,
    ];
  }, [filterListParentCompaniesQuery.data, filterListParentCompaniesQuery.isLoading, filterResellerId]);

  const listDepartmentOptions = useMemo(() => {
    if (filterDeptKind === "all") {
      const base = pickItemsArray(filterAllDeptsQuery.data)
        .map(toIdNameOption)
        .filter((o): o is { value: string; label: string } => o !== null);
      return [{ value: "", label: filterAllDeptsQuery.isLoading ? "Loading departments…" : "— Select department —" }, ...base];
    }
    if (filterDeptKind === "Internal") {
      const base = pickItemsArray(filterInternalDeptsQuery.data)
        .map(toIdNameOption)
        .filter((o): o is { value: string; label: string } => o !== null);
      return [{ value: "", label: filterInternalDeptsQuery.isLoading ? "Loading departments…" : "— Select department —" }, ...base];
    }
    const loading = filterExternalDeptsQuery.isLoading;
    const base = pickItemsArray(filterExternalDeptsQuery.data)
      .map(toIdNameOption)
      .filter((o): o is { value: string; label: string } => o !== null);
    const prompt =
      !filterResellerId.trim() || !filterParentCompanyId.trim()
        ? "Select reseller and parent company first"
        : loading
          ? "Loading departments…"
          : "— Select department —";
    return [{ value: "", label: prompt }, ...base];
  }, [
    filterDeptKind,
    filterAllDeptsQuery.data,
    filterAllDeptsQuery.isLoading,
    filterInternalDeptsQuery.data,
    filterInternalDeptsQuery.isLoading,
    filterExternalDeptsQuery.data,
    filterExternalDeptsQuery.isLoading,
    filterResellerId,
    filterParentCompanyId,
  ]);

  const filterDeptKindSegmentOptions = useMemo(
    () =>
      mayPickInternalScope
        ? [
            { value: "Internal", label: "Internal" },
            { value: "External", label: "External" },
            { value: "all", label: "All" },
          ]
        : [
            { value: "External", label: "External" },
            { value: "all", label: "All" },
          ],
    [mayPickInternalScope],
  );

  useEffect(() => {
    if (!mayPickInternalScope && filterDeptKind === "Internal") {
      setFilterDeptKind("External");
    }
  }, [mayPickInternalScope, filterDeptKind]);

  useEffect(() => {
    setFilterResellerId("");
    setFilterParentCompanyId("");
    setDepartmentId("");
    setPoolId("");
  }, [filterDeptKind]);

  useEffect(() => {
    setFilterParentCompanyId("");
    setDepartmentId("");
    setPoolId("");
  }, [filterResellerId]);

  useEffect(() => {
    setDepartmentId("");
    setPoolId("");
  }, [filterParentCompanyId]);

  const poolsQuery = usePoolsListQuery(
    { all: true, ...(departmentId.trim() ? { departmentId: departmentId.trim() } : {}) },
    { enabled: true, scope: "pool-heads-pools" },
  );
  const poolOptions = useMemo(() => {
    const items = extractItems(poolsQuery.data);
    const base = items
      .map((r) => {
        const id = pickStr(r, ["id"]) || "";
        const name = pickStr(r, ["name", "poolName"]) || "";
        if (!id || !name) return null;
        return { value: id, label: name };
      })
      .filter((o): o is { value: string; label: string } => o !== null);
    return [
      {
        value: "",
        label: poolsQuery.isLoading ? "Loading pools…" : "All pools (optional filter)",
      },
      ...base,
    ];
  }, [poolsQuery.data, poolsQuery.isLoading]);

  const assignPoolsQuery = usePoolsListQuery(
    { all: true, ...(assignDepartmentId.trim() ? { departmentId: assignDepartmentId.trim() } : {}) },
    { enabled: assignOpen && Boolean(assignDepartmentId.trim()), scope: "pool-heads-assign-pools" },
  );
  const assignPoolOptions = useMemo(() => {
    const items = extractItems(assignPoolsQuery.data);
    const base = items
      .map((r) => {
        const id = pickStr(r, ["id"]) || "";
        const name = pickStr(r, ["name", "poolName"]) || "";
        if (!id || !name) return null;
        return { value: id, label: name };
      })
      .filter((o): o is { value: string; label: string } => o !== null);
    return [{ value: "", label: assignPoolsQuery.isLoading ? "Loading pools…" : "— Select pool —" }, ...base];
  }, [assignPoolsQuery.data, assignPoolsQuery.isLoading]);

  const assignResellersQuery = useCompaniesSetupResellersQuery({
    enabled: assignOpen && assignUserTypeFilter === "External",
  });
  const assignParentCompaniesQuery = useCompaniesByResellerQuery(
    assignExternalResellerId.trim(),
    { view: "tree", sortBy: "name", sortOrder: "asc", all: true },
    {
      enabled: assignOpen && assignUserTypeFilter === "External" && Boolean(assignExternalResellerId.trim()),
    },
  );
  const assignResellerOptions = useMemo(() => {
    const base = pickItemsArray(assignResellersQuery.data)
      .map(toIdNameOption)
      .filter((o): o is { value: string; label: string } => o !== null);
    return [{ value: "", label: assignResellersQuery.isLoading ? "Loading resellers..." : "— Select reseller —" }, ...base];
  }, [assignResellersQuery.data, assignResellersQuery.isLoading]);
  const assignParentCompanyOptions = useMemo(() => {
    const base = extractParentCompaniesFromByResellerTree(assignParentCompaniesQuery.data);
    return [
      {
        value: "",
        label:
          assignExternalResellerId.trim().length === 0
            ? "Select reseller first"
            : assignParentCompaniesQuery.isLoading
              ? "Loading parent companies..."
              : "— Select parent company —",
      },
      ...base,
    ];
  }, [assignParentCompaniesQuery.data, assignParentCompaniesQuery.isLoading, assignExternalResellerId]);

  const assignInternalDepartmentsQuery = useDepartmentsListQuery(
    assignOpen && assignUserTypeFilter === "Internal" ? { all: true, type: "Internal" } : undefined,
    { enabled: assignOpen && assignUserTypeFilter === "Internal", scope: "pool-heads-assign-int-dept" },
  );
  const assignExternalDepartmentsQuery = useDepartmentsListQuery(
    assignOpen &&
      assignUserTypeFilter === "External" &&
      assignExternalResellerId.trim() &&
      assignExternalParentCompanyId.trim()
      ? {
          all: true,
          type: "External",
          resellerId: assignExternalResellerId.trim(),
          parentCompanyId: assignExternalParentCompanyId.trim(),
        }
      : undefined,
    {
      enabled:
        assignOpen &&
        assignUserTypeFilter === "External" &&
        Boolean(assignExternalResellerId.trim()) &&
        Boolean(assignExternalParentCompanyId.trim()),
      scope: "pool-heads-assign-ext-dept",
    },
  );

  const assignDepartmentOptions = useMemo(() => {
    const source =
      assignUserTypeFilter === "Internal"
        ? assignInternalDepartmentsQuery.data
        : assignExternalDepartmentsQuery.data;
    const loading =
      assignUserTypeFilter === "Internal"
        ? assignInternalDepartmentsQuery.isLoading
        : assignExternalDepartmentsQuery.isLoading;
    const base = pickItemsArray(source)
      .map(toIdNameOption)
      .filter((o): o is { value: string; label: string } => o !== null);
    const prompt =
      assignUserTypeFilter === "External" && !assignExternalParentCompanyId.trim()
        ? "Select parent company first"
        : loading
          ? "Loading departments…"
          : "— Select department —";
    return [{ value: "", label: prompt }, ...base];
  }, [
    assignUserTypeFilter,
    assignInternalDepartmentsQuery.data,
    assignInternalDepartmentsQuery.isLoading,
    assignExternalDepartmentsQuery.data,
    assignExternalDepartmentsQuery.isLoading,
    assignExternalParentCompanyId,
  ]);

  const assignPoolMembersParams = useMemo(
    () => ({
      all: true,
      ...(assignMemberSearchApplied.trim() ? { search: assignMemberSearchApplied.trim() } : {}),
    }),
    [assignMemberSearchApplied],
  );

  const assignPoolMembersQuery = usePoolMembersListQuery(assignPoolId.trim() || undefined, assignPoolMembersParams, {
    enabled: assignOpen && Boolean(assignPoolId.trim()),
    scope: "pool-heads-assign-members",
  });

  const filteredAssignUserRows = useMemo((): AssignPoolMemberRow[] => {
    return extractItems(assignPoolMembersQuery.data)
      .map((r) => {
        const id = pickStr(r, ["id", "userId"]) || "";
        if (!id) return null;
        const poolDept = isRecord(r["pool"]) ? (r["pool"] as Record<string, unknown>) : null;
        const nestedDept =
          poolDept && isRecord(poolDept["department"]) ? (poolDept["department"] as Record<string, unknown>) : null;
        return {
          id,
          user: poolMemberDisplayName(r),
          email: pickStr(r, ["email"]) || "—",
          department:
            pickStr(r, ["poolDepartmentName"]) ||
            pickStr(nestedDept, ["name"]) ||
            pickStr(r, ["departmentName"]) ||
            "—",
        };
      })
      .filter((x): x is AssignPoolMemberRow => x !== null);
  }, [assignPoolMembersQuery.data]);

  const assignUsersLoading = assignPoolMembersQuery.isLoading || assignPoolMembersQuery.isFetching;

  /** Department without pool: fetch all in scope then filter/paginate client-side (API has no departmentId on list). */
  const poolHeadsClientPaging = Boolean(departmentId.trim() && !poolId.trim());

  const listParams = useMemo(() => {
    if (mode !== "heads") return undefined;
    if (poolId.trim()) return { page, limit: PAGE_LIMIT, poolId: poolId.trim(), all: false };
    if (departmentId.trim()) return { all: true };
    return { page, limit: PAGE_LIMIT, all: false };
  }, [mode, page, poolId, departmentId]);

  const listQuery = usePoolHeadsListQuery(listParams, {
    enabled: mode === "heads" && listParams != null,
    scope: "pool-heads-list",
  });

  const attendanceParams = useMemo(() => {
    if (mode !== "attendance") return undefined;
    return {
      page: attendancePage,
      limit: PAGE_LIMIT,
      ...(poolId.trim() ? { poolId: poolId.trim() } : {}),
      ...(attendanceDate.trim() ? { date: attendanceDate.trim() } : {}),
      ...(attendanceMemberName.trim() ? { memberName: attendanceMemberName.trim() } : {}),
    };
  }, [mode, attendancePage, poolId, attendanceDate, attendanceMemberName]);

  const attendanceQuery = usePoolHeadsAttendanceQuery(attendanceParams, {
    enabled: mode === "attendance",
    scope: "pool-heads-attendance",
  });

  const assignMutation = useAssignPoolHeadMutation();
  const removeMutation = useRemovePoolHeadMutation();

  const items = useMemo(() => extractItems(listQuery.data), [listQuery.data]);
  const mappedHeadRows = useMemo(
    () => items.map((r, idx) => mapPoolHeadItem(r, idx)).filter((r): r is PoolHeadRow => r !== null),
    [items],
  );

  const scopedHeadRows = useMemo(() => {
    const d = departmentId.trim();
    if (!d) return mappedHeadRows;
    return mappedHeadRows.filter((r) => r.departmentId === d);
  }, [mappedHeadRows, departmentId]);

  const typedHeadRows = useMemo(() => {
    if (headsUserTypeFilter === "all") return scopedHeadRows;
    return scopedHeadRows.filter((r) => r.userType === headsUserTypeFilter);
  }, [scopedHeadRows, headsUserTypeFilter]);

  const rows = useMemo(() => {
    if (!poolHeadsClientPaging) return typedHeadRows;
    const start = (page - 1) * PAGE_LIMIT;
    return typedHeadRows.slice(start, start + PAGE_LIMIT);
  }, [poolHeadsClientPaging, typedHeadRows, page]);

  const total = useMemo(() => {
    if (poolHeadsClientPaging) return typedHeadRows.length;
    return extractTotal(listQuery.data, typedHeadRows.length);
  }, [poolHeadsClientPaging, typedHeadRows.length, listQuery.data]);

  const pageCount = useMemo(() => {
    if (poolHeadsClientPaging) return Math.max(1, Math.ceil(typedHeadRows.length / PAGE_LIMIT));
    return extractTotalPages(listQuery.data);
  }, [poolHeadsClientPaging, typedHeadRows.length, listQuery.data]);

  const attendanceItems = useMemo(() => extractItems(attendanceQuery.data), [attendanceQuery.data]);
  const attendanceRows = useMemo<AttendanceRow[]>(() => {
    const pick = (row: Record<string, unknown>, keys: string[]) => pickStr(row, keys) || "";
    return attendanceItems.map((row, idx) => {
      const id = pick(row, ["id", "attendanceId"]) || `pha-${idx}`;
      const userNested = isRecord(row["user"]) ? (row["user"] as Record<string, unknown>) : null;
      const employeeName =
        pick(userNested ?? row, ["employeeName", "userName", "name", "firstName"]) || "—";
      const rawType = pickStr(userNested, ["userType", "type"]) || pickStr(row, ["userType", "user_type"]);
      const poolNested = isRecord(row["pool"]) ? (row["pool"] as Record<string, unknown>) : null;
      const userPoolNested =
        userNested && isRecord(userNested["pool"]) ? (userNested["pool"] as Record<string, unknown>) : null;
      const poolDepartment =
        (poolNested && isRecord(poolNested["department"]) ? (poolNested["department"] as Record<string, unknown>) : null) ??
        (userPoolNested && isRecord(userPoolNested["department"])
          ? (userPoolNested["department"] as Record<string, unknown>)
          : null);
      const userType = resolveUserKind(
        rawType,
        pickStr(poolDepartment, ["type"]),
      );
      const poolReseller =
        poolDepartment && isRecord(poolDepartment["reseller"])
          ? (poolDepartment["reseller"] as Record<string, unknown>)
          : null;
      const poolParentCompany =
        poolDepartment && isRecord(poolDepartment["parentCompany"])
          ? (poolDepartment["parentCompany"] as Record<string, unknown>)
          : null;
      const userParentCompany =
        userNested && isRecord(userNested["parentCompany"])
          ? (userNested["parentCompany"] as Record<string, unknown>)
          : null;
      const resellerId = formatScopeId(
        pickStr(row, ["resellerId"]) ||
          pickStr(userNested, ["resellerId"]) ||
          pickStr(poolReseller, ["id"]),
      );
      const resellerName =
        pickStr(row, ["resellerName"]) ||
        pickStr(poolReseller, ["name"]) ||
        "—";
      const parentCompanyId = formatScopeId(
        pickStr(row, ["parentCompanyId", "parent_company_id"]) ||
          pickStr(userNested, ["parentCompanyId", "parent_company_id"]) ||
          pickStr(userParentCompany, ["id"]) ||
          pickStr(poolParentCompany, ["id"]),
      );
      const parentCompanyName =
        pickStr(row, ["parentCompanyName"]) ||
        pickStr(userParentCompany, ["name"]) ||
        pickStr(poolParentCompany, ["name"]) ||
        "—";
      const poolName =
        pick(isRecord(poolNested) ? poolNested : userPoolNested ?? row, ["name", "poolName"]) ||
        pick(row, ["poolName"]) ||
        "—";
      return {
        id,
        employeeName,
        userType,
        resellerId,
        resellerName,
        parentCompanyId,
        parentCompanyName,
        poolName,
        date: pick(row, ["date", "day", "attendanceDate"]) || "—",
        status: pick(row, ["status"]) || "—",
        checkIn: pick(row, ["checkIn", "checkInTime", "inTime"]) || "—",
        checkOut: pick(row, ["checkOut", "checkOutTime", "outTime"]) || "—",
      };
    });
  }, [attendanceItems]);

  const attendanceTotal = useMemo(
    () => extractTotal(attendanceQuery.data, attendanceRows.length),
    [attendanceQuery.data, attendanceRows.length],
  );
  const attendancePageCount = useMemo(() => extractTotalPages(attendanceQuery.data), [attendanceQuery.data]);

  useEffect(() => {
    setPage(1);
    setPoolId("");
    setAttendancePage(1);
    setHeadsUserTypeFilter("all");
  }, [departmentId]);

  useEffect(() => {
    setPage(1);
    setAttendancePage(1);
  }, [poolId]);

  useEffect(() => {
    setPage(1);
  }, [headsUserTypeFilter]);

  useEffect(() => {
    setPage((p) => (p > pageCount ? pageCount : p));
  }, [pageCount]);

  useEffect(() => {
    setAttendancePage((p) => (p > attendancePageCount ? attendancePageCount : p));
  }, [attendancePageCount]);

  useEffect(() => {
    if (!assignUserId.trim()) return;
    if (!filteredAssignUserRows.some((r) => r.id === assignUserId)) setAssignUserId("");
  }, [filteredAssignUserRows, assignUserId]);

  const footerRangeStart = rows.length > 0 ? (page - 1) * PAGE_LIMIT + 1 : 0;
  const footerRangeEnd = (page - 1) * PAGE_LIMIT + rows.length;
  const attendanceFooterStart = attendanceRows.length > 0 ? (attendancePage - 1) * PAGE_LIMIT + 1 : 0;
  const attendanceFooterEnd = (attendancePage - 1) * PAGE_LIMIT + attendanceRows.length;

  const columns = useMemo<DataTableColumn<PoolHeadRow>[]>(
    () => [
      {
        id: "userType",
        label: "Type",
        render: (_v, row) => <UserTypeBadge value={row.userType} />,
      },
      { id: "userName", label: "User" },
      { id: "userEmail", label: "Email" },
      { id: "resellerName", label: "Reseller" },
      { id: "parentCompanyName", label: "Parent company" },
      { id: "departmentName", label: "Department" },
      { id: "designationName", label: "Designation" },
      { id: "poolName", label: "Pool" },
    ],
    [],
  );

  const attendanceColumns = useMemo<DataTableColumn<AttendanceRow>[]>(
    () => [
      {
        id: "userType",
        label: "Type",
        render: (_v, row) => <UserTypeBadge value={row.userType} />,
      },
      { id: "resellerName", label: "Reseller" },
      { id: "parentCompanyName", label: "Parent company" },
      { id: "employeeName", label: "Member" },
      { id: "poolName", label: "Pool" },
      { id: "date", label: "Date (UTC)" },
      { id: "status", label: "Status" },
      { id: "checkIn", label: "Check-in" },
      { id: "checkOut", label: "Check-out" },
    ],
    [],
  );

  const clearPageFilters = useCallback(() => {
    setFilterDeptKind(mayPickInternalScope ? "Internal" : "External");
    setFilterResellerId("");
    setFilterParentCompanyId("");
    setDepartmentId("");
    setPoolId("");
    setPage(1);
    setAttendancePage(1);
    setAttendanceMemberName("");
    setAttendanceDate(today);
    setHeadsUserTypeFilter("all");
    setFilterPanelOpen(false);
  }, [mayPickInternalScope, today]);

  const clearAssignFilters = () => {
    setAssignDepartmentId("");
    setAssignPoolId("");
    setAssignUserId("");
    setAssignUserTypeFilter(mayPickInternalScope ? "Internal" : "External");
    setAssignExternalResellerId("");
    setAssignExternalParentCompanyId("");
    setAssignMemberSearchInput("");
    setAssignMemberSearchApplied("");
  };

  useEffect(() => {
    if (!assignOpen || mayPickInternalScope) return;
    setAssignUserTypeFilter("External");
  }, [assignOpen, mayPickInternalScope]);

  useEffect(() => {
    if (mayPickInternalScope || headsUserTypeFilter !== "Internal")
      return;
    setHeadsUserTypeFilter("all");
  }, [mayPickInternalScope, headsUserTypeFilter]);

  const defaultListFilterDeptKind: "Internal" | "External" | "all" = mayPickInternalScope ? "Internal" : "External";
  const filterToolbarActive =
    filterDeptKind !== defaultListFilterDeptKind ||
    Boolean(filterResellerId.trim()) ||
    Boolean(filterParentCompanyId.trim()) ||
    Boolean(departmentId.trim()) ||
    Boolean(poolId.trim()) ||
    headsUserTypeFilter !== "all" ||
    Boolean(attendanceMemberName.trim()) ||
    attendanceDate !== today;

  const poolHeadsFilterPanel = useMemo(() => {
    return (
      <ToolbarFilterPopoverPanel
        footer={
          <Box
            sx={{
              display: "flex",
              width: "100%",
              flexWrap: "wrap",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 1.5,
            }}
          >
            <Button type="button" variant="secondary" disabled={!filterToolbarActive} onClick={clearPageFilters}>
              Clear filters
            </Button>
            <Button type="button" variant="primary" sx={gradientPrimaryButtonSx} onClick={() => setFilterPanelOpen(false)}>
              Done
            </Button>
          </Box>
        }
      >
        <Typography variant="medium" fontWeight={700} sx={{ color: theme.app.text.primary, mb: 1.5 }}>
          Filters
        </Typography>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "repeat(2, minmax(0, 1fr))" },
            gap: 1.75,
          }}
        >
            <Box sx={{ gridColumn: { md: "1 / -1" } }}>
              <Typography variant="caption" sx={{ display: "block", mb: 0.75, fontWeight: 600, color: theme.app.text.primary }}>
                Department list (API)
              </Typography>
              <SegmentedControl
                options={filterDeptKindSegmentOptions}
                value={filterDeptKind}
                onChange={(v) => setFilterDeptKind(v as "Internal" | "External" | "all")}
                size="small"
              />
              <Typography variant="caption" sx={{ display: "block", mt: 0.75, color: theme.app.dashboard.textMuted }}>
                External loads departments for the selected reseller and parent company only.
              </Typography>
            </Box>
            {filterDeptKind === "External" ? (
              <>
                <SelectField
                  label="Reseller"
                  value={filterResellerId}
                  onChange={setFilterResellerId}
                  options={filterListResellerOptions}
                  menuMaxRows={8}
                />
                <SelectField
                  label="Parent company"
                  value={filterParentCompanyId}
                  onChange={setFilterParentCompanyId}
                  options={filterListParentCompanyOptions}
                  menuMaxRows={8}
                  disabled={!filterResellerId.trim()}
                />
              </>
            ) : null}
            <SelectField
              label="Department"
              value={departmentId}
              onChange={setDepartmentId}
              options={listDepartmentOptions}
              menuMaxRows={8}
              disabled={filterDeptKind === "External" && (!filterResellerId.trim() || !filterParentCompanyId.trim())}
            />
            <SelectField label="Pool" value={poolId} onChange={setPoolId} options={poolOptions} menuMaxRows={12} />
            {mode === "attendance" ? (
              <>
                <Box sx={{ gridColumn: { md: "1 / -1" } }}>
                  <InputField
                    label="Member name / email"
                    placeholder="Filter by name or email…"
                    value={attendanceMemberName}
                    onChange={(e) => setAttendanceMemberName(e.target.value)}
                  />
                </Box>
                <Box sx={{ gridColumn: { md: "1 / -1" } }}>
                  <Calendar label="Date (UTC)" value={attendanceDate} onChange={setAttendanceDate} />
                </Box>
              </>
            ) : null}
          </Box>
          {mode === "heads" ? (
            <Box sx={{ mt: 2, display: "flex", flexWrap: "wrap", alignItems: "center", gap: 2 }}>
              <Typography variant="body2" sx={{ color: theme.app.dashboard.textMuted }}>
                Heads — user type
              </Typography>
              <SegmentedControl
                options={headsUserTypeSegmentOptions}
                value={headsUserTypeFilter}
                onChange={(v) => setHeadsUserTypeFilter(v as "all" | "Internal" | "External")}
              />
            </Box>
          ) : null}
      </ToolbarFilterPopoverPanel>
    );
  }, [
    theme,
    mode,
    filterDeptKind,
    filterResellerId,
    filterParentCompanyId,
    filterDeptKindSegmentOptions,
    filterListResellerOptions,
    filterListParentCompanyOptions,
    departmentId,
    poolId,
    listDepartmentOptions,
    poolOptions,
    attendanceMemberName,
    attendanceDate,
    headsUserTypeFilter,
    headsUserTypeSegmentOptions,
    filterToolbarActive,
    clearPageFilters,
  ]);

  useEffect(() => {
    setFilterPanelOpen(false);
  }, [mode]);

  return (
    <Box sx={[pageWrapper, rolesPageWrapper] as SxProps<Theme>}>
      <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 2, mb: 1 }}>
        <Box>
          <Typography variant="regularLarge" fontWeight={700} color="white">
            Pool Heads
          </Typography>
          <Typography variant="body2" sx={{ mt: 0.75, color: theme.app.dashboard.textMuted, maxWidth: 760 }}>
            Assign pool heads, remove assignments, and view pool team attendance (head plus members) from the HRMS
            APIs.
          </Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap", justifyContent: "flex-end" }}>
          <SegmentedControl
            options={[
              { value: "heads", label: "Heads" },
              { value: "attendance", label: "Team attendance" },
            ]}
            value={mode}
            onChange={(v) => setMode(v as "heads" | "attendance")}
          />
          {mode === "heads" ? (
            <Button
              variant="primary"
              onClick={() => setAssignOpen(true)}
              disabled={assignMutation.isPending || !canAssignPoolHead}
            >
              Assign Pool Head
            </Button>
          ) : null}
        </Box>
      </Box>

      <DashboardCard sx={rolesCard}>
        <Box sx={[departmentsCardHeader, { pb: 1.25 }] as SxProps<Theme>}>
          <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5, minWidth: 0 }}>
            <Box sx={rolesIconBox}>
              {mode === "heads" ? (
                <PersonIcon sx={{ fontSize: 20, color: theme.app.dashboard.white95 }} />
              ) : (
                <AccessTimeIcon sx={{ fontSize: 20, color: theme.app.dashboard.white95 }} />
              )}
            </Box>
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="mediumLarge" fontWeight={600} color="white">
                {mode === "heads" ? "Pool head assignments" : "Pool team attendance"}
              </Typography>
              <Typography variant="body2" sx={{ mt: 0.5, color: theme.app.dashboard.textMuted }}>
                Use Filter to narrow department, pool, and (for attendance) member or date. Heads table can also filter
                by user type.
              </Typography>
            </Box>
          </Box>
          <Box
            sx={
              [
                departmentsSearchRow,
                { justifyContent: "flex-end", width: { xs: "100%", md: "auto" } },
              ] as SxProps<Theme>
            }
          >
            <ToolbarFilterPopover open={filterPanelOpen} onOpenChange={setFilterPanelOpen} active={filterToolbarActive}>
              {poolHeadsFilterPanel}
            </ToolbarFilterPopover>
          </Box>
        </Box>

        {mode === "heads" ? (
          <DataTable<PoolHeadRow>
            columns={columns}
            rows={rows}
            getRowId={(r) => r.id}
            minWidth={1180}
            isLoading={listQuery.isLoading || listQuery.isFetching}
            actionColumn={{
              label: "Action",
              render: (row) => {
                const isDeletingThis = removeMutation.isPending && removeMutation.variables === row.id;
                return (
                  <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                    <IconButton
                      size="small"
                      aria-label="Remove pool head"
                      disabled={!row.id || isDeletingThis || !canRemovePoolHeadRow}
                      onClick={() => {
                        if (!row.id) return;
                        removeMutation.mutate(row.id, {
                          onSuccess: () => publishAppToast({ variant: "success", message: "Removed pool head." }),
                          onError: () => publishAppToast({ variant: "error", message: "Could not remove pool head." }),
                        });
                      }}
                      sx={{ ...dataTableActionButton, color: theme.app.dashboard.accentRedLight }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                );
              },
            }}
          />
        ) : (
          <DataTable<AttendanceRow>
            columns={attendanceColumns}
            rows={attendanceRows}
            getRowId={(r) => r.id}
            minWidth={1180}
            isLoading={attendanceQuery.isLoading || attendanceQuery.isFetching}
          />
        )}

        <Box sx={rolesFooterRow}>
          <Typography variant="medium" sx={footerMutedText(theme)}>
            {mode === "heads"
              ? listQuery.isLoading
                ? "Loading…"
                : `Showing data ${footerRangeStart} to ${footerRangeEnd} of ${total} entries${
                    poolId.trim() ? "" : " (all pools in your access scope when pool is not selected)"
                  }`
              : attendanceQuery.isLoading
                ? "Loading…"
                : `Showing data ${attendanceFooterStart} to ${attendanceFooterEnd} of ${attendanceTotal} entries`}
          </Typography>
          <Box sx={rolesPaginationWrapper}>
            {mode === "heads" ? (
              <TablePagination page={page} pageCount={pageCount} onPageChange={setPage} />
            ) : (
              <TablePagination
                page={attendancePage}
                pageCount={attendancePageCount}
                onPageChange={setAttendancePage}
              />
            )}
          </Box>
        </Box>
      </DashboardCard>

      <FormModal
        open={assignOpen}
        fitContent
        title="Assign pool head"
        description={
          mayPickInternalScope
            ? "Choose user type, department, and pool (all required). Only members of the selected pool are listed. For External, select reseller and parent company first."
            : "External only: reseller, parent company, department, pool, then pick one member from that pool."
        }
        onClose={() => {
          if (assignMutation.isPending) return;
          setAssignOpen(false);
          clearAssignFilters();
        }}
        onSave={() => {
          const pool = assignPoolId.trim();
          const user = assignUserId.trim();
          const dept = assignDepartmentId.trim();
          if (assignUserTypeFilter === "External") {
            if (!assignExternalResellerId.trim() || !assignExternalParentCompanyId.trim()) {
              publishAppToast({
                variant: "error",
                message: "Select reseller and parent company for external users.",
              });
              return;
            }
          }
          if (!dept) {
            publishAppToast({ variant: "error", message: "Please select a department." });
            return;
          }
          if (!pool) {
            publishAppToast({ variant: "error", message: "Please select a pool." });
            return;
          }
          if (!user) {
            publishAppToast({ variant: "error", message: "Please select a user (checkbox)." });
            return;
          }
          assignMutation.mutate(
            {
              poolId: pool,
              userId: user,
            },
            {
              onSuccess: () => {
                publishAppToast({ variant: "success", message: "Pool head assigned." });
                setAssignOpen(false);
                clearAssignFilters();
              },
              onError: () => publishAppToast({ variant: "error", message: "Could not assign pool head." }),
            },
          );
        }}
        primaryButtonDisabled={
          assignMutation.isPending ||
          !canAssignPoolHead ||
          !assignDepartmentId.trim() ||
          !assignPoolId.trim() ||
          !assignUserId.trim() ||
          (assignUserTypeFilter === "External" &&
            (!assignExternalResellerId.trim() || !assignExternalParentCompanyId.trim()))
        }
        primaryButtonLabel={assignMutation.isPending ? "Assigning…" : "Assign"}
        cancelButtonLabel="Close"
        sx={{ borderRadius: 3 }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 1.75,
          }}
        >
          <SelectField
            label="User type"
            options={
              mayPickInternalScope
                ? [
                    { value: "Internal", label: "Internal" },
                    { value: "External", label: "External" },
                  ]
                : [{ value: "External", label: "External" }]
            }
            value={assignUserTypeFilter}
            onChange={(v) => {
              const next = v as "Internal" | "External";
              setAssignUserTypeFilter(next);
              setAssignDepartmentId("");
              setAssignPoolId("");
              setAssignUserId("");
              setAssignMemberSearchInput("");
              setAssignMemberSearchApplied("");
              if (next !== "External") {
                setAssignExternalResellerId("");
                setAssignExternalParentCompanyId("");
              }
            }}
            menuMaxRows={4}
          />

          {assignUserTypeFilter === "External" ? (
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 1.5 }}>
              <SelectField
                label="Reseller"
                value={assignExternalResellerId}
                onChange={(v) => {
                  setAssignExternalResellerId(v);
                  setAssignExternalParentCompanyId("");
                  setAssignDepartmentId("");
                  setAssignPoolId("");
                  setAssignUserId("");
                  setAssignMemberSearchInput("");
                  setAssignMemberSearchApplied("");
                }}
                options={assignResellerOptions}
                menuMaxRows={8}
              />
              <SelectField
                label="Parent company"
                value={assignExternalParentCompanyId}
                onChange={(v) => {
                  setAssignExternalParentCompanyId(v);
                  setAssignDepartmentId("");
                  setAssignPoolId("");
                  setAssignUserId("");
                  setAssignMemberSearchInput("");
                  setAssignMemberSearchApplied("");
                }}
                options={assignParentCompanyOptions}
                searchable
                searchPlaceholder="Search parent company…"
                menuMaxRows={8}
                disabled={!assignExternalResellerId.trim()}
              />
            </Box>
          ) : null}

          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 1.5, alignItems: "end" }}>
            <SelectField
              label="Department"
              value={assignDepartmentId}
              onChange={(v) => {
                setAssignDepartmentId(v);
                setAssignPoolId("");
                setAssignUserId("");
                setAssignMemberSearchInput("");
                setAssignMemberSearchApplied("");
              }}
              options={assignDepartmentOptions}
              searchable
              searchPlaceholder="Search department…"
              menuMaxRows={8}
              disabled={assignUserTypeFilter === "External" && !assignExternalParentCompanyId.trim()}
            />
            <SelectField
              label="Pool"
              value={assignPoolId}
              onChange={(v) => {
                setAssignPoolId(v);
                setAssignUserId("");
                setAssignMemberSearchInput("");
                setAssignMemberSearchApplied("");
              }}
              options={assignPoolOptions}
              searchable
              searchPlaceholder="Search pool…"
              menuMaxRows={12}
              disabled={!assignDepartmentId.trim()}
            />
          </Box>

          <Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mt: 0.5, mb: 1 }}>
              <Box sx={rolesIconBox}>
                <PersonIcon sx={{ fontSize: 20, color: theme.app.dashboard.white95 }} />
              </Box>
              <Box sx={{ minWidth: 0, flex: 1 }}>
                <Typography variant="mediumLarge" fontWeight={600} color="white">
                  Pool members
                </Typography>
                <Typography variant="caption" sx={{ display: "block", color: theme.app.dashboard.textMuted }}>
                  {assignPoolId.trim()
                    ? "Only members of the selected pool. The chosen user becomes pool head (removed from the member roster)."
                    : "Select a pool above to load members."}
                </Typography>
              </Box>
            </Box>
            {assignPoolId.trim() ? (
              <Box sx={[departmentsSearchRow, { mb: 1.25, width: "100%" }] as SxProps<Theme>}>
                <Box sx={[departmentsSearchFieldWrapper, { flex: "1 1 auto", minWidth: 0 }] as SxProps<Theme>}>
                  <SearchBar
                    placeholder="Search name or email…"
                    value={assignMemberSearchInput}
                    onChange={setAssignMemberSearchInput}
                    sx={{ width: "100%" }}
                  />
                </Box>
                <Button
                  type="button"
                  variant="outlined"
                  disabled={assignUsersLoading}
                  onClick={() => {
                    setAssignMemberSearchApplied(assignMemberSearchInput);
                    setAssignUserId("");
                  }}
                  sx={{ minWidth: 96, whiteSpace: "nowrap", alignSelf: { xs: "stretch", sm: "center" } }}
                >
                  Search
                </Button>
              </Box>
            ) : null}
            <TableContainer
              sx={{
                maxHeight: ASSIGN_USER_TABLE_MAX_PX,
                borderRadius: 2,
                border: `1px solid ${theme.app.dashboard.overlayBorder}`,
                bgcolor: theme.app.dashboard.overlayLight,
              }}
            >
              {!assignPoolId.trim() ? (
                <Box sx={{ p: 1.5 }}>
                  <Typography variant="body2" sx={{ color: theme.app.dashboard.textMuted }}>
                    Select a pool to see members you can assign as pool head.
                  </Typography>
                </Box>
              ) : assignUsersLoading ? (
                <Box sx={{ p: 1.5 }}>
                  <Typography variant="body2" sx={{ color: theme.app.dashboard.textMuted }}>
                    Loading pool members…
                  </Typography>
                </Box>
              ) : filteredAssignUserRows.length === 0 ? (
                <Box sx={{ p: 1.5 }}>
                  <Typography variant="body2" sx={{ color: theme.app.dashboard.textMuted }}>
                    {assignMemberSearchApplied.trim()
                      ? "No members match your search. Try another name or email."
                      : "This pool has no members yet. Add members on the Pools page, then assign a pool head."}
                  </Typography>
                </Box>
              ) : (
                <Table size="small" stickyHeader sx={{ minWidth: 480 }}>
                  <TableHead>
                    <TableRow>
                      <TableCell padding="checkbox" sx={{ bgcolor: theme.app.dashboard.overlayLight, width: 48 }} />
                      <TableCell
                        sx={{
                          bgcolor: theme.app.dashboard.overlayLight,
                          color: theme.app.dashboard.textMuted,
                          fontWeight: 600,
                          fontSize: 11,
                          py: 0.75,
                        }}
                      >
                        Member
                      </TableCell>
                      <TableCell
                        sx={{
                          bgcolor: theme.app.dashboard.overlayLight,
                          color: theme.app.dashboard.textMuted,
                          fontWeight: 600,
                          fontSize: 11,
                          py: 0.75,
                        }}
                      >
                        Department
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredAssignUserRows.map((row) => {
                      const checked = assignUserId === row.id;
                      return (
                        <TableRow
                          key={row.id}
                          hover
                          selected={checked}
                          onClick={() => setAssignUserId(checked ? "" : row.id)}
                          sx={{ cursor: "pointer", "& td": { fontSize: 13, py: 0.75 } }}
                        >
                          <TableCell padding="checkbox">
                            <Checkbox
                              size="small"
                              checked={checked}
                              tabIndex={-1}
                              inputProps={{ "aria-label": `Select ${row.user}` }}
                              sx={{
                                color: theme.app.dashboard.textMuted,
                                "&.Mui-checked": { color: "#2dd4bf" },
                                pointerEvents: "none",
                                p: 0,
                              }}
                            />
                          </TableCell>
                          <TableCell sx={{ color: "white" }}>
                            <Typography variant="body2" fontWeight={600} color="white" noWrap>
                              {row.user}
                            </Typography>
                            <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted }} noWrap>
                              {row.email}
                            </Typography>
                          </TableCell>
                          <TableCell
                            sx={{
                              color: theme.app.dashboard.textMuted,
                              maxWidth: 200,
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {row.department}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </TableContainer>
          </Box>
          <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
            <Button variant="outlined" onClick={clearAssignFilters} disabled={assignMutation.isPending}>
              Clear filters
            </Button>
          </Box>
        </Box>
      </FormModal>
    </Box>
  );
}
