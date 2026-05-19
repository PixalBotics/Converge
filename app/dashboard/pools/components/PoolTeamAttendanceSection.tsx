"use client";

import { useEffect, useMemo, useState } from "react";
import Box from "@mui/material/Box";
import { AccessTime as AccessTimeIcon } from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { Calendar, DashboardCard, DataTable, InputField, TablePagination, Typography } from "@/components/common";
import type { DataTableColumn } from "@/components/common";
import { rolesCard, rolesFooterRow, rolesIconBox, rolesPaginationWrapper } from "../../roles/roles.styles";
import { footerMutedText } from "../../companies/overview.styles";
import { isRecord, pickStr, unwrapApiData } from "@/lib/utils/core";
import { usePoolHeadsAttendanceQuery } from "@/lib/hooks/query";

const PAGE_LIMIT = 10;

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
  const n = Number(payload["total"]);
  return Number.isFinite(n) ? n : fallback;
}

function extractTotalPages(data: unknown): number {
  const payload = unwrapApiData(data);
  if (!isRecord(payload)) return 1;
  const n = Number(payload["totalPages"]);
  return Number.isFinite(n) && n > 0 ? n : 1;
}

export type PoolTeamAttendanceSectionProps = {
  poolId: string;
  poolLabel: string;
  active: boolean;
};

export function PoolTeamAttendanceSection({ poolId, poolLabel, active }: PoolTeamAttendanceSectionProps) {
  const theme = useTheme() as AppTheme;
  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const [page, setPage] = useState(1);
  const [date, setDate] = useState(today);
  const [memberName, setMemberName] = useState("");

  const params = useMemo(() => {
    if (!active || !poolId.trim()) return undefined;
    return {
      poolId: poolId.trim(),
      page,
      limit: PAGE_LIMIT,
      ...(date.trim() ? { date: date.trim() } : {}),
      ...(memberName.trim() ? { memberName: memberName.trim() } : {}),
    };
  }, [active, poolId, page, date, memberName]);

  const query = usePoolHeadsAttendanceQuery(params, {
    enabled: active && poolId.trim().length > 0,
    scope: "pool-members-attendance",
  });

  const items = useMemo(() => extractItems(query.data), [query.data]);
  const rows = useMemo<AttendanceRow[]>(() => {
    const pick = (row: Record<string, unknown>, keys: string[]) => pickStr(row, keys) || "";
    return items.map((row, idx) => {
      const id = pick(row, ["id", "attendanceId"]) || `pt-${idx}`;
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
  }, [items]);

  const total = useMemo(() => extractTotal(query.data, rows.length), [query.data, rows.length]);
  const pageCount = useMemo(() => extractTotalPages(query.data), [query.data]);

  useEffect(() => {
    setPage(1);
    setMemberName("");
    setDate(today);
  }, [poolId, today]);

  useEffect(() => {
    setPage((p) => (p > pageCount ? pageCount : p));
  }, [pageCount]);

  const footerStart = rows.length > 0 ? (page - 1) * PAGE_LIMIT + 1 : 0;
  const footerEnd = (page - 1) * PAGE_LIMIT + rows.length;

  const columns = useMemo<DataTableColumn<AttendanceRow>[]>(
    () => [
      { id: "employeeName", label: "Member" },
      { id: "poolName", label: "Pool" },
      { id: "date", label: "Date (UTC)" },
      { id: "status", label: "Status" },
      { id: "checkIn", label: "Check-in" },
      { id: "checkOut", label: "Check-out" },
    ],
    [],
  );

  if (!active || !poolId.trim()) return null;

  return (
    <DashboardCard sx={{ ...rolesCard, mt: 2 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap" }}>
        <Box sx={rolesIconBox}>
          <AccessTimeIcon sx={{ fontSize: 20, color: theme.app.dashboard.white95 }} />
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="mediumLarge" fontWeight={600} color="white">
            Team attendance
          </Typography>
          <Typography variant="body2" sx={{ color: theme.app.dashboard.textMuted, mt: 0.25 }}>
            {poolLabel}
          </Typography>
        </Box>
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "minmax(0,1fr) minmax(0,1fr)" },
          gap: 1.5,
          mt: 2,
          alignItems: "end",
        }}
      >
        <InputField
          label="Member name / email"
          placeholder="Optional contains filter…"
          value={memberName}
          onChange={(e) => setMemberName(e.target.value)}
        />
        <Calendar label="Date (UTC)" value={date} onChange={setDate} />
      </Box>

      <Box sx={{ mt: 2 }}>
        <DataTable<AttendanceRow>
          columns={columns}
          rows={rows}
          getRowId={(r) => r.id}
          minWidth={720}
          isLoading={query.isLoading || query.isFetching}
        />
      </Box>

      <Box sx={rolesFooterRow}>
        <Typography variant="medium" sx={footerMutedText(theme)}>
          {query.isLoading ? "Loading…" : `Showing data ${footerStart} to ${footerEnd} of ${total} entries`}
        </Typography>
        <Box sx={rolesPaginationWrapper}>
          <TablePagination page={page} pageCount={pageCount} onPageChange={setPage} />
        </Box>
      </Box>
    </DashboardCard>
  );
}
