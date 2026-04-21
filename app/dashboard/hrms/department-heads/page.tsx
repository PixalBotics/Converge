"use client";

import { useEffect, useMemo, useState } from "react";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import { Person as PersonIcon, Delete as DeleteIcon, AccessTime as AccessTimeIcon } from "@mui/icons-material";
import type { SxProps, Theme } from "@mui/material/styles";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import {
  Button,
  Calendar,
  DashboardCard,
  DataTable,
  SegmentedControl,
  SelectField,
  TablePagination,
  Typography,
  dataTableActionButton,
} from "@/components/common";
import type { DataTableColumn } from "@/components/common";
import { rolesCard, rolesFooterRow, rolesIconBox, rolesPageWrapper, rolesPaginationWrapper } from "../../roles/roles.styles";
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
import { useAuth } from "@/lib/auth";
import { canManageDepartmentHeads, canRemoveDepartmentHead } from "@/lib/permissions";

const PAGE_LIMIT = 12;

type HeadRow = {
  id: string;
  userName: string;
  userEmail: string;
  departmentName: string;
};

type AttendanceRow = {
  id: string;
  employeeName: string;
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

export default function DepartmentHeadsPage() {
  const theme = useTheme() as AppTheme;
  const { hasOperational } = useAuth();
  const canAssignDeptHead = canManageDepartmentHeads(hasOperational);
  const canRemoveDeptHeadRow = canRemoveDepartmentHead(hasOperational);
  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);

  const [mode, setMode] = useState<"heads" | "attendance">("heads");
  const [departmentId, setDepartmentId] = useState("");
  const [selectedUserId, setSelectedUserId] = useState("");
  const [page, setPage] = useState(1);

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

  const usersQuery = useUsersListQuery(
    departmentId.trim() ? { all: true, limit: 200, departmentId: departmentId.trim() } : undefined,
    { enabled: Boolean(departmentId.trim()) },
  );
  const userOptions = useMemo(() => {
    const payload = unwrapApiData(usersQuery.data);
    const users = Array.isArray(payload) ? payload.filter(isRecord) : extractItems(usersQuery.data);
    const base = users
      .map((u) => {
        const id = pickStr(u, ["id"]) || "";
        const name = pickStr(u, ["name", "fullName", "userName"]) || "—";
        const email = pickStr(u, ["email"]) || "";
        if (!id) return null;
        return { value: id, label: email ? `${name} · ${email}` : name };
      })
      .filter((o): o is { value: string; label: string } => o !== null);
    return [{ value: "", label: usersQuery.isLoading ? "Loading users…" : "— Select user —" }, ...base];
  }, [usersQuery.data, usersQuery.isLoading]);

  const headsQuery = useDepartmentHeadsListQuery(
    departmentId.trim()
      ? { departmentId: departmentId.trim(), page, limit: PAGE_LIMIT }
      : undefined,
    { enabled: true, scope: "department-heads-list" },
  );

  const assignMutation = useAssignDepartmentHeadMutation();
  const removeMutation = useRemoveDepartmentHeadMutation();

  const headItems = useMemo(() => extractItems(headsQuery.data), [headsQuery.data]);
  const headRows = useMemo<HeadRow[]>(() => {
    return headItems
      .map((r, idx) => {
        const assignmentId = pickStr(r, ["id"]) || "";
        const user = isRecord(r["user"]) ? (r["user"] as Record<string, unknown>) : null;
        const dept = isRecord(r["department"]) ? (r["department"] as Record<string, unknown>) : null;
        const name = pickStr(user, ["name", "fullName", "userName"]) || pickStr(r, ["userName", "name"]) || "—";
        const email = pickStr(user, ["email"]) || pickStr(r, ["userEmail", "email"]) || "—";
        const departmentName = pickStr(dept, ["name"]) || pickStr(r, ["departmentName"]) || "—";
        const id = assignmentId || `dh-${idx}`;
        return { id, userName: name, userEmail: email, departmentName };
      })
      .filter((r) => r.id);
  }, [headItems]);

  const headsTotal = useMemo(() => extractTotal(headsQuery.data, headRows.length), [headsQuery.data, headRows.length]);
  const headsPageCount = useMemo(() => extractTotalPages(headsQuery.data), [headsQuery.data]);

  const headsColumns = useMemo<DataTableColumn<HeadRow>[]>(
    () => [
      { id: "userName", label: "Head" },
      { id: "userEmail", label: "Email" },
      { id: "departmentName", label: "Department" },
    ],
    [],
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
      const employeeName = pick(row, ["employeeName", "userName", "name"]) || "—";
      const poolNested = row["pool"];
      const poolName =
        pick(isRecord(poolNested) ? (poolNested as Record<string, unknown>) : row, ["name", "poolName"]) ||
        pick(row, ["poolName"]) ||
        "—";
      return {
        id,
        employeeName,
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
      { id: "employeeName", label: "Employee" },
      { id: "poolName", label: "Pool" },
      { id: "date", label: "Date" },
      { id: "status", label: "Status" },
      { id: "checkIn", label: "Check-in" },
      { id: "checkOut", label: "Check-out" },
    ],
    [],
  );

  useEffect(() => {
    setPage(1);
    setAttendancePage(1);
    setSelectedUserId("");
    setAttendancePoolId("");
  }, [departmentId]);

  useEffect(() => {
    setPage((p) => (p > headsPageCount ? headsPageCount : p));
  }, [headsPageCount]);

  useEffect(() => {
    setAttendancePage((p) => (p > attendancePageCount ? attendancePageCount : p));
  }, [attendancePageCount]);

  const footerRangeStart = headRows.length > 0 ? (page - 1) * PAGE_LIMIT + 1 : 0;
  const footerRangeEnd = (page - 1) * PAGE_LIMIT + headRows.length;
  const attendanceFooterStart = attendanceRows.length > 0 ? (attendancePage - 1) * PAGE_LIMIT + 1 : 0;
  const attendanceFooterEnd = (attendancePage - 1) * PAGE_LIMIT + attendanceRows.length;

  return (
    <Box sx={[pageWrapper, rolesPageWrapper] as SxProps<Theme>}>
      <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 2, mb: 1 }}>
        <Box>
          <Typography variant="regularLarge" fontWeight={700} color="white">
            Department Heads
          </Typography>
          <Typography variant="body2" sx={{ mt: 0.75, color: theme.app.dashboard.textMuted, maxWidth: 760 }}>
            Assign and manage department heads. You can also view attendance across all pools in a department.
          </Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <SegmentedControl
            options={[
              { value: "heads", label: "Heads" },
              { value: "attendance", label: "Attendance" },
            ]}
            value={mode}
            onChange={(v) => setMode(v as "heads" | "attendance")}
          />
        </Box>
      </Box>

      <DashboardCard sx={rolesCard}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2, flexWrap: "wrap" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Box sx={rolesIconBox}>
              <PersonIcon sx={{ fontSize: 20, color: theme.app.dashboard.white95 }} />
            </Box>
            <Typography variant="mediumLarge" fontWeight={600} color="white">
              Filters & Actions
            </Typography>
          </Box>
        </Box>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: mode === "heads" ? "minmax(0,1fr) minmax(0,1fr) 180px" : "minmax(0,1fr) minmax(0,1fr) minmax(0,1fr) 180px" },
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

          {mode === "heads" ? (
            <SelectField
              label="User"
              value={selectedUserId}
              onChange={setSelectedUserId}
              options={userOptions}
              menuMaxRows={8}
              disabled={!departmentId.trim()}
            />
          ) : (
            <SelectField
              label="Pool (optional)"
              value={attendancePoolId}
              onChange={setAttendancePoolId}
              options={poolOptions}
              menuMaxRows={8}
              disabled={!departmentId.trim()}
            />
          )}

          {mode === "attendance" && (
            <Calendar
              label="Date (UTC)"
              value={attendanceDate}
              onChange={setAttendanceDate}
            />
          )}

          <Button
            variant="primary"
            disabled={
              !departmentId.trim() ||
              (mode === "heads" ? !selectedUserId.trim() || !canAssignDeptHead : false) ||
              assignMutation.isPending
            }
            onClick={() => {
              if (!departmentId.trim()) {
                publishAppToast({ variant: "error", message: "Please select a department." });
                return;
              }
              if (mode !== "heads") {
                publishAppToast({ variant: "success", message: "Filters applied." });
                return;
              }
              if (!selectedUserId.trim()) {
                publishAppToast({ variant: "error", message: "Please select a user." });
                return;
              }
              assignMutation.mutate(
                { departmentId: departmentId.trim(), userId: selectedUserId.trim() },
                {
                  onSuccess: () => {
                    publishAppToast({ variant: "success", message: "Department head assigned." });
                    setSelectedUserId("");
                  },
                  onError: () => publishAppToast({ variant: "error", message: "Could not assign department head." }),
                },
              );
            }}
          >
            {mode === "heads" ? "Assign Head" : "Apply"}
          </Button>
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
              {mode === "heads" ? "Current Heads" : "Department Attendance"}
            </Typography>
          </Box>
        </Box>

        {mode === "heads" ? (
          <DataTable<HeadRow>
            columns={headsColumns}
            rows={headRows}
            getRowId={(r) => r.id}
            minWidth={860}
            isLoading={headsQuery.isLoading || headsQuery.isFetching}
            actionColumn={{
              label: "Action",
              render: (row) => {
                const isDeletingThis =
                  removeMutation.isPending && removeMutation.variables === row.id;
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
            minWidth={980}
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
    </Box>
  );
}

