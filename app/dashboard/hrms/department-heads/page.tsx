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
import type { SxProps, Theme } from "@mui/material/styles";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import {
  Button,
  Calendar,
  DashboardCard,
  DataTable,
  FormModal,
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
  useAssignDepartmentHeadMutation,
  useDepartmentHeadsAttendanceQuery,
  useDepartmentHeadsListQuery,
  useDepartmentsListQuery,
  usePoolsListQuery,
  useRemoveDepartmentHeadMutation,
  useUsersListQuery,
} from "@/lib/hooks/query";
import { pickItemsArray, toIdNameOption } from "@/app/dashboard/user-page/components/add-user-modal.utils";
import { extractUsersRows } from "@/app/dashboard/user-page/utils";
import type { UserRow } from "@/app/dashboard/user-page/types";
import { useAuth } from "@/lib/auth";
import { canManageDepartmentHeads, canRemoveDepartmentHead } from "@/lib/permissions";

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
  const { hasOperational } = useAuth();
  const canAssignDeptHead = canManageDepartmentHeads(hasOperational);
  const canRemoveDeptHeadRow = canRemoveDepartmentHead(hasOperational);
  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);

  const [mode, setMode] = useState<"heads" | "attendance">("heads");
  const [departmentId, setDepartmentId] = useState("");
  const [page, setPage] = useState(1);
  const [headsUserTypeFilter, setHeadsUserTypeFilter] = useState<"all" | "Internal" | "External">("all");

  const [assignOpen, setAssignOpen] = useState(false);
  const [assignUserId, setAssignUserId] = useState("");
  const [assignUserTypeFilter, setAssignUserTypeFilter] = useState<"all" | "Internal" | "External">("all");

  const [attendancePoolId, setAttendancePoolId] = useState("");
  const [attendanceDate, setAttendanceDate] = useState(today);
  const [attendancePage, setAttendancePage] = useState(1);

  const departmentsQuery = useDepartmentsListQuery({ all: true }, { enabled: true, scope: "department-heads" });
  const departmentOptions = useMemo(() => {
    const base = pickItemsArray(departmentsQuery.data)
      .map(toIdNameOption)
      .filter((o): o is { value: string; label: string } => o !== null);
    return [{ value: "", label: departmentsQuery.isLoading ? "Loading departments…" : "— Select department —" }, ...base];
  }, [departmentsQuery.data, departmentsQuery.isLoading]);

  const poolsQuery = usePoolsListQuery(
    departmentId.trim() ? { departmentId: departmentId.trim(), all: true } : undefined,
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

  const assignDept = departmentId.trim();

  const assignInternalUsersQuery = useUsersListQuery(
    assignOpen && assignDept
      ? { all: true, userType: "Internal", departmentId: assignDept }
      : undefined,
    { enabled: assignOpen && Boolean(assignDept) },
  );
  const assignExternalUsersQuery = useUsersListQuery(
    assignOpen && assignDept
      ? { all: true, userType: "External", departmentId: assignDept }
      : undefined,
    { enabled: assignOpen && Boolean(assignDept) },
  );

  const mergedAssignUserRows = useMemo((): UserRow[] => {
    const int = extractUsersRows(assignInternalUsersQuery.data);
    const ext = extractUsersRows(assignExternalUsersQuery.data);
    const map = new Map<string, UserRow>();
    for (const r of int) map.set(r.id, r);
    for (const r of ext) map.set(r.id, r);
    return Array.from(map.values());
  }, [assignInternalUsersQuery.data, assignExternalUsersQuery.data]);

  const filteredAssignUserRows = useMemo(() => {
    if (assignUserTypeFilter === "all") return mergedAssignUserRows;
    return mergedAssignUserRows.filter((r) => r.type === assignUserTypeFilter);
  }, [mergedAssignUserRows, assignUserTypeFilter]);

  const assignUsersLoading =
    assignInternalUsersQuery.isLoading ||
    assignInternalUsersQuery.isFetching ||
    assignExternalUsersQuery.isLoading ||
    assignExternalUsersQuery.isFetching;

  const headsQuery = useDepartmentHeadsListQuery(
    departmentId.trim() ? { departmentId: departmentId.trim(), all: true } : undefined,
    { enabled: Boolean(departmentId.trim()), scope: "department-heads-list" },
  );

  const assignMutation = useAssignDepartmentHeadMutation();
  const removeMutation = useRemoveDepartmentHeadMutation();

  const headItems = useMemo(() => extractItems(headsQuery.data), [headsQuery.data]);
  const mappedHeadRows = useMemo(
    () => headItems.map((r, idx) => mapDepartmentHeadItem(r, idx)).filter((r): r is HeadRow => r !== null),
    [headItems],
  );

  const typedHeadRows = useMemo(() => {
    if (headsUserTypeFilter === "all") return mappedHeadRows;
    return mappedHeadRows.filter((r) => r.userType === headsUserTypeFilter);
  }, [mappedHeadRows, headsUserTypeFilter]);

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
    [theme],
  );

  const attendanceQuery = useDepartmentHeadsAttendanceQuery(
    departmentId.trim()
      ? {
          departmentId: departmentId.trim(),
          ...(attendancePoolId.trim() ? { poolId: attendancePoolId.trim() } : {}),
          ...(attendanceDate.trim() ? { date: attendanceDate.trim() } : {}),
          page: attendancePage,
          limit: PAGE_LIMIT,
        }
      : undefined,
    { enabled: mode === "attendance", scope: "department-heads-attendance" },
  );

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
    setHeadsUserTypeFilter("all");
  }, [departmentId]);

  useEffect(() => {
    setPage(1);
  }, [headsUserTypeFilter]);

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

  const footerRangeStart = headRowsPaged.length > 0 ? (page - 1) * PAGE_LIMIT + 1 : 0;
  const footerRangeEnd = (page - 1) * PAGE_LIMIT + headRowsPaged.length;
  const attendanceFooterStart = attendanceRows.length > 0 ? (attendancePage - 1) * PAGE_LIMIT + 1 : 0;
  const attendanceFooterEnd = (attendancePage - 1) * PAGE_LIMIT + attendanceRows.length;

  const clearAssignModal = () => {
    setAssignUserId("");
    setAssignUserTypeFilter("all");
  };

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
              onClick={() => setAssignOpen(true)}
              disabled={!departmentId.trim() || !canAssignDeptHead || assignMutation.isPending}
            >
              Assign head
            </Button>
          ) : null}
        </Box>
      </Box>

      <DashboardCard sx={rolesCard}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2, flexWrap: "wrap" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Box sx={rolesIconBox}>
              <PersonIcon sx={{ fontSize: 20, color: theme.app.dashboard.white95 }} />
            </Box>
            <Typography variant="mediumLarge" fontWeight={600} color="white">
              Filters
            </Typography>
          </Box>
        </Box>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              md: mode === "heads" ? "minmax(0,1fr)" : "minmax(0,1fr) minmax(0,1fr) minmax(0,1fr) 180px",
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

          {mode === "attendance" ? (
            <>
              <SelectField
                label="Pool (optional)"
                value={attendancePoolId}
                onChange={setAttendancePoolId}
                options={poolOptions}
                menuMaxRows={8}
                disabled={!departmentId.trim()}
              />
              <Calendar label="Date (UTC)" value={attendanceDate} onChange={setAttendanceDate} />
              <Button
                variant="secondary"
                disabled={!departmentId.trim()}
                onClick={() => {
                  if (!departmentId.trim()) {
                    publishAppToast({ variant: "error", message: "Select a department first." });
                    return;
                  }
                  publishAppToast({ variant: "success", message: "Attendance filters are applied to the table." });
                }}
              >
                Apply
              </Button>
            </>
          ) : null}
        </Box>
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
              {mode === "heads" ? "Department head assignments" : "Department attendance"}
            </Typography>
          </Box>
        </Box>

        {mode === "heads" && departmentId.trim() ? (
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

        {!departmentId.trim() && mode === "heads" ? (
          <Typography variant="body2" sx={{ mt: 2, color: theme.app.dashboard.textMuted }}>
            Select a department to load heads (GET /hrms/department-heads with departmentId and all=true).
          </Typography>
        ) : mode === "heads" ? (
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
        ) : !departmentId.trim() ? (
          <Typography variant="body2" sx={{ mt: 2, color: theme.app.dashboard.textMuted }}>
            Select a department to load attendance (GET /hrms/department-heads/attendance).
          </Typography>
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
              ? !departmentId.trim()
                ? "—"
                : headsQuery.isLoading
                  ? "Loading…"
                  : `Showing data ${footerRangeStart} to ${footerRangeEnd} of ${headsTotal} entries`
              : !departmentId.trim()
                ? "—"
                : attendanceQuery.isLoading
                  ? "Loading…"
                  : `Showing data ${attendanceFooterStart} to ${attendanceFooterEnd} of ${attendanceTotal} entries`}
          </Typography>
          <Box sx={rolesPaginationWrapper}>
            {mode === "heads" && departmentId.trim() ? (
              <TablePagination page={page} pageCount={headsPageCount} onPageChange={setPage} />
            ) : mode === "attendance" && departmentId.trim() ? (
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
        description="User must be in the selected department on the server. Choose Internal / External and pick one user."
        onClose={() => {
          if (assignMutation.isPending) return;
          setAssignOpen(false);
          clearAssignModal();
        }}
        onSave={() => {
          const dept = departmentId.trim();
          const user = assignUserId.trim();
          if (!dept) {
            publishAppToast({ variant: "error", message: "Select a department on the page first." });
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
        primaryButtonDisabled={assignMutation.isPending || !canAssignDeptHead || !departmentId.trim() || !assignUserId.trim()}
        primaryButtonLabel={assignMutation.isPending ? "Assigning…" : "Assign"}
        cancelButtonLabel="Close"
        sx={{ borderRadius: 3 }}
      >
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          {!departmentId.trim() ? (
            <Typography variant="body2" sx={{ color: theme.app.dashboard.textMuted }}>
              Close this dialog, select a department above, then open Assign again.
            </Typography>
          ) : (
            <>
              <SelectField
                label="Users — type"
                value={assignUserTypeFilter}
                onChange={(v) => setAssignUserTypeFilter(v as "all" | "Internal" | "External")}
                options={[
                  { value: "all", label: "Internal + External" },
                  { value: "Internal", label: "Internal only" },
                  { value: "External", label: "External only" },
                ]}
                menuMaxRows={4}
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
          )}
        </Box>
      </FormModal>
    </Box>
  );
}
