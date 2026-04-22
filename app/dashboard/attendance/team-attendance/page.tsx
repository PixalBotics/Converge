"use client";

import { useEffect, useMemo, useState } from "react";
import Box from "@mui/material/Box";
import { AccessTime as AccessTimeIcon } from "@mui/icons-material";
import type { SxProps, Theme } from "@mui/material/styles";
import { useTheme } from "@mui/material/styles";
import {
  Typography,
  DashboardCard,
  DataTable,
  TablePagination,
  Button,
  Calendar,
  SelectField,
  SegmentedControl,
  InputField,
} from "@/components/common";
import type { DataTableColumn } from "@/components/common";
import { rolesCard, rolesFooterRow, rolesIconBox, rolesPageWrapper, rolesPaginationWrapper } from "../../roles/roles.styles";
import { footerMutedText, pageWrapper } from "../../companies/overview.styles";
import type { AppTheme } from "@/theme/theme";
import {
  useAttendanceUserQuery,
  useDepartmentsListQuery,
  usePoolHeadsAttendanceQuery,
  usePoolsListQuery,
  useUsersListQuery,
} from "@/lib/hooks/query";
import { isRecord, pickStr, unwrapApiData } from "@/lib/utils";
import { extractUsersRows } from "@/app/dashboard/user-page/utils";
import { pickItemsArray, toIdNameOption } from "@/app/dashboard/user-page/components/add-user-modal.utils";
import { EmptyAttendanceState } from "../components/EmptyAttendanceState";
import {
  teamAttendanceApplyButtonSx,
  teamAttendanceCardTitleSx,
  teamAttendanceDateRangeFieldSx,
  teamAttendanceFilterGridSx,
  teamAttendanceHeaderActionsSx,
  teamAttendanceHeaderRowSx,
  teamAttendanceStatusTextSx,
  teamAttendanceSubtextSx,
} from "./team-attendance.styles";

const PAGE_LIMIT = 16;

type TeamAttendanceRow = {
  id: string;
  employeeName: string;
  date: string;
  status: string;
  checkIn: string;
  checkOut: string;
};

