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
  SegmentedControl,
  SelectField,
  TablePagination,
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
import { isRecord, pickNum, pickStr, unwrapApiData } from "@/lib/utils";
import {
  useAssignPoolHeadMutation,
  useCompaniesByResellerQuery,
  useCompaniesSetupResellersQuery,
  useDepartmentsListQuery,
  usePoolHeadsAttendanceQuery,
  usePoolHeadsListQuery,
  usePoolsListQuery,
  useRemovePoolHeadMutation,
  useUsersListQuery,
} from "@/lib/hooks/query";
import {
  extractParentCompaniesFromByResellerTree,
  pickItemsArray,
  toIdNameOption,
} from "@/app/dashboard/user-page/components/add-user-modal.utils";
import { extractUsersRows } from "@/app/dashboard/user-page/utils";
import type { UserRow } from "@/app/dashboard/user-page/types";
import { useAuth } from "@/lib/auth";
import { canManagePoolHeads, canRemovePoolHead } from "@/lib/permissions";

const PAGE_LIMIT = 12;
const ASSIGN_USER_TABLE_MAX_PX = 340;

type UserKind = "Internal" | "External" | "—";

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

function hasExistingPoolHeadAssignment(row: Record<string, unknown>): boolean {
  const boolish = (v: unknown) => v === true || v === "true" || v === 1 || v === "1";
  if (
    boolish(row["isPoolHead"]) ||
    boolish(row["hasPoolHead"]) ||
    boolish(row["isHeadPool"])
  ) {
    return true;
  }
  const directIds = [
    "poolHeadId",
    "pool_head_id",
    "headPoolId",
    "head_pool_id",
    "poolHeadAssignmentId",
    "pool_head_assignment_id",
  ];
  if (directIds.some((k) => String(row[k] ?? "").trim().length > 0)) return true;
  const nestedHead = row["poolHead"];
  if (isRecord(nestedHead) && String(nestedHead["id"] ?? "").trim().length > 0) return true;
  return false;
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
  const userType = parseUserKind(rawType);
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
  const { hasOperational } = useAuth();
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

  const [assignOpen, setAssignOpen] = useState(false);
  const [assignDepartmentId, setAssignDepartmentId] = useState("");
  const [assignPoolId, setAssignPoolId] = useState("");
  const [assignUserId, setAssignUserId] = useState("");
  const [assignUserTypeFilter, setAssignUserTypeFilter] = useState<"Internal" | "External">("External");
  const [assignExternalResellerId, setAssignExternalResellerId] = useState("");
  const [assignExternalParentCompanyId, setAssignExternalParentCompanyId] = useState("");

  const departmentsQuery = useDepartmentsListQuery({ all: true }, { enabled: true, scope: "pool-heads" });
  const departmentOptions = useMemo(() => {
    const base = pickItemsArray(departmentsQuery.data)
      .map(toIdNameOption)
      .filter((o): o is { value: string; label: string } => o !== null);
    return [{ value: "", label: departmentsQuery.isLoading ? "Loading departments…" : "— Select department —" }, ...base];
  }, [departmentsQuery.data, departmentsQuery.isLoading]);
  const assignDepartmentOptions = useMemo(() => {
    const base = pickItemsArray(departmentsQuery.data)
      .map(toIdNameOption)
      .filter((o): o is { value: string; label: string } => o !== null);
    return [{ value: "", label: departmentsQuery.isLoading ? "Loading departments…" : "— Select department —" }, ...base];
  }, [departmentsQuery.data, departmentsQuery.isLoading]);

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
    { enabled: assignOpen, scope: "pool-heads-assign-pools" },
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

  const assignUsersQuery = useUsersListQuery(
    assignOpen
      ? {
          all: true,
          userType: assignUserTypeFilter,
          ...(assignUserTypeFilter === "External" && assignExternalResellerId.trim()
            ? { resellerId: assignExternalResellerId.trim() }
            : {}),
          ...(assignUserTypeFilter === "External" && assignExternalParentCompanyId.trim()
            ? { parentCompanyId: assignExternalParentCompanyId.trim() }
            : {}),
          ...(assignDepartmentId.trim() ? { departmentId: assignDepartmentId.trim() } : {}),
          ...(assignPoolId.trim() ? { poolId: assignPoolId.trim() } : {}),
        }
      : undefined,
    {
      enabled:
        assignOpen &&
        (assignUserTypeFilter !== "External" || Boolean(assignExternalParentCompanyId.trim())),
    },
  );

  const filteredAssignUserRows = useMemo((): UserRow[] => extractUsersRows(assignUsersQuery.data), [assignUsersQuery.data]);

  const assignUsersLoading = assignUsersQuery.isLoading || assignUsersQuery.isFetching;

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
      const userType = parseUserKind(rawType);
      const resellerId = formatScopeId(pickStr(row, ["resellerId"]) || pickStr(userNested, ["resellerId"]));
      const poolNested = isRecord(row["pool"]) ? (row["pool"] as Record<string, unknown>) : null;
      const poolDepartment =
        poolNested && isRecord(poolNested["department"]) ? (poolNested["department"] as Record<string, unknown>) : null;
      const poolReseller =
        poolDepartment && isRecord(poolDepartment["reseller"])
          ? (poolDepartment["reseller"] as Record<string, unknown>)
          : null;
      const resellerName =
        pickStr(row, ["resellerName"]) ||
        pickStr(poolReseller, ["name"]) ||
        "—";
      const parentCompanyId = formatScopeId(
        pickStr(row, ["parentCompanyId", "parent_company_id"]) ||
          pickStr(userNested, ["parentCompanyId", "parent_company_id"]),
      );
      const poolName =
        pick(isRecord(poolNested) ? (poolNested as Record<string, unknown>) : row, ["name", "poolName"]) ||
        pick(row, ["poolName"]) ||
        "—";
      return {
        id,
        employeeName,
        userType,
        resellerId,
        resellerName,
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
      { id: "resellerName", label: "Reseller" },
      { id: "parentCompanyName", label: "Parent company" },
      { id: "departmentName", label: "Department" },
      { id: "designationName", label: "Designation" },
      { id: "poolName", label: "Pool" },
      { id: "userName", label: "User" },
      { id: "userEmail", label: "Email" },
    ],
    [],
  );

  const attendanceColumns = useMemo<DataTableColumn<AttendanceRow>[]>(
    () => [
      { id: "resellerName", label: "Reseller" },
      { id: "parentCompanyId", label: "Parent company ID" },
      { id: "employeeName", label: "Member" },
      { id: "poolName", label: "Pool" },
      { id: "date", label: "Date (UTC)" },
      { id: "status", label: "Status" },
      { id: "checkIn", label: "Check-in" },
      { id: "checkOut", label: "Check-out" },
    ],
    [],
  );

  const clearPageFilters = () => {
    setDepartmentId("");
    setPoolId("");
    setPage(1);
    setAttendancePage(1);
    setAttendanceMemberName("");
    setAttendanceDate(today);
    setHeadsUserTypeFilter("all");
  };

  const clearAssignFilters = () => {
    setAssignDepartmentId("");
    setAssignPoolId("");
    setAssignUserId("");
    setAssignUserTypeFilter("External");
  };

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
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box sx={rolesIconBox}>
            <PersonIcon sx={{ fontSize: 20, color: theme.app.dashboard.white95 }} />
          </Box>
          <Typography variant="mediumLarge" fontWeight={600} color="white">
            Filters
          </Typography>
        </Box>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              md:
                mode === "heads"
                  ? "minmax(0,1fr) minmax(0,1fr) 180px"
                  : "minmax(0,1fr) minmax(0,1fr) minmax(0,1fr) minmax(0,1fr) 180px",
            },
            gap: 1.5,
            mt: 2,
            alignItems: "end",
          }}
        >
          <SelectField
            label="Department"
            value={departmentId}
            onChange={setDepartmentId}
            options={departmentOptions}
            menuMaxRows={8}
          />
          <SelectField
            label="Pool"
            value={poolId}
            onChange={setPoolId}
            options={poolOptions}
            menuMaxRows={12}
          />
          {mode === "attendance" ? (
            <>
              <InputField
                label="Member name / email"
                placeholder="Filter by name or email…"
                value={attendanceMemberName}
                onChange={(e) => setAttendanceMemberName(e.target.value)}
              />
              <Calendar label="Date (UTC)" value={attendanceDate} onChange={setAttendanceDate} />
            </>
          ) : null}
          <Button variant="secondary" onClick={clearPageFilters}>
            Clear filters
          </Button>
        </Box>
        {mode === "heads" ? (
          <Box sx={{ mt: 2, display: "flex", flexWrap: "wrap", alignItems: "center", gap: 2 }}>
            <Typography variant="body2" sx={{ color: theme.app.dashboard.textMuted }}>
              Heads — user type
            </Typography>
            <SegmentedControl
              options={[
                { value: "all", label: "All" },
                { value: "Internal", label: "Internal" },
                { value: "External", label: "External" },
              ]}
              value={headsUserTypeFilter}
              onChange={(v) => setHeadsUserTypeFilter(v as "all" | "Internal" | "External")}
            />
          </Box>
        ) : null}
      </DashboardCard>

      <DashboardCard sx={rolesCard}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2, flexWrap: "wrap" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Box sx={rolesIconBox}>
              {mode === "heads" ? (
                <PersonIcon sx={{ fontSize: 20, color: theme.app.dashboard.white95 }} />
              ) : (
                <AccessTimeIcon sx={{ fontSize: 20, color: theme.app.dashboard.white95 }} />
              )}
            </Box>
            <Typography variant="mediumLarge" fontWeight={600} color="white">
              {mode === "heads" ? "Pool head assignments" : "Pool team attendance"}
            </Typography>
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
        description="Select Internal or External first. For External, choose reseller, parent company, then department. Users load from the selected scope."
        onClose={() => {
          if (assignMutation.isPending) return;
          setAssignOpen(false);
        }}
        onSave={() => {
          const pool = assignPoolId.trim();
          const user = assignUserId.trim();
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
          assignMutation.isPending || !canAssignPoolHead || !assignPoolId.trim() || !assignUserId.trim()
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
            label="Department (optional)"
            value={assignDepartmentId}
            onChange={(v) => {
              setAssignDepartmentId(v);
              setAssignPoolId("");
              setAssignUserId("");
            }}
            options={departmentOptions}
            menuMaxRows={8}
          />
          <SelectField
            label="Pool"
            value={assignPoolId}
            onChange={(v) => {
              setAssignPoolId(v);
            }}
            options={assignPoolOptions}
            menuMaxRows={12}
          />
          <Box sx={{ gridColumn: { xs: "auto", sm: "1 / -1" } }}>
            <SelectField
              label="Users — type"
              options={[
                { value: "Internal", label: "Internal" },
                { value: "External", label: "External" },
              ]}
              value={assignUserTypeFilter}
              onChange={(v) => {
                const next = v as "Internal" | "External";
                setAssignUserTypeFilter(next);
                setAssignDepartmentId("");
                setAssignPoolId("");
                setAssignUserId("");
                if (next !== "External") {
                  setAssignExternalResellerId("");
                  setAssignExternalParentCompanyId("");
                }
              }}
            />
          </Box>

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
                }}
                options={assignParentCompanyOptions}
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
              }}
              options={assignDepartmentOptions}
              menuMaxRows={8}
              disabled={assignUserTypeFilter === "External" && !assignExternalParentCompanyId.trim()}
            />
            {assignDepartmentId.trim() ? (
              <SelectField
                label="Pool"
                value={assignPoolId}
                onChange={(v) => {
                  setAssignPoolId(v);
                }}
                options={assignPoolOptions}
                menuMaxRows={12}
              />
            ) : (
              <Box sx={{ display: "flex", alignItems: "center", minHeight: 56 }}>
                <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted }}>
                  Select department to load pools.
                </Typography>
              </Box>
            )}
          </Box>

          <Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mt: 0.5, mb: 1 }}>
              <Box sx={rolesIconBox}>
                <PersonIcon sx={{ fontSize: 20, color: theme.app.dashboard.white95 }} />
              </Box>
              <Box>
                <Typography variant="mediumLarge" fontWeight={600} color="white">
                  User List
                </Typography>
                <Typography variant="caption" sx={{ display: "block", color: theme.app.dashboard.textMuted }}>
                  Department narrows pools. Click a row to select one user (POST body: poolId, userId).
                </Typography>
              </Box>
            </Box>
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
                    No users for this filter. Try another type or department.
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
