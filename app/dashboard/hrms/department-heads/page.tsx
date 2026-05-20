"use client";

import { useEffect, useMemo, useState } from "react";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Checkbox from "@mui/material/Checkbox";
import IconButton from "@mui/material/IconButton";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import { Person as PersonIcon, Delete as DeleteIcon, AccessTime as AccessTimeIcon } from "@mui/icons-material";
import { useTheme, type SxProps, type Theme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import {
  Button,
  Calendar,
  DashboardCard,
  DataTable,
  FormModal,
  SearchBar,
  SegmentedControl,
  SelectField,
  TablePagination,
  ToolbarFilterPopover,
  ToolbarFilterPopoverPanel,
  Typography,
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
  useAssignDepartmentHeadMutation,
  useCompaniesByResellerQuery,
  useCompaniesSetupResellersQuery,
  useDepartmentHeadsAttendanceQuery,
  useDepartmentHeadsListQuery,
  useDepartmentsListQuery,
  usePoolsListQuery,
  useRemoveDepartmentHeadMutation,
  useUsersListQuery,
} from "@/lib/hooks/query";
import {
  extractParentCompaniesFromByResellerTree,
  pickItemsArray,
  toIdNameOption,
} from "@/app/dashboard/user-page/components/add-user-modal.utils";
import { extractUsersRows } from "@/app/dashboard/user-page/utils";
import { useAuth, sessionMayPickInternalUserScope } from "@/lib/auth";
import { canManageDepartmentHeads, canRemoveDepartmentHead } from "@/lib/permissions";
import { SearchIcon } from "@/components/common/icons";
import { gradientPrimaryButtonSx } from "@/components/common/Button/Button.styles";
import {
  departmentsCardHeader,
  departmentsSearchFieldWrapper,
  departmentsSearchRow,
} from "@/app/dashboard/website-assigning/website-assigning.styles";

const PAGE_LIMIT = 12;
const ASSIGN_USER_TABLE_MAX_PX = 340;

type UserKind = "Internal" | "External" | "—";

type HeadRow = {
  id: string;
  userName: string;
  userEmail: string;
  userType: UserKind;
  parentCompanyName: string;
  departmentId: string;
  departmentName: string;
};

type AttendanceRow = {
  id: string;
  employeeName: string;
  userType: UserKind;
  resellerId: string;
  parentCompanyId: string;
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

function parseUserKind(raw: string | undefined): UserKind {
  const t = (raw ?? "").trim();
  if (t === "Internal" || t === "External") return t;
  return "—";
}

function mapDepartmentHeadItem(r: Record<string, unknown>, idx: number): HeadRow | null {
  const assignmentId = pickStr(r, ["id"]) || "";
  const user = isRecord(r["user"]) ? (r["user"] as Record<string, unknown>) : null;
  const dept = isRecord(r["department"]) ? (r["department"] as Record<string, unknown>) : null;
  const deptParentCompany =
    dept && isRecord(dept["parentCompany"]) ? (dept["parentCompany"] as Record<string, unknown>) : null;
  const firstName = pickStr(user, ["firstName", "first_name"]) || "";
  const lastName = pickStr(user, ["lastName", "last_name"]) || "";
  const joinedName = `${firstName} ${lastName}`.replace(/\s+/g, " ").trim();
  const name = joinedName || pickStr(r, ["userName"]) || pickStr(user, ["name", "fullName", "userName"]) || "—";
  const email = pickStr(user, ["email"]) || pickStr(r, ["userEmail", "email"]) || "—";
  const userType = parseUserKind(pickStr(user, ["userType", "type"]) || pickStr(r, ["userType", "user_type"]));
  const parentCompanyName =
    pickStr(r, ["parentCompanyName"]) ||
    pickStr(deptParentCompany, ["name"]) ||
    "—";
  const departmentId = pickStr(dept, ["id"]) || pickStr(r, ["departmentId"]) || "";
  const departmentName = pickStr(dept, ["name"]) || pickStr(r, ["departmentName"]) || "—";
  const id = assignmentId || `dh-${idx}`;
  if (!id) return null;
  return { id, userName: name, userEmail: email, userType, parentCompanyName, departmentId, departmentName };
}

export default function DepartmentHeadsPage() {
  const theme = useTheme() as AppTheme;
  const { hasOperational, isPlatformAdmin, user: authUser } = useAuth();

  const headsFilterUserTypeOptions = useMemo(
    () =>
      sessionMayPickInternalUserScope(isPlatformAdmin, authUser?.userType)
        ? [
            { value: "Internal", label: "Internal" },
            { value: "External", label: "External" },
          ]
        : [{ value: "External", label: "External" }],
    [isPlatformAdmin, authUser?.userType],
  );
  const mayPickInternalScope = sessionMayPickInternalUserScope(isPlatformAdmin, authUser?.userType);
  const canAssignDeptHead = canManageDepartmentHeads(hasOperational);
  const canRemoveDeptHeadRow = canRemoveDepartmentHead(hasOperational);
  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);

  const [mode, setMode] = useState<"heads" | "attendance">("heads");
  const [departmentId, setDepartmentId] = useState("");
  const [page, setPage] = useState(1);
  const [headsUserTypeFilter, setHeadsUserTypeFilter] = useState<"Internal" | "External">("Internal");
  const [headsResellerId, setHeadsResellerId] = useState("");
  const [headsParentCompanyId, setHeadsParentCompanyId] = useState("");
  const [headsDepartmentId, setHeadsDepartmentId] = useState("");
  const [headsSearch, setHeadsSearch] = useState("");
  const [headsFiltersApplied, setHeadsFiltersApplied] = useState(false);
  const [appliedHeadsUserTypeFilter, setAppliedHeadsUserTypeFilter] = useState<"Internal" | "External" | null>(null);
  const [appliedHeadsResellerId, setAppliedHeadsResellerId] = useState("");
  const [appliedHeadsParentCompanyId, setAppliedHeadsParentCompanyId] = useState("");
  const [appliedHeadsDepartmentId, setAppliedHeadsDepartmentId] = useState("");
  const [appliedHeadsSearch, setAppliedHeadsSearch] = useState("");

  const [assignOpen, setAssignOpen] = useState(false);
  const [assignDepartmentId, setAssignDepartmentId] = useState("");
  const [assignUserId, setAssignUserId] = useState("");
  const [assignUserTypeFilter, setAssignUserTypeFilter] = useState<"Internal" | "External">("External");
  const [assignResellerId, setAssignResellerId] = useState("");
  const [assignParentCompanyId, setAssignParentCompanyId] = useState("");

  const [attendancePoolId, setAttendancePoolId] = useState("");
  const [attendanceDate, setAttendanceDate] = useState(today);
  const [attendancePage, setAttendancePage] = useState(1);
  const [filterPanelOpen, setFilterPanelOpen] = useState(false);
  /** Attendance tab: department dropdown API slice (Internal / External / All). */
  const [attendanceDeptKind, setAttendanceDeptKind] = useState<"Internal" | "External" | "all">(() =>
    mayPickInternalScope ? "Internal" : "External",
  );
  const [attendanceFilterResellerId, setAttendanceFilterResellerId] = useState("");
  const [attendanceFilterParentCompanyId, setAttendanceFilterParentCompanyId] = useState("");

  const attendanceAllDeptsQuery = useDepartmentsListQuery(
    mode === "attendance" && attendanceDeptKind === "all" ? { all: true } : undefined,
    { enabled: mode === "attendance" && attendanceDeptKind === "all", scope: "department-heads-attn-all-dept" },
  );
  const attendanceInternalDeptsQuery = useDepartmentsListQuery(
    mode === "attendance" && attendanceDeptKind === "Internal" ? { all: true, type: "Internal" } : undefined,
    { enabled: mode === "attendance" && attendanceDeptKind === "Internal", scope: "department-heads-attn-int-dept" },
  );
  const attendanceFilterResellersQuery = useCompaniesSetupResellersQuery({
    enabled: mode === "attendance" && attendanceDeptKind === "External",
  });
  const attendanceFilterParentCompaniesQuery = useCompaniesByResellerQuery(
    attendanceFilterResellerId.trim(),
    { view: "tree", sortBy: "name", sortOrder: "asc", all: true },
    {
      enabled:
        mode === "attendance" &&
        attendanceDeptKind === "External" &&
        Boolean(attendanceFilterResellerId.trim()),
    },
  );
  const attendanceExternalDeptsQuery = useDepartmentsListQuery(
    mode === "attendance" &&
      attendanceDeptKind === "External" &&
      attendanceFilterResellerId.trim() &&
      attendanceFilterParentCompanyId.trim()
      ? {
          all: true,
          type: "External",
          resellerId: attendanceFilterResellerId.trim(),
          parentCompanyId: attendanceFilterParentCompanyId.trim(),
        }
      : undefined,
    {
      enabled:
        mode === "attendance" &&
        attendanceDeptKind === "External" &&
        Boolean(attendanceFilterResellerId.trim()) &&
        Boolean(attendanceFilterParentCompanyId.trim()),
      scope: "department-heads-attn-ext-dept",
    },
  );

  const attendanceDeptKindSegmentOptions = useMemo(
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

  const attendanceFilterResellerOptions = useMemo(() => {
    const base = pickItemsArray(attendanceFilterResellersQuery.data)
      .map(toIdNameOption)
      .filter((o): o is { value: string; label: string } => o !== null);
    return [
      { value: "", label: attendanceFilterResellersQuery.isLoading ? "Loading resellers…" : "— Select reseller —" },
      ...base,
    ];
  }, [attendanceFilterResellersQuery.data, attendanceFilterResellersQuery.isLoading]);

  const attendanceFilterParentCompanyOptions = useMemo(() => {
    const base = extractParentCompaniesFromByResellerTree(attendanceFilterParentCompaniesQuery.data);
    return [
      {
        value: "",
        label:
          !attendanceFilterResellerId.trim()
            ? "Select reseller first"
            : attendanceFilterParentCompaniesQuery.isLoading
              ? "Loading parent companies…"
              : "— Select parent company —",
      },
      ...base,
    ];
  }, [attendanceFilterParentCompaniesQuery.data, attendanceFilterParentCompaniesQuery.isLoading, attendanceFilterResellerId]);

  const attendanceDepartmentOptions = useMemo(() => {
    if (attendanceDeptKind === "all") {
      const base = pickItemsArray(attendanceAllDeptsQuery.data)
        .map(toIdNameOption)
        .filter((o): o is { value: string; label: string } => o !== null);
      return [{ value: "", label: attendanceAllDeptsQuery.isLoading ? "Loading departments…" : "— Select department —" }, ...base];
    }
    if (attendanceDeptKind === "Internal") {
      const base = pickItemsArray(attendanceInternalDeptsQuery.data)
        .map(toIdNameOption)
        .filter((o): o is { value: string; label: string } => o !== null);
      return [
        { value: "", label: attendanceInternalDeptsQuery.isLoading ? "Loading departments…" : "— Select department —" },
        ...base,
      ];
    }
    const loading = attendanceExternalDeptsQuery.isLoading;
    const base = pickItemsArray(attendanceExternalDeptsQuery.data)
      .map(toIdNameOption)
      .filter((o): o is { value: string; label: string } => o !== null);
    const prompt =
      !attendanceFilterResellerId.trim() || !attendanceFilterParentCompanyId.trim()
        ? "Select reseller and parent company first"
        : loading
          ? "Loading departments…"
          : "— Select department —";
    return [{ value: "", label: prompt }, ...base];
  }, [
    attendanceDeptKind,
    attendanceAllDeptsQuery.data,
    attendanceAllDeptsQuery.isLoading,
    attendanceInternalDeptsQuery.data,
    attendanceInternalDeptsQuery.isLoading,
    attendanceExternalDeptsQuery.data,
    attendanceExternalDeptsQuery.isLoading,
    attendanceFilterResellerId,
    attendanceFilterParentCompanyId,
  ]);

  useEffect(() => {
    if (!mayPickInternalScope && attendanceDeptKind === "Internal") {
      setAttendanceDeptKind("External");
    }
  }, [mayPickInternalScope, attendanceDeptKind]);

  useEffect(() => {
    setAttendanceFilterResellerId("");
    setAttendanceFilterParentCompanyId("");
    setDepartmentId("");
    setAttendancePoolId("");
  }, [attendanceDeptKind]);

  useEffect(() => {
    setAttendanceFilterParentCompanyId("");
    setDepartmentId("");
    setAttendancePoolId("");
  }, [attendanceFilterResellerId]);

  useEffect(() => {
    setDepartmentId("");
    setAttendancePoolId("");
  }, [attendanceFilterParentCompanyId]);

  const headsInternalDepartmentsQuery = useDepartmentsListQuery(
    mode === "heads" && headsUserTypeFilter === "Internal" ? { all: true, type: "Internal" } : undefined,
    { enabled: mode === "heads" && headsUserTypeFilter === "Internal", scope: "department-heads-filter-internal-departments" },
  );
  const headsResellersQuery = useCompaniesSetupResellersQuery({
    enabled: mode === "heads" && headsUserTypeFilter === "External",
  });
  const headsParentCompaniesQuery = useCompaniesByResellerQuery(
    headsResellerId.trim(),
    { view: "tree", sortBy: "name", sortOrder: "asc", all: true },
    { enabled: mode === "heads" && headsUserTypeFilter === "External" && Boolean(headsResellerId.trim()) },
  );
  const headsExternalDepartmentsQuery = useDepartmentsListQuery(
    mode === "heads" && headsUserTypeFilter === "External" && headsResellerId.trim() && headsParentCompanyId.trim()
      ? {
          all: true,
          type: "External",
          resellerId: headsResellerId.trim(),
          parentCompanyId: headsParentCompanyId.trim(),
        }
      : undefined,
    {
      enabled:
        mode === "heads" &&
        headsUserTypeFilter === "External" &&
        Boolean(headsResellerId.trim()) &&
        Boolean(headsParentCompanyId.trim()),
      scope: "department-heads-filter-external-departments",
    },
  );
  const headsResellerOptions = useMemo(() => {
    const base = pickItemsArray(headsResellersQuery.data)
      .map(toIdNameOption)
      .filter((o): o is { value: string; label: string } => o !== null);
    return [{ value: "", label: headsResellersQuery.isLoading ? "Loading resellers..." : "— Select reseller —" }, ...base];
  }, [headsResellersQuery.data, headsResellersQuery.isLoading]);
  const headsParentCompanyOptions = useMemo(() => {
    const base = extractParentCompaniesFromByResellerTree(headsParentCompaniesQuery.data);
    return [
      {
        value: "",
        label:
          headsResellerId.trim().length === 0
            ? "Select reseller first"
            : headsParentCompaniesQuery.isLoading
              ? "Loading parent companies..."
              : "— Select parent company —",
      },
      ...base,
    ];
  }, [headsParentCompaniesQuery.data, headsParentCompaniesQuery.isLoading, headsResellerId]);
  const headsDepartmentOptions = useMemo(() => {
    const source = headsUserTypeFilter === "Internal" ? headsInternalDepartmentsQuery.data : headsExternalDepartmentsQuery.data;
    const loading =
      headsUserTypeFilter === "Internal" ? headsInternalDepartmentsQuery.isLoading : headsExternalDepartmentsQuery.isLoading;
    const base = pickItemsArray(source)
      .map(toIdNameOption)
      .filter((o): o is { value: string; label: string } => o !== null);
    const prompt =
      headsUserTypeFilter === "External" && !headsParentCompanyId.trim()
        ? "Select parent company first"
        : loading
          ? "Loading departments..."
          : "— Select department —";
    return [{ value: "", label: prompt }, ...base];
  }, [
    headsUserTypeFilter,
    headsInternalDepartmentsQuery.data,
    headsInternalDepartmentsQuery.isLoading,
    headsExternalDepartmentsQuery.data,
    headsExternalDepartmentsQuery.isLoading,
    headsParentCompanyId,
  ]);

  const poolsQuery = usePoolsListQuery(
    { all: true, ...(departmentId.trim() ? { departmentId: departmentId.trim() } : {}) },
    { enabled: true, scope: "department-heads-attendance-pools" },
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
    return [{ value: "", label: poolsQuery.isLoading ? "Loading pools…" : "All pools" }, ...base];
  }, [poolsQuery.data, poolsQuery.isLoading]);

  const assignInternalDepartmentsQuery = useDepartmentsListQuery(
    assignOpen && assignUserTypeFilter === "Internal" ? { all: true, type: "Internal" } : undefined,
    { enabled: assignOpen && assignUserTypeFilter === "Internal", scope: "department-heads-assign-internal-departments" },
  );
  const assignResellersQuery = useCompaniesSetupResellersQuery({
    enabled: assignOpen && assignUserTypeFilter === "External",
  });
  const assignParentCompaniesQuery = useCompaniesByResellerQuery(
    assignResellerId.trim(),
    { view: "tree", sortBy: "name", sortOrder: "asc", all: true },
    { enabled: assignOpen && assignUserTypeFilter === "External" && Boolean(assignResellerId.trim()) },
  );
  const assignExternalDepartmentsQuery = useDepartmentsListQuery(
    assignOpen && assignUserTypeFilter === "External" && assignResellerId.trim() && assignParentCompanyId.trim()
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
        assignUserTypeFilter === "External" &&
        Boolean(assignResellerId.trim()) &&
        Boolean(assignParentCompanyId.trim()),
      scope: "department-heads-assign-external-departments",
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
          assignResellerId.trim().length === 0
            ? "Select reseller first"
            : assignParentCompaniesQuery.isLoading
              ? "Loading parent companies..."
              : "— Select parent company —",
      },
      ...base,
    ];
  }, [assignParentCompaniesQuery.data, assignParentCompaniesQuery.isLoading, assignResellerId]);
  const assignDepartmentOptions = useMemo(() => {
    const source = assignUserTypeFilter === "Internal" ? assignInternalDepartmentsQuery.data : assignExternalDepartmentsQuery.data;
    const loading =
      assignUserTypeFilter === "Internal"
        ? assignInternalDepartmentsQuery.isLoading
        : assignExternalDepartmentsQuery.isLoading;
    const base = pickItemsArray(source)
      .map(toIdNameOption)
      .filter((o): o is { value: string; label: string } => o !== null);
    const prompt =
      assignUserTypeFilter === "External" && !assignParentCompanyId.trim()
        ? "Select parent company first"
        : loading
          ? "Loading departments..."
          : "— Select department —";
    return [{ value: "", label: prompt }, ...base];
  }, [
    assignUserTypeFilter,
    assignInternalDepartmentsQuery.data,
    assignInternalDepartmentsQuery.isLoading,
    assignExternalDepartmentsQuery.data,
    assignExternalDepartmentsQuery.isLoading,
    assignParentCompanyId,
  ]);
  const assignUsersQuery = useUsersListQuery(
    assignOpen
      ? {
          all: true,
          userType: assignUserTypeFilter,
          ...(assignDepartmentId.trim() ? { departmentId: assignDepartmentId.trim() } : {}),
          ...(assignUserTypeFilter === "External" && assignParentCompanyId.trim()
            ? { parentCompanyId: assignParentCompanyId.trim() }
            : {}),
        }
      : undefined,
    {
      enabled:
        assignOpen &&
        Boolean(assignDepartmentId.trim()) &&
        (assignUserTypeFilter === "Internal" ||
          (Boolean(assignResellerId.trim()) && Boolean(assignParentCompanyId.trim()))),
    },
  );
  const filteredAssignUserRows = useMemo(
    () =>
      extractUsersRows(assignUsersQuery.data).filter((row) =>
        assignUserTypeFilter === "External"
          ? row.parentCompanyId === assignParentCompanyId.trim()
          : true,
      ),
    [assignUsersQuery.data, assignUserTypeFilter, assignParentCompanyId],
  );
  const assignUsersLoading = assignUsersQuery.isLoading || assignUsersQuery.isFetching;

  const headsParams = (
    headsFiltersApplied || appliedHeadsSearch.trim()
      ? {
          all: true,
          ...(headsFiltersApplied && appliedHeadsUserTypeFilter ? { type: appliedHeadsUserTypeFilter } : {}),
          ...(headsFiltersApplied && appliedHeadsResellerId.trim() ? { resellerId: appliedHeadsResellerId.trim() } : {}),
          ...(headsFiltersApplied && appliedHeadsParentCompanyId.trim() ? { parentCompanyId: appliedHeadsParentCompanyId.trim() } : {}),
          ...(headsFiltersApplied && appliedHeadsDepartmentId.trim() ? { departmentId: appliedHeadsDepartmentId.trim() } : {}),
          ...(appliedHeadsSearch.trim() ? { search: appliedHeadsSearch.trim() } : {}),
        }
      : { all: true }
  ) as Parameters<typeof useDepartmentHeadsListQuery>[0];
  const headsQuery = useDepartmentHeadsListQuery(headsParams, {
    enabled: mode === "heads",
    scope: "department-heads-list",
  });

  const assignMutation = useAssignDepartmentHeadMutation();
  const removeMutation = useRemoveDepartmentHeadMutation();

  const headItems = useMemo(() => extractItems(headsQuery.data), [headsQuery.data]);
  const mappedHeadRows = useMemo(
    () => headItems.map((r, idx) => mapDepartmentHeadItem(r, idx)).filter((r): r is HeadRow => r !== null),
    [headItems],
  );

  const typedHeadRows = useMemo(() => mappedHeadRows, [mappedHeadRows]);

  const headRowsPaged = useMemo(() => {
    const start = (page - 1) * PAGE_LIMIT;
    return typedHeadRows.slice(start, start + PAGE_LIMIT);
  }, [typedHeadRows, page]);

  const headsTotal = typedHeadRows.length;
  const headsPageCount = Math.max(1, Math.ceil(typedHeadRows.length / PAGE_LIMIT));

  const headsColumns = useMemo<DataTableColumn<HeadRow>[]>(
    () => [
      { id: "departmentName", label: "Department" },
      { id: "parentCompanyName", label: "Parent company" },
      { id: "userName", label: "User" },
      { id: "userEmail", label: "Email" },
    ],
    [],
  );

  const attendanceParams = (
    departmentId.trim()
      ? {
          departmentId: departmentId.trim(),
          ...(attendancePoolId.trim() ? { poolId: attendancePoolId.trim() } : {}),
          ...(attendanceDate.trim() ? { date: attendanceDate.trim() } : {}),
          page: attendancePage,
          limit: PAGE_LIMIT,
        }
      : {
          page: attendancePage,
          limit: PAGE_LIMIT,
          ...(attendancePoolId.trim() ? { poolId: attendancePoolId.trim() } : {}),
          ...(attendanceDate.trim() ? { date: attendanceDate.trim() } : {}),
        }
  ) as Parameters<typeof useDepartmentHeadsAttendanceQuery>[0];
  const attendanceQuery = useDepartmentHeadsAttendanceQuery(attendanceParams, {
    enabled: mode === "attendance",
    scope: "department-heads-attendance",
  });

  const attendanceItems = useMemo(() => extractItems(attendanceQuery.data), [attendanceQuery.data]);
  const attendanceRows = useMemo<AttendanceRow[]>(() => {
    const pick = (row: Record<string, unknown>, keys: string[]) => pickStr(row, keys) || "";
    return attendanceItems.map((row, idx) => {
      const id = pick(row, ["id", "attendanceId"]) || `dha-${idx}`;
      const userNested = isRecord(row["user"]) ? (row["user"] as Record<string, unknown>) : null;
      const employeeName =
        pick(userNested ?? row, ["employeeName", "userName", "name", "firstName"]) || "—";
      const rawType = pickStr(userNested, ["userType", "type"]) || pickStr(row, ["userType", "user_type"]);
      const userType = parseUserKind(rawType);
      const resellerId = formatScopeId(pickStr(row, ["resellerId"]) || pickStr(userNested, ["resellerId"]));
      const parentCompanyId = formatScopeId(
        pickStr(row, ["parentCompanyId", "parent_company_id"]) ||
          pickStr(userNested, ["parentCompanyId", "parent_company_id"]),
      );
      const poolNested = row["pool"];
      const poolName =
        pick(isRecord(poolNested) ? (poolNested as Record<string, unknown>) : row, ["name", "poolName"]) ||
        pick(row, ["poolName"]) ||
        "—";
      return {
        id,
        employeeName,
        userType,
        resellerId,
        parentCompanyId,
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

  const attendanceColumns = useMemo<DataTableColumn<AttendanceRow>[]>(
    () => [
      {
        id: "userType",
        label: "Type",
        render: (_v, row) =>
          row.userType === "—" ? (
            <Typography variant="body2" sx={{ color: theme.app.dashboard.textMuted }}>
              —
            </Typography>
          ) : (
            <Chip
              size="small"
              label={row.userType}
              color={row.userType === "Internal" ? "primary" : "secondary"}
              variant="outlined"
              sx={{ borderColor: "rgba(255,255,255,0.35)" }}
            />
          ),
      },
      { id: "resellerId", label: "Reseller ID" },
      { id: "parentCompanyId", label: "Parent company ID" },
      { id: "employeeName", label: "Employee" },
      { id: "poolName", label: "Pool" },
      { id: "date", label: "Date (UTC)" },
      { id: "status", label: "Status" },
      { id: "checkIn", label: "Check-in" },
      { id: "checkOut", label: "Check-out" },
    ],
    [theme],
  );

  useEffect(() => {
    setPage(1);
    setAttendancePage(1);
    setAssignUserId("");
    setAttendancePoolId("");
  }, [departmentId]);

  useEffect(() => {
    setHeadsDepartmentId("");
    if (headsUserTypeFilter === "Internal") {
      setHeadsResellerId("");
      setHeadsParentCompanyId("");
    }
  }, [headsUserTypeFilter]);

  useEffect(() => {
    setHeadsParentCompanyId("");
    setHeadsDepartmentId("");
  }, [headsResellerId]);

  useEffect(() => {
    setHeadsDepartmentId("");
  }, [headsParentCompanyId]);

  useEffect(() => {
    setPage(1);
  }, [
    headsFiltersApplied,
    appliedHeadsUserTypeFilter,
    appliedHeadsResellerId,
    appliedHeadsParentCompanyId,
    appliedHeadsDepartmentId,
    appliedHeadsSearch,
  ]);

  useEffect(() => {
    setPage((p) => (p > headsPageCount ? headsPageCount : p));
  }, [headsPageCount]);

  useEffect(() => {
    setAttendancePage((p) => (p > attendancePageCount ? attendancePageCount : p));
  }, [attendancePageCount]);

  useEffect(() => {
    if (!assignUserId.trim()) return;
    if (!filteredAssignUserRows.some((r) => r.id === assignUserId)) setAssignUserId("");
  }, [filteredAssignUserRows, assignUserId]);

  useEffect(() => {
    setAssignDepartmentId("");
    setAssignUserId("");
    if (assignUserTypeFilter === "Internal") {
      setAssignResellerId("");
      setAssignParentCompanyId("");
    }
  }, [assignUserTypeFilter]);

  useEffect(() => {
    setAssignParentCompanyId("");
    setAssignDepartmentId("");
    setAssignUserId("");
  }, [assignResellerId]);

  useEffect(() => {
    setAssignDepartmentId("");
    setAssignUserId("");
  }, [assignParentCompanyId]);

  const footerRangeStart = headRowsPaged.length > 0 ? (page - 1) * PAGE_LIMIT + 1 : 0;
  const footerRangeEnd = (page - 1) * PAGE_LIMIT + headRowsPaged.length;
  const attendanceFooterStart = attendanceRows.length > 0 ? (attendancePage - 1) * PAGE_LIMIT + 1 : 0;
  const attendanceFooterEnd = (attendancePage - 1) * PAGE_LIMIT + attendanceRows.length;

  const clearAssignModal = () => {
    setAssignDepartmentId("");
    setAssignUserId("");
    setAssignUserTypeFilter("External");
    setAssignResellerId("");
    setAssignParentCompanyId("");
  };

  useEffect(() => {
    if (!assignOpen || sessionMayPickInternalUserScope(isPlatformAdmin, authUser?.userType)) return;
    setAssignUserTypeFilter("External");
  }, [assignOpen, isPlatformAdmin, authUser?.userType]);

  useEffect(() => {
    if (sessionMayPickInternalUserScope(isPlatformAdmin, authUser?.userType) || headsUserTypeFilter !== "Internal")
      return;
    setHeadsUserTypeFilter("External");
    setHeadsResellerId("");
    setHeadsParentCompanyId("");
    setHeadsDepartmentId("");
  }, [isPlatformAdmin, authUser?.userType, headsUserTypeFilter]);

  const applyHeadsFilters = () => {
    setAppliedHeadsUserTypeFilter(headsUserTypeFilter);
    setAppliedHeadsResellerId(headsResellerId.trim());
    setAppliedHeadsParentCompanyId(headsParentCompanyId.trim());
    setAppliedHeadsDepartmentId(headsDepartmentId.trim());
    setHeadsFiltersApplied(true);
    setFilterPanelOpen(false);
  };

  const clearHeadsFilters = () => {
    setHeadsUserTypeFilter(
      sessionMayPickInternalUserScope(isPlatformAdmin, authUser?.userType) ? "Internal" : "External",
    );
    setHeadsResellerId("");
    setHeadsParentCompanyId("");
    setHeadsDepartmentId("");
    setHeadsSearch("");
    setAppliedHeadsUserTypeFilter(null);
    setAppliedHeadsResellerId("");
    setAppliedHeadsParentCompanyId("");
    setAppliedHeadsDepartmentId("");
    setHeadsFiltersApplied(false);
    setFilterPanelOpen(false);
  };

  const applyHeadsSearch = () => {
    setAppliedHeadsSearch(headsSearch.trim());
  };

  const handleHeadsSearchChange = (value: string) => {
    setHeadsSearch(value);
    if (value.trim().length === 0) {
      // Search clear (X button) should reset to full department-heads data.
      setAppliedHeadsSearch("");
      setAppliedHeadsUserTypeFilter(null);
      setAppliedHeadsResellerId("");
      setAppliedHeadsParentCompanyId("");
      setAppliedHeadsDepartmentId("");
      setHeadsFiltersApplied(false);
    }
  };

  const defaultHeadsUserTypeForActive: "Internal" | "External" = mayPickInternalScope ? "Internal" : "External";
  const headsListFiltersActive =
    mode === "heads" &&
    (headsFiltersApplied ||
      Boolean(appliedHeadsSearch.trim()) ||
      headsUserTypeFilter !== defaultHeadsUserTypeForActive ||
      Boolean(headsResellerId.trim()) ||
      Boolean(headsParentCompanyId.trim()) ||
      Boolean(headsDepartmentId.trim()));
  const defaultAttendanceDeptKind: "Internal" | "External" | "all" = mayPickInternalScope ? "Internal" : "External";
  const attendanceListFiltersActive =
    mode === "attendance" &&
    (Boolean(departmentId.trim()) ||
      Boolean(attendancePoolId.trim()) ||
      attendanceDate !== today ||
      attendanceDeptKind !== defaultAttendanceDeptKind ||
      Boolean(attendanceFilterResellerId.trim()) ||
      Boolean(attendanceFilterParentCompanyId.trim()));
  const filterToolbarActive = headsListFiltersActive || attendanceListFiltersActive;

  const canClearHeadsDraft =
    headsFiltersApplied ||
    headsUserTypeFilter !== defaultHeadsUserTypeForActive ||
    Boolean(headsResellerId.trim()) ||
    Boolean(headsParentCompanyId.trim()) ||
    Boolean(headsDepartmentId.trim()) ||
    Boolean(headsSearch.trim());

  const clearAttendanceListFilters = () => {
    setDepartmentId("");
    setAttendancePoolId("");
    setAttendanceDate(today);
    setAttendancePage(1);
    setAttendanceDeptKind(mayPickInternalScope ? "Internal" : "External");
    setAttendanceFilterResellerId("");
    setAttendanceFilterParentCompanyId("");
    setFilterPanelOpen(false);
  };

  const canClearAttendanceDraft =
    Boolean(departmentId.trim()) ||
    Boolean(attendancePoolId.trim()) ||
    attendanceDate !== today ||
    attendanceDeptKind !== defaultAttendanceDeptKind ||
    Boolean(attendanceFilterResellerId.trim()) ||
    Boolean(attendanceFilterParentCompanyId.trim());

  const departmentHeadsFilterPanel = useMemo(() => {
    return (
      <ToolbarFilterPopoverPanel
        footer={
          <Box
            sx={{
              display: "flex",
              width: "100%",
              flexDirection: { xs: "column", md: "row" },
              alignItems: { md: "center" },
              justifyContent: { md: "space-between" },
              gap: 1.5,
            }}
          >
            {mode === "heads" ? (
              <>
                <Button type="button" variant="secondary" disabled={!canClearHeadsDraft} onClick={clearHeadsFilters}>
                  Clear filters
                </Button>
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: { xs: "column", sm: "row" },
                    gap: 1.5,
                    width: { md: "auto" },
                    flex: { md: "1 1 auto" },
                    justifyContent: "flex-end",
                  }}
                >
                  <Button type="button" variant="secondary" onClick={applyHeadsFilters}>
                    Apply
                  </Button>
                  <Button type="button" variant="primary" sx={gradientPrimaryButtonSx} onClick={() => setFilterPanelOpen(false)}>
                    Done
                  </Button>
                </Box>
              </>
            ) : (
              <>
                <Button type="button" variant="secondary" disabled={!canClearAttendanceDraft} onClick={clearAttendanceListFilters}>
                  Clear filters
                </Button>
                <Button type="button" variant="primary" sx={gradientPrimaryButtonSx} onClick={() => setFilterPanelOpen(false)}>
                  Done
                </Button>
              </>
            )}
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
            {mode === "heads" ? (
              <>
                <SelectField
                  label="Users — type"
                  value={headsUserTypeFilter}
                  onChange={(v) => setHeadsUserTypeFilter(v as "Internal" | "External")}
                  options={headsFilterUserTypeOptions}
                  menuMaxRows={4}
                />
                {headsUserTypeFilter === "External" ? (
                  <>
                    <SelectField
                      label="Reseller"
                      value={headsResellerId}
                      onChange={setHeadsResellerId}
                      options={headsResellerOptions}
                      menuMaxRows={8}
                    />
                    <SelectField
                      label="Parent company"
                      value={headsParentCompanyId}
                      onChange={setHeadsParentCompanyId}
                      options={headsParentCompanyOptions}
                      menuMaxRows={8}
                      disabled={!headsResellerId.trim()}
                    />
                  </>
                ) : null}
                <Box sx={{ gridColumn: { md: headsUserTypeFilter === "External" ? "1 / -1" : undefined } }}>
                  <SelectField
                    label="Department"
                    value={headsDepartmentId}
                    onChange={setHeadsDepartmentId}
                    options={headsDepartmentOptions}
                    menuMaxRows={8}
                    disabled={headsUserTypeFilter === "External" && !headsParentCompanyId.trim()}
                  />
                </Box>
              </>
            ) : (
              <>
                <Box sx={{ gridColumn: { md: "1 / -1" } }}>
                  <Typography variant="caption" sx={{ display: "block", mb: 0.75, fontWeight: 600, color: theme.app.text.primary }}>
                    Department list (API)
                  </Typography>
                  <SegmentedControl
                    options={attendanceDeptKindSegmentOptions}
                    value={attendanceDeptKind}
                    onChange={(v) => setAttendanceDeptKind(v as "Internal" | "External" | "all")}
                    size="small"
                  />
                </Box>
                {attendanceDeptKind === "External" ? (
                  <>
                    <SelectField
                      label="Reseller"
                      value={attendanceFilterResellerId}
                      onChange={setAttendanceFilterResellerId}
                      options={attendanceFilterResellerOptions}
                      menuMaxRows={8}
                    />
                    <SelectField
                      label="Parent company"
                      value={attendanceFilterParentCompanyId}
                      onChange={setAttendanceFilterParentCompanyId}
                      options={attendanceFilterParentCompanyOptions}
                      menuMaxRows={8}
                      disabled={!attendanceFilterResellerId.trim()}
                    />
                  </>
                ) : null}
                <SelectField
                  label="Department"
                  value={departmentId}
                  onChange={setDepartmentId}
                  options={attendanceDepartmentOptions}
                  menuMaxRows={8}
                  disabled={
                    attendanceDeptKind === "External" &&
                    (!attendanceFilterResellerId.trim() || !attendanceFilterParentCompanyId.trim())
                  }
                />
                <SelectField
                  label="Pool (optional)"
                  value={attendancePoolId}
                  onChange={setAttendancePoolId}
                  options={poolOptions}
                  menuMaxRows={8}
                />
                <Box sx={{ gridColumn: { md: "1 / -1" } }}>
                  <Calendar label="Date (UTC)" value={attendanceDate} onChange={setAttendanceDate} />
                </Box>
              </>
            )}
        </Box>
      </ToolbarFilterPopoverPanel>
    );
  }, [
    theme,
    mode,
    headsUserTypeFilter,
    headsResellerId,
    headsParentCompanyId,
    headsDepartmentId,
    headsFilterUserTypeOptions,
    headsResellerOptions,
    headsParentCompanyOptions,
    headsDepartmentOptions,
    departmentId,
    attendanceDeptKind,
    attendanceFilterResellerId,
    attendanceFilterParentCompanyId,
    attendanceDeptKindSegmentOptions,
    attendanceFilterResellerOptions,
    attendanceFilterParentCompanyOptions,
    attendanceDepartmentOptions,
    attendancePoolId,
    attendanceDate,
    poolOptions,
    canClearHeadsDraft,
    canClearAttendanceDraft,
    today,
  ]);

  useEffect(() => {
    setFilterPanelOpen(false);
  }, [mode]);

  return (
    <Box sx={[pageWrapper, rolesPageWrapper] as SxProps<Theme>}>
      <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 2, mb: 1 }}>
        <Box>
          <Typography variant="regularLarge" fontWeight={700} color="white">
            Department Heads
          </Typography>
          <Typography variant="body2" sx={{ mt: 0.75, color: theme.app.dashboard.textMuted, maxWidth: 760 }}>
            Assign and manage department heads (Internal / External). View attendance across pools in a department.
          </Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap", justifyContent: "flex-end" }}>
          <SegmentedControl
            options={[
              { value: "heads", label: "Heads" },
              { value: "attendance", label: "Attendance" },
            ]}
            value={mode}
            onChange={(v) => setMode(v as "heads" | "attendance")}
          />
          {mode === "heads" ? (
            <Button
              variant="primary"
              onClick={() => {
                setAssignDepartmentId(headsDepartmentId.trim());
                setAssignOpen(true);
              }}
              disabled={!canAssignDeptHead || assignMutation.isPending}
            >
              Assign head
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
                {mode === "heads" ? "Department head assignments" : "Department attendance"}
              </Typography>
              <Typography variant="body2" sx={{ mt: 0.5, color: theme.app.dashboard.textMuted }}>
                {mode === "heads"
                  ? "Use Filter for list scope (user type, reseller, company, department). Search applies after you press Search."
                  : "Use Filter: pick Internal / External / All for departments API, then department and optional pool."}
              </Typography>
            </Box>
          </Box>
          {mode === "heads" ? (
            <Box sx={departmentsSearchRow}>
              <Box sx={departmentsSearchFieldWrapper}>
                <SearchBar
                  placeholder="Name, email, department, reseller..."
                  value={headsSearch}
                  onChange={handleHeadsSearchChange}
                  sx={{ width: "100%" }}
                />
              </Box>
              <Button
                type="button"
                variant="primary"
                disabled={headsSearch.trim() === appliedHeadsSearch.trim()}
                onClick={applyHeadsSearch}
                sx={{ minWidth: 120, whiteSpace: "nowrap", alignSelf: { xs: "stretch", sm: "center" } }}
              >
                <Box component="span" sx={{ display: "inline-flex", lineHeight: 0 }}>
                  <SearchIcon width={18} height={18} sx={{ color: "inherit" }} />
                </Box>
                Search
              </Button>
              <ToolbarFilterPopover open={filterPanelOpen} onOpenChange={setFilterPanelOpen} active={filterToolbarActive}>
                {departmentHeadsFilterPanel}
              </ToolbarFilterPopover>
            </Box>
          ) : (
            <Box
              sx={
                [
                  departmentsSearchRow,
                  { justifyContent: "flex-end", width: { xs: "100%", md: "auto" } },
                ] as SxProps<Theme>
              }
            >
              <ToolbarFilterPopover open={filterPanelOpen} onOpenChange={setFilterPanelOpen} active={filterToolbarActive}>
                {departmentHeadsFilterPanel}
              </ToolbarFilterPopover>
            </Box>
          )}
        </Box>

        {mode === "heads" ? (
          <DataTable<HeadRow>
            columns={headsColumns}
            rows={headRowsPaged}
            getRowId={(r) => r.id}
            minWidth={1020}
            isLoading={headsQuery.isLoading || headsQuery.isFetching}
            actionColumn={{
              label: "Action",
              render: (row) => {
                const isDeletingThis = removeMutation.isPending && removeMutation.variables === row.id;
                return (
                  <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                    <IconButton
                      size="small"
                      aria-label="Remove department head"
                      disabled={!row.id || isDeletingThis || !canRemoveDeptHeadRow}
                      onClick={() => {
                        if (!row.id) return;
                        removeMutation.mutate(row.id, {
                          onSuccess: () => publishAppToast({ variant: "success", message: "Removed department head." }),
                          onError: () => publishAppToast({ variant: "error", message: "Could not remove department head." }),
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
              ? headsQuery.isLoading
                ? "Loading…"
                : `Showing data ${footerRangeStart} to ${footerRangeEnd} of ${headsTotal} entries`
              : attendanceQuery.isLoading
                ? "Loading…"
                : `Showing data ${attendanceFooterStart} to ${attendanceFooterEnd} of ${attendanceTotal} entries`}
          </Typography>
          <Box sx={rolesPaginationWrapper}>
            {mode === "heads" ? (
              <TablePagination page={page} pageCount={headsPageCount} onPageChange={setPage} />
            ) : mode === "attendance" ? (
              <TablePagination
                page={attendancePage}
                pageCount={attendancePageCount}
                onPageChange={setAttendancePage}
              />
            ) : null}
          </Box>
        </Box>
      </DashboardCard>

      <FormModal
        open={assignOpen}
        fitContent
        title="Assign department head"
        description={
          sessionMayPickInternalUserScope(isPlatformAdmin, authUser?.userType)
            ? "User must be in the selected department on the server. Choose Internal / External and pick one user."
            : "User must be in the selected department on the server. External users only — choose reseller and parent company, then department, then pick one user."
        }
        onClose={() => {
          if (assignMutation.isPending) return;
          setAssignOpen(false);
          clearAssignModal();
        }}
        onSave={() => {
          const dept = assignDepartmentId.trim();
          const user = assignUserId.trim();
          if (!dept) {
            publishAppToast({ variant: "error", message: "Select a department in the assign dialog." });
            return;
          }
          if (!user) {
            publishAppToast({ variant: "error", message: "Select a user from the list." });
            return;
          }
          assignMutation.mutate(
            { departmentId: dept, userId: user },
            {
              onSuccess: () => {
                publishAppToast({ variant: "success", message: "Department head assigned." });
                setAssignOpen(false);
                clearAssignModal();
              },
              onError: () => publishAppToast({ variant: "error", message: "Could not assign department head." }),
            },
          );
        }}
        primaryButtonDisabled={assignMutation.isPending || !canAssignDeptHead || !assignDepartmentId.trim() || !assignUserId.trim()}
        primaryButtonLabel={assignMutation.isPending ? "Assigning…" : "Assign"}
        cancelButtonLabel="Close"
        sx={{ borderRadius: 3 }}
      >
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          <>
            <SelectField
              label="Users — type"
              value={assignUserTypeFilter}
              onChange={(v) => setAssignUserTypeFilter(v as "Internal" | "External")}
              options={
                sessionMayPickInternalUserScope(isPlatformAdmin, authUser?.userType)
                  ? [
                      { value: "Internal", label: "Internal" },
                      { value: "External", label: "External" },
                    ]
                  : [{ value: "External", label: "External" }]
              }
              menuMaxRows={4}
            />
            {assignUserTypeFilter === "External" ? (
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
                  menuMaxRows={8}
                  disabled={!assignResellerId.trim()}
                />
              </>
            ) : null}
            <SelectField
              label="Department"
              value={assignDepartmentId}
              onChange={(v) => {
                setAssignDepartmentId(v);
                setAssignUserId("");
              }}
              options={assignDepartmentOptions}
              menuMaxRows={8}
              disabled={assignUserTypeFilter === "External" && !assignParentCompanyId.trim()}
            />
              <TableContainer
                sx={{
                  maxHeight: ASSIGN_USER_TABLE_MAX_PX,
                  borderRadius: 2,
                  border: `1px solid ${theme.app.dashboard.overlayBorder}`,
                  bgcolor: theme.app.dashboard.overlayLight,
                }}
              >
                {assignUsersLoading ? (
                  <Box sx={{ p: 1.5 }}>
                    <Typography variant="body2" sx={{ color: theme.app.dashboard.textMuted }}>
                      Loading users…
                    </Typography>
                  </Box>
                ) : filteredAssignUserRows.length === 0 ? (
                  <Box sx={{ p: 1.5 }}>
                    <Typography variant="body2" sx={{ color: theme.app.dashboard.textMuted }}>
                      No users for this filter.
                    </Typography>
                  </Box>
                ) : (
                  <Table size="small" stickyHeader sx={{ minWidth: 720 }}>
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
                          Type
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
                          User
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
                        <TableCell
                          sx={{
                            bgcolor: theme.app.dashboard.overlayLight,
                            color: theme.app.dashboard.textMuted,
                            fontWeight: 600,
                            fontSize: 11,
                            py: 0.75,
                          }}
                        >
                          Reseller ID
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
                          Parent co. ID
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
                            <TableCell sx={{ verticalAlign: "middle" }}>
                              <Chip
                                size="small"
                                label={row.type}
                                color={row.type === "Internal" ? "primary" : "secondary"}
                                variant="outlined"
                                sx={{ borderColor: "rgba(255,255,255,0.35)" }}
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
                            <TableCell sx={{ color: theme.app.dashboard.textMuted, maxWidth: 160 }}>{row.department}</TableCell>
                            <TableCell sx={{ color: theme.app.dashboard.textMuted, maxWidth: 120, fontSize: 11 }}>
                              <Typography variant="caption" noWrap component="span" display="block">
                                {row.resellerId ?? "—"}
                              </Typography>
                            </TableCell>
                            <TableCell sx={{ color: theme.app.dashboard.textMuted, maxWidth: 120, fontSize: 11 }}>
                              <Typography variant="caption" noWrap component="span" display="block">
                                {row.parentCompanyId ?? "—"}
                              </Typography>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                )}
              </TableContainer>
            <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
              <Button variant="outlined" onClick={clearAssignModal} disabled={assignMutation.isPending}>
                Clear selection
              </Button>
            </Box>
          </>
        </Box>
      </FormModal>
    </Box>
  );
}
