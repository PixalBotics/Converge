"use client";

import { useMemo, useState } from "react";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import { EventAvailable as EventAvailableIcon } from "@mui/icons-material";
import type { SxProps, Theme } from "@mui/material/styles";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { Typography, DashboardCard, SelectField } from "@/components/common";
import { rolesCard, rolesIconBox, rolesPageWrapper } from "../../roles/roles.styles";
import { pageWrapper } from "../../companies/overview.styles";
import {
  applyLeaveCardHeaderSx,
  applyLeaveIconSx,
} from "../apply-leave/apply-leave.styles";
import { leaveBalanceHeaderWrapSx, leaveBalanceSubtextSx } from "./leave-balance.styles";
import { useLeaveQuotaSummaryQuery } from "@/lib/hooks/query";
import { useAuth } from "@/lib/auth";
import { OP } from "@/lib/permissions";
import {
  formatLeaveDayCount,
  parseLeaveQuotaSummaryRows,
} from "@/lib/utils/hrms/leave-quota-display";

export default function LeaveBalancePage() {
  const theme = useTheme() as AppTheme;
  const { hasOperational } = useAuth();
  const showLeaveInsights =
    hasOperational(OP.hrms.leave.selfView) || hasOperational(OP.hrms.leave.apply);
  const [quotaYear, setQuotaYear] = useState(() => new Date().getUTCFullYear());

  const quotaQuery = useLeaveQuotaSummaryQuery(
    { year: quotaYear },
    { enabled: showLeaveInsights, scope: "leave-balance" },
  );

  const quotaYearOptions = useMemo(() => {
    const now = new Date().getUTCFullYear();
    const years = [now - 1, now, now + 1];
    return years.map((y) => ({ value: String(y), label: String(y) }));
  }, []);

  const quotaRows = useMemo(
    () => parseLeaveQuotaSummaryRows(quotaQuery.data),
    [quotaQuery.data],
  );

  return (
    <Box sx={[pageWrapper, rolesPageWrapper] as SxProps<Theme>}>
      <Box sx={leaveBalanceHeaderWrapSx}>
        <Typography variant="regularLarge" fontWeight={700} color="white">
          Leave Balance
        </Typography>
        <Typography variant="body2" sx={leaveBalanceSubtextSx}>
          View approved leave counts and remaining quota for the selected year.
        </Typography>
      </Box>

      {showLeaveInsights ? (
        <DashboardCard sx={rolesCard}>
          <Box sx={{ ...applyLeaveCardHeaderSx, justifyContent: "space-between", gap: 2, alignItems: "flex-start" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <Box sx={rolesIconBox}>
                <EventAvailableIcon sx={applyLeaveIconSx} />
              </Box>
              <Box>
                <Typography variant="mediumLarge" fontWeight={600} color="white">
                  Quota summary
                </Typography>
                <Typography variant="body2" sx={{ color: theme.app.dashboard.textMuted, mt: 0.25 }}>
                  Approved leave days counted against your yearly limits.
                </Typography>
              </Box>
            </Box>

            <Box sx={{ width: { xs: "100%", sm: 200 } }}>
              <SelectField
                label="Year"
                value={String(quotaYear)}
                onChange={(v) => setQuotaYear(Number(String(v)))}
                options={quotaYearOptions}
                menuMaxRows={6}
              />
            </Box>
          </Box>

          {quotaQuery.isPending ? (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" sx={{ color: theme.app.dashboard.textMuted }}>
                Loading quota summary…
              </Typography>
            </Box>
          ) : quotaQuery.isError ? (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" sx={{ color: theme.palette.error.light, lineHeight: 1.5 }}>
                Could not load quota summary. Please try again.
              </Typography>
            </Box>
          ) : quotaRows.length === 0 ? (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" sx={{ color: theme.app.dashboard.textMuted }}>
                No quota information available for {quotaYear}.
              </Typography>
            </Box>
          ) : (
            <Box sx={{ mt: 2, display: "flex", flexDirection: "column", gap: 1.25 }}>
              {quotaRows.map((row) => (
                <Box
                  key={row.id}
                  sx={{
                    border: `1px solid ${theme.palette.mode === "light" ? "rgba(15, 23, 42, 0.10)" : "rgba(255,255,255,0.10)"}`,
                    borderRadius: 2,
                    px: 2,
                    py: 1.5,
                    bgcolor: theme.palette.mode === "light" ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.04)",
                    backdropFilter: "blur(10px)",
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 1.5 }}>
                    <Typography variant="mediumLarge" fontWeight={600} color="white">
                      {row.name}
                    </Typography>
                    <Typography variant="body2" sx={{ color: theme.app.dashboard.textMuted, whiteSpace: "nowrap" }}>
                      {row.yearlyMax == null
                        ? `${formatLeaveDayCount(row.approvedDays)} approved`
                        : `${formatLeaveDayCount(row.approvedDays)} / ${formatLeaveDayCount(row.yearlyMax)}`}
                    </Typography>
                  </Box>

                  <Box sx={{ mt: 1.25 }}>
                    <Box
                      sx={{
                        height: 8,
                        borderRadius: 999,
                        bgcolor: theme.palette.mode === "light" ? "rgba(15, 23, 42, 0.10)" : "rgba(255,255,255,0.10)",
                        overflow: "hidden",
                      }}
                    >
                      <Box
                        sx={{
                          height: "100%",
                          width: `${row.yearlyMax == null ? 0 : row.usagePct}%`,
                          borderRadius: 999,
                          background: `linear-gradient(90deg, ${theme.app.dashboard.buttonIndigo} 0%, ${theme.app.dashboard.accentGreen ?? theme.palette.success.main} 100%)`,
                          transition: "width 180ms ease",
                        }}
                      />
                    </Box>

                    <Box
                      sx={{
                        mt: 1.25,
                        display: "grid",
                        gridTemplateColumns: {
                          xs: "1fr",
                          sm: "repeat(2, minmax(0, 1fr))",
                          md: "repeat(4, minmax(0, 1fr))",
                        },
                        gap: 1,
                        alignItems: "center",
                      }}
                    >
                      <Box>
                        <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted, display: "block" }}>
                          Approved leaves
                        </Typography>
                        <Typography variant="body2" sx={{ color: "white", fontWeight: 600 }}>
                          {formatLeaveDayCount(row.approvedDays)}
                        </Typography>
                      </Box>
                      <Divider
                        sx={{ display: { xs: "none", md: "block" }, borderColor: "rgba(255,255,255,0.10)" }}
                        orientation="vertical"
                        flexItem
                      />
                      <Box>
                        <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted, display: "block" }}>
                          Pending
                        </Typography>
                        <Typography variant="body2" sx={{ color: "white", fontWeight: 600 }}>
                          {formatLeaveDayCount(row.pendingDays)}
                        </Typography>
                      </Box>
                      <Divider
                        sx={{ display: { xs: "none", md: "block" }, borderColor: "rgba(255,255,255,0.10)" }}
                        orientation="vertical"
                        flexItem
                      />
                      <Box>
                        <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted, display: "block" }}>
                          Remaining
                        </Typography>
                        <Typography variant="body2" sx={{ color: "white", fontWeight: 600 }}>
                          {row.remainingDays == null ? "—" : formatLeaveDayCount(row.remainingDays)}
                        </Typography>
                      </Box>
                      <Divider
                        sx={{ display: { xs: "none", md: "block" }, borderColor: "rgba(255,255,255,0.10)" }}
                        orientation="vertical"
                        flexItem
                      />
                      <Box>
                        <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted, display: "block" }}>
                          Yearly limit
                        </Typography>
                        <Typography variant="body2" sx={{ color: "white", fontWeight: 600 }}>
                          {row.yearlyMax == null ? "—" : formatLeaveDayCount(row.yearlyMax)}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </Box>
              ))}
            </Box>
          )}
        </DashboardCard>
      ) : null}
    </Box>
  );
}