type PoolTeamRow = {
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

export default function TeamAttendancePage() {
  const theme = useTheme() as AppTheme;
  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const startOfMonth = useMemo(() => `${today.slice(0, 7)}-01`, [today]);

  const [view, setView] = useState<"user" | "pool">("user");

  const [from, setFrom] = useState(startOfMonth);
  const [to, setTo] = useState(today);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [page, setPage] = useState(1);

  const [departmentId, setDepartmentId] = useState("");
  const [poolId, setPoolId] = useState("");
  const [poolMemberName, setPoolMemberName] = useState("");
  const [poolDate, setPoolDate] = useState(today);
  const [poolPage, setPoolPage] = useState(1);

  const usersQuery = useUsersListQuery({ page: 1, limit: 200 }, { enabled: view === "user" });
  const userRows = useMemo(() => extractUsersRows(usersQuery.data), [usersQuery.data]);
  const userOptions = useMemo(() => {
    const base = userRows.map((u) => ({ value: u.id, label: `${u.user} · ${u.email}` }));
    return [{ value: "", label: usersQuery.isLoading ? "Loading users…" : "— Select user —" }, ...base];
  }, [userRows, usersQuery.isLoading]);

  const attendanceQuery = useAttendanceUserQuery(
    selectedUserId,
    { from, to, page, limit: PAGE_LIMIT },
    { enabled: view === "user" && Boolean(selectedUserId.trim() && from.trim() && to.trim()) },
  );

  const departmentsQuery = useDepartmentsListQuery({ all: true }, { enabled: view === "pool", scope: "team-attendance" });
  const departmentOptions = useMemo(() => {
    const base = pickItemsArray(departmentsQuery.data)
      .map(toIdNameOption)
      .filter((o): o is { value: string; label: string } => o !== null);
    return [{ value: "", label: departmentsQuery.isLoading ? "Loading…" : "— Department —" }, ...base];
  }, [departmentsQuery.data, departmentsQuery.isLoading]);

  const poolsQuery = usePoolsListQuery(
    departmentId.trim() ? { departmentId: departmentId.trim(), all: true } : undefined,
    { enabled: view === "pool", scope: "team-attendance-pools" },
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
    return [{ value: "", label: poolsQuery.isLoading ? "Loading…" : "All pools (optional)" }, ...base];
  }, [poolsQuery.data, poolsQuery.isLoading]);

  const poolAttendanceParams = useMemo(() => {
    if (view !== "pool") return undefined;
    return {
      page: poolPage,
      limit: PAGE_LIMIT,
      ...(poolId.trim() ? { poolId: poolId.trim() } : {}),
      ...(poolDate.trim() ? { date: poolDate.trim() } : {}),
      ...(poolMemberName.trim() ? { memberName: poolMemberName.trim() } : {}),
    };
  }, [view, poolPage, poolId, poolDate, poolMemberName]);

  const poolAttendanceQuery = usePoolHeadsAttendanceQuery(poolAttendanceParams, {
    enabled: view === "pool",
    scope: "team-attendance-pool",
  });

  const apiItems = useMemo(() => {
    const data = unwrapApiData(attendanceQuery.data);
    if (!data) return [];
    if (Array.isArray(data)) return data.filter(isRecord);
    if (!isRecord(data)) return [];
    const items = data["items"];
    return Array.isArray(items) ? items.filter(isRecord) : [];
  }, [attendanceQuery.data]);

  const total = useMemo(() => {
    const data = unwrapApiData(attendanceQuery.data);
    if (!isRecord(data)) return apiItems.length;
    const n = Number(data["total"]);
    return Number.isFinite(n) ? n : apiItems.length;
  }, [attendanceQuery.data, apiItems.length]);

  const totalPages = useMemo(() => {
    const data = unwrapApiData(attendanceQuery.data);
    if (!isRecord(data)) return 1;
    const n = Number(data["totalPages"]);
    return Number.isFinite(n) && n > 0 ? n : 1;
  }, [attendanceQuery.data]);

  const poolApiItems = useMemo(() => extractItems(poolAttendanceQuery.data), [poolAttendanceQuery.data]);
  const poolTotal = useMemo(() => {
    const data = unwrapApiData(poolAttendanceQuery.data);
    if (!isRecord(data)) return poolApiItems.length;
    const n = Number(data["total"]);
    return Number.isFinite(n) ? n : poolApiItems.length;
  }, [poolAttendanceQuery.data, poolApiItems.length]);
  const poolTotalPages = useMemo(() => {
    const data = unwrapApiData(poolAttendanceQuery.data);
    if (!isRecord(data)) return 1;
    const n = Number(data["totalPages"]);
    return Number.isFinite(n) && n > 0 ? n : 1;
  }, [poolAttendanceQuery.data]);

  useEffect(() => {
    setPage(1);
  }, [selectedUserId, from, to, view]);

  useEffect(() => {
    setPage((p) => (p > totalPages ? totalPages : p));
  }, [totalPages]);

  useEffect(() => {
    setPoolId("");
    setPoolPage(1);
  }, [departmentId, view]);

  useEffect(() => {
    setPoolPage(1);
  }, [poolId, view]);

  useEffect(() => {
    setPoolPage((p) => (p > poolTotalPages ? poolTotalPages : p));
  }, [poolTotalPages]);

  const tableRows = useMemo<TeamAttendanceRow[]>(() => {
    const pick = (row: Record<string, unknown>, keys: string[]) => {
      for (const k of keys) {
        const v = row[k];
        if (typeof v === "string" && v.trim()) return v.trim();
      }
      return "";
    };
    const userLabel = userOptions.find((o) => o.value === selectedUserId)?.label ?? "—";
    return apiItems.map((row, idx) => ({
      id: pick(row, ["id", "attendanceId"]) || `team-${idx}`,
      employeeName: pick(row, ["employeeName", "userName", "name"]) || userLabel,
      date: pick(row, ["date", "day", "attendanceDate"]) || "—",
      status: pick(row, ["status"]) || "—",
      checkIn: pick(row, ["checkIn", "checkInTime", "inTime"]) || "—",
      checkOut: pick(row, ["checkOut", "checkOutTime", "outTime"]) || "—",
    }));
  }, [apiItems, selectedUserId, userOptions]);

  const poolTableRows = useMemo<PoolTeamRow[]>(() => {
    const pick = (row: Record<string, unknown>, keys: string[]) => pickStr(row, keys) || "";
    return poolApiItems.map((row, idx) => {
      const poolNested = row["pool"];
      const poolName =
        pick(isRecord(poolNested) ? (poolNested as Record<string, unknown>) : row, ["name", "poolName"]) ||
        pick(row, ["poolName"]) ||
        "—";
      return {
        id: pick(row, ["id", "attendanceId"]) || `pool-team-${idx}`,
        employeeName: pick(row, ["employeeName", "userName", "name"]) || "—",
        poolName,
        date: pick(row, ["date", "day", "attendanceDate"]) || "—",
        status: pick(row, ["status"]) || "—",
        checkIn: pick(row, ["checkIn", "checkInTime", "inTime"]) || "—",
        checkOut: pick(row, ["checkOut", "checkOutTime", "outTime"]) || "—",
      };
    });
  }, [poolApiItems]);

  const footerRangeStart = tableRows.length > 0 ? (page - 1) * PAGE_LIMIT + 1 : 0;
  const footerRangeEnd = (page - 1) * PAGE_LIMIT + tableRows.length;
  const poolFooterStart = poolTableRows.length > 0 ? (poolPage - 1) * PAGE_LIMIT + 1 : 0;
  const poolFooterEnd = (poolPage - 1) * PAGE_LIMIT + poolTableRows.length;

  const columns = useMemo<DataTableColumn<TeamAttendanceRow>[]>(
    () => [
      { id: "employeeName", label: "Employee Name" },
      { id: "date", label: "Date" },
      {
        id: "status",
        label: "Status",
        render: (value) => (
          <Box component="span" sx={teamAttendanceStatusTextSx}>
            {String(value)}
          </Box>
        ),
      },
      { id: "checkIn", label: "Check-in" },
      { id: "checkOut", label: "Check-out" },
    ],
    [],
  );

  const poolColumns = useMemo<DataTableColumn<PoolTeamRow>[]>(
    () => [
      { id: "employeeName", label: "Member" },
      { id: "poolName", label: "Pool" },
      { id: "date", label: "Date (UTC)" },
      {
        id: "status",
        label: "Status",
        render: (value) => (
          <Box component="span" sx={teamAttendanceStatusTextSx}>
            {String(value)}
          </Box>
        ),
      },
      { id: "checkIn", label: "Check-in" },
      { id: "checkOut", label: "Check-out" },
    ],
    [],
  );

  return (
    <Box sx={[pageWrapper, rolesPageWrapper] as SxProps<Theme>}>
      <Box sx={teamAttendanceHeaderRowSx}>
        <Box>
          <Typography variant="regularLarge" fontWeight={700} color="white">
            Team Attendance
          </Typography>
          <Typography variant="body2" sx={teamAttendanceSubtextSx}>
            {view === "user"
              ? "Review attendance for one user over a date range (existing user attendance API)."
              : "Review pool head plus all pool members for a day using GET /hrms/pool-heads/attendance."}
          </Typography>
        </Box>
        <Box sx={teamAttendanceHeaderActionsSx}>
          <SegmentedControl
            options={[
              { value: "user", label: "By user" },
              { value: "pool", label: "Pool team" },
            ]}
            value={view}
            onChange={(v) => setView(v as "user" | "pool")}
          />
        </Box>
      </Box>

      <DashboardCard sx={rolesCard}>
        <Box sx={teamAttendanceCardTitleSx}>
          <Box sx={rolesIconBox}>
            <AccessTimeIcon sx={{ fontSize: 20, color: theme.app.dashboard.white95 }} />
          </Box>
          <Typography variant="mediumLarge" fontWeight={600} color="white">
            Select Filter
          </Typography>
        </Box>

        {view === "user" ? (
          <Box sx={teamAttendanceFilterGridSx}>
            <SelectField
              label="User"
              value={selectedUserId}
              onChange={setSelectedUserId}
              options={userOptions}
              menuMaxRows={8}
            />
            <Box sx={teamAttendanceDateRangeFieldSx}>
              <Calendar label="From" value={from} onChange={setFrom} />
            </Box>
            <Box sx={teamAttendanceDateRangeFieldSx}>
              <Calendar label="To" value={to} onChange={setTo} />
            </Box>
            <Button variant="primary" sx={teamAttendanceApplyButtonSx}>
              Apply Filter
            </Button>
          </Box>
        ) : (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "minmax(0,1fr) minmax(0,1fr) minmax(0,1fr) minmax(0,1fr)" },
              gap: 1.5,
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
              menuMaxRows={8}
              disabled={!departmentId.trim()}
            />
            <InputField
              label="Member name / email"
              placeholder="Optional contains…"
              value={poolMemberName}
              onChange={(e) => setPoolMemberName(e.target.value)}
            />
            <Calendar label="Date (UTC)" value={poolDate} onChange={setPoolDate} />
          </Box>
        )}
      </DashboardCard>

      <DashboardCard sx={rolesCard}>
        <Box sx={teamAttendanceCardTitleSx}>
          <Box sx={rolesIconBox}>
            <AccessTimeIcon sx={{ fontSize: 20, color: theme.app.dashboard.white95 }} />
          </Box>
          <Typography variant="mediumLarge" fontWeight={600} color="white">
            Attendance Records
          </Typography>
        </Box>

        {view === "user" ? (
          attendanceQuery.isLoading || attendanceQuery.isFetching ? (
            <DataTable<TeamAttendanceRow>
              columns={columns}
              rows={tableRows}
              getRowId={(row) => row.id}
              isLoading
              minWidth={860}
            />
          ) : !selectedUserId.trim() ? (
            <EmptyAttendanceState
              title="Select a user to view attendance"
              subtitle="Choose a user from the filter above, then apply the date range."
            />
          ) : tableRows.length === 0 ? (
            <EmptyAttendanceState />
          ) : (
            <DataTable<TeamAttendanceRow>
              columns={columns}
              rows={tableRows}
              getRowId={(row) => row.id}
              minWidth={860}
            />
          )
        ) : poolAttendanceQuery.isLoading || poolAttendanceQuery.isFetching ? (
          <DataTable<PoolTeamRow>
            columns={poolColumns}
            rows={poolTableRows}
            getRowId={(row) => row.id}
            isLoading
            minWidth={900}
          />
        ) : poolTableRows.length === 0 ? (
          <EmptyAttendanceState
            title="No attendance rows"
            subtitle="Adjust department, pool, member filter, or date — or confirm your account can access this pool."
          />
        ) : (
          <DataTable<PoolTeamRow>
            columns={poolColumns}
            rows={poolTableRows}
            getRowId={(row) => row.id}
            minWidth={900}
          />
        )}

        <Box sx={rolesFooterRow}>
          <Typography variant="medium" sx={footerMutedText(theme)}>
            {view === "user"
              ? attendanceQuery.isLoading
                ? "Loading…"
                : `Showing data ${footerRangeStart} to ${footerRangeEnd} of ${total} entries`
              : poolAttendanceQuery.isLoading
                ? "Loading…"
                : `Showing data ${poolFooterStart} to ${poolFooterEnd} of ${poolTotal} entries`}
          </Typography>
          <Box sx={rolesPaginationWrapper}>
            {view === "user" ? (
              <TablePagination page={page} pageCount={totalPages} onPageChange={setPage} />
            ) : (
              <TablePagination page={poolPage} pageCount={poolTotalPages} onPageChange={setPoolPage} />
            )}
          </Box>
        </Box>
      </DashboardCard>
    </Box>
  );
}
