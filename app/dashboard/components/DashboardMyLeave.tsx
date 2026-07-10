"use client";

import { useMemo } from "react";
import Link from "next/link";
import Box from "@mui/material/Box";
import { useTheme } from "@mui/material/styles";
import {
  EventAvailable as EventAvailableIcon,
  PendingActions as PendingActionsIcon,
} from "@mui/icons-material";
import type { AppTheme } from "@/theme/theme";
import {
  Typography,
  DashboardCard,
  DataTable,
  MetricCard,
  Button,
} from "@/components/common";
import type { DataTableColumn } from "@/components/common";
import { useAuth } from "@/lib/auth";
import { OP } from "@/lib/permissions";
import { useLeaveQuotaSummaryQuery, useMyLeaveApplicationsQuery } from "@/lib/hooks/query";
import { formatIsoDate, isRecord, pickStr, unwrapApiData } from "@/lib/utils/core";
import {
  formatLeaveDayCount,
  parseLeaveQuotaSummaryRows,
} from "@/lib/utils/hrms/leave-quota-display";
import { cardPadding, grid3 } from "../dashboard.styles";

type MyLeaveRow = {
  id: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  status: string;
};

export function DashboardMyLeave() {
  const theme = useTheme() as AppTheme;
  const { hasOperational } = useAuth();

  const canView = hasOperational(OP.hrms.leave.apply);

  const quotaYear = new Date().getUTCFullYear();
  const quotaQuery = useLeaveQuotaSummaryQuery(
    { year: quotaYear },
    { enabled: canView, scope: "dashboard-personal-leave" },
  );
  const myLeavesQuery = useMyLeaveApplicationsQuery(
    { page: 1, limit: 5 },
    { enabled: canView, scope: "dashboard-personal-leave" },
  );

  const quotaRows = useMemo(
    () => parseLeaveQuotaSummaryRows(quotaQuery.data),
    [quotaQuery.data],
  );

  const myPayload = unwrapApiData(myLeavesQuery.data);
  const myObj = isRecord(myPayload) ? myPayload : null;
  const myItems = useMemo(() => {
    const arr = myObj?.["items"];
    return Array.isArray(arr) ? (arr as unknown[]).filter(isRecord) : [];
  }, [myObj]);

  const myRows = useMemo<MyLeaveRow[]>(() => {
    return myItems
      .map((r) => {
        const id = pickStr(r, ["id"]);
        if (!id) return null;
        const typeName =
          pickStr(isRecord(r["leaveType"]) ? (r["leaveType"] as Record<string, unknown>) : null, ["name"]) ||
          pickStr(r, ["leaveTypeName"]) ||
          "—";
        return {
          id,
          leaveType: typeName,
          startDate: formatIsoDate(pickStr(r, ["startDate", "effectiveFrom"])),
          endDate: formatIsoDate(pickStr(r, ["endDate", "effectiveTo"])),
          status: pickStr(r, ["status", "approvalStatus", "stage"]) || "—",
        };
      })
      .filter((x): x is MyLeaveRow => x !== null);
  }, [myItems]);

  const pendingCount = useMemo(
    () => myRows.filter((row) => row.status.toLowerCase().includes("pending")).length,
    [myRows],
  );

  const totalRemaining = useMemo(() => {
    const values = quotaRows
      .map((row) => row.remainingDays)
      .filter((value): value is number => value != null && Number.isFinite(value));
    if (!values.length) return null;
    return values.reduce((sum, value) => sum + value, 0);
  }, [quotaRows]);

  const columns = useMemo<DataTableColumn<MyLeaveRow>[]>(
    () => [
      { id: "leaveType", label: "Leave type" },
      { id: "startDate", label: "Start", cellVariant: "muted" },
      { id: "endDate", label: "End", cellVariant: "muted" },
      { id: "status", label: "Status" },
    ],
    [],
  );

  if (!canView) return null;

  const loading = quotaQuery.isLoading || myLeavesQuery.isLoading;

  return (
    <Box sx={{ mt: 2 }}>
      <Box sx={grid3}>
        <MetricCard
          title="Leave balance"
          value={
            loading
              ? "…"
              : totalRemaining != null
                ? formatLeaveDayCount(totalRemaining)
                : quotaRows.length
                  ? "—"
                  : "0"
          }
          subtitle={`Remaining days · ${quotaYear}`}
          icon={<EventAvailableIcon sx={{ fontSize: 22 }} />}
          iconBgColor={theme.app.dashboard.accentBlue}
          showTrendArrow={false}
        />
        <MetricCard
          title="Pending requests"
          value={loading ? "…" : String(pendingCount)}
          subtitle="Awaiting approval"
          icon={<PendingActionsIcon sx={{ fontSize: 22 }} />}
          iconBgColor={theme.app.dashboard.accentOrange}
          showTrendArrow={false}
        />
        <MetricCard
          title="Leave types"
          value={loading ? "…" : String(quotaRows.length)}
          subtitle="Tracked in your quota"
          icon={<EventAvailableIcon sx={{ fontSize: 22 }} />}
          iconBgColor={theme.app.dashboard.accentPurple}
          showTrendArrow={false}
        />
      </Box>

      <DashboardCard sx={{ ...cardPadding, mt: 2 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: { xs: "flex-start", sm: "center" },
            flexDirection: { xs: "column", sm: "row" },
            gap: 1.5,
            mb: 2,
          }}
        >
          <Typography variant="subtitle1" fontWeight={600} color="white">
            My recent leave
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
            <Button component={Link} href="/dashboard/leave/leave-balance" variant="secondary" size="small">
              Leave balance
            </Button>
            <Button component={Link} href="/dashboard/leave/apply-leave" variant="primary" size="small">
              Apply leave
            </Button>
          </Box>
        </Box>

        {loading ? (
          <Typography variant="body2" sx={{ color: theme.app.dashboard.textMuted }}>
            Loading your leave…
          </Typography>
        ) : myRows.length === 0 ? (
          <Typography variant="body2" sx={{ color: theme.app.dashboard.textMuted }}>
            No leave applications yet.
          </Typography>
        ) : (
          <DataTable<MyLeaveRow>
            columns={columns}
            rows={myRows}
            getRowId={(row) => row.id}
            minWidth={480}
          />
        )}
      </DashboardCard>
    </Box>
  );
}
