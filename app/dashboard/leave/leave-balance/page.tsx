"use client";

import { useMemo, useState } from "react";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import { AttachMoney as AttachMoneyIcon } from "@mui/icons-material";
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
import { unwrapApiData, isRecord, pickNum, pickStr } from "@/lib/utils/core";
import { useLeaveQuotaSummaryQuery } from "@/lib/hooks/query";
import { useAuth } from "@/lib/auth";
import { OP } from "@/lib/permissions";

export default function LeaveBalancePage() {
  const theme = useTheme() as AppTheme;
  const { hasOperational } = useAuth();
  const showLeaveInsights =
    hasOperational(OP.hrms.leave.selfView) || hasOperational(OP.hrms.leave.apply);
  const [quotaYear, setQuotaYear] = useState(() => new Date().getUTCFullYear());

  const quotaQuery = useLeaveQuotaSummaryQuery({ year: quotaYear }, { enabled: true, scope: "leave-balance" });

  const quotaYearOptions = useMemo(() => {
    const now = new Date().getUTCFullYear();
    const years = [now - 1, now, now + 1];
    return years.map((y) => ({ value: String(y), label: String(y) }));
  }, []);

  const quotaRows = useMemo(() => {
    const payload = unwrapApiData(quotaQuery.data);
    const obj = isRecord(payload) ? payload : null;
    const arr =
      Array.isArray(payload) ? (payload as unknown[]) :
      Array.isArray(obj?.["items"]) ? (obj?.["items"] as unknown[]) :
      Array.isArray(obj?.["leaveTypes"]) ? (obj?.["leaveTypes"] as unknown[]) :
      Array.isArray(obj?.["data"]) ? (obj?.["data"] as unknown[]) :
      [];
    const items = arr.filter(isRecord);
    return items
      .map((r) => {
        const leaveTypeObj = isRecord(r["leaveType"]) ? (r["leaveType"] as Record<string, unknown>) : null;
        const id = pickStr(leaveTypeObj, ["id"]) || pickStr(r, ["leaveTypeId", "id"]) || "";
        const name = pickStr(leaveTypeObj, ["name"]) || pickStr(r, ["leaveTypeName", "name", "typeName"]) || "—";
        const max =
          pickNum(r, ["yearlyMax", "yearlyMaxDays", "maxDaysPerYear", "maxDays", "yearMaxDays"]) ??
          pickNum(leaveTypeObj, ["maxDaysPerYear", "yearlyMaxDays"]);
        const used =
          pickNum(r, ["countedDays", "usedDays", "daysUsed", "daysCounted", "takenDays", "daysTaken"]) ??
          pickNum(r, ["pendingAndApprovedDays", "pendingApprovedDays"]);
        const safeMax = typeof max === "number" && Number.isFinite(max) ? Math.max(0, max) : null;
        const safeUsed = typeof used === "number" && Number.isFinite(used) ? Math.max(0, used) : 0;
        const remaining = safeMax == null ? null : Math.max(0, safeMax - safeUsed);
        const pct = safeMax && safeMax > 0 ? Math.min(100, Math.round((safeUsed / safeMax) * 100)) : 0;
        return { id: id || name, name, max: safeMax, used: safeUsed, remaining, pct };
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [quotaQuery.data]);

  return (
    <Box sx={[pageWrapper, rolesPageWrapper] as SxProps<Theme>}>
      <Box sx={leaveBalanceHeaderWrapSx}>
        <Typography variant="regularLarge" fontWeight={700} color="white">
          Leave Balance
        </Typography>
        <Typography variant="body2" sx={leaveBalanceSubtextSx}>
          Generate and distribute licenses to client companies
        </Typography>
      </Box>

      {showLeaveInsights ? (
        <DashboardCard sx={{ ...rolesCard, mt: 2 }}>
          <Box sx={{ ...applyLeaveCardHeaderSx, justifyContent: "space-between", gap: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <Box sx={rolesIconBox}>
                <AttachMoneyIcon sx={applyLeaveIconSx} />
              </Box>
              <Box>
                <Typography variant="mediumLarge" fontWeight={600} color="white">
                  Quota summary
                </Typography>
                <Typography variant="body2" sx={{ color: theme.app.dashboard.textMuted, mt: 0.25 }}>
                  Leave usage for the selected year.
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

          {quotaQuery.isLoading || quotaQuery.isFetching ? (
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
                No quota information available for this year.
              </Typography>
            </Box>
          ) : (
            <Box sx={{ mt: 2, display: "flex", flexDirection: "column", gap: 1.25 }}>
              {quotaRows.map((r) => (
                <Box
                  key={r.id}
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
                      {r.name}
                    </Typography>
                    <Typography variant="body2" sx={{ color: theme.app.dashboard.textMuted, whiteSpace: "nowrap" }}>
                      {r.max == null ? "No yearly limit" : `${r.used} / ${r.max} days`}
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
                          width: `${r.max == null ? 0 : r.pct}%`,
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
                        gridTemplateColumns: { xs: "1fr", sm: "minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1fr)" },
                        gap: 1,
                        alignItems: "center",
                      }}
                    >
                      <Box>
                        <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted, display: "block" }}>
                          Used
                        </Typography>
                        <Typography variant="body2" sx={{ color: "white", fontWeight: 600 }}>
                          {r.used} day{r.used === 1 ? "" : "s"}
                        </Typography>
                      </Box>
                      <Divider sx={{ display: { xs: "none", sm: "block" }, borderColor: "rgba(255,255,255,0.10)" }} orientation="vertical" flexItem />
                      <Box>
                        <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted, display: "block" }}>
                          Remaining
                        </Typography>
                        <Typography variant="body2" sx={{ color: "white", fontWeight: 600 }}>
                          {r.remaining == null ? "—" : `${r.remaining} day${r.remaining === 1 ? "" : "s"}`}
                        </Typography>
                      </Box>
                      <Divider sx={{ display: { xs: "none", sm: "block" }, borderColor: "rgba(255,255,255,0.10)" }} orientation="vertical" flexItem />
                      <Box>
                        <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted, display: "block" }}>
                          Yearly limit
                        </Typography>
                        <Typography variant="body2" sx={{ color: "white", fontWeight: 600 }}>
                          {r.max == null ? "—" : `${r.max} day${r.max === 1 ? "" : "s"}`}
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
