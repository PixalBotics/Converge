"use client";

import Box from "@mui/material/Box";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { DashboardCard, Typography } from "@/components/common";
import { useInvoicesQuery } from "@/lib/hooks/query/billing/billing";
import { billingOverviewCardSx } from "@/app/dashboard/billing/billing.styles";

export function BillingClientOverviewPanel() {
  const theme = useTheme() as AppTheme;
  const pendingQuery = useInvoicesQuery({ page: 1, limit: 1, status: "pending" });
  const overdueQuery = useInvoicesQuery({ page: 1, limit: 1, status: "overdue" });

  const pendingCount = pendingQuery.data?.data?.total ?? 0;
  const overdueCount = overdueQuery.data?.data?.total ?? 0;
  const unpaidCount = pendingCount + overdueCount;

  return (
    <DashboardCard sx={billingOverviewCardSx}>
      <Typography variant="regularLarge" fontWeight={700} sx={{ color: theme.app.text.primary, mb: 0.5 }}>
        Your invoices
      </Typography>
      <Typography variant="body2" sx={{ color: theme.app.dashboard.textMuted, maxWidth: 640, mb: 1.5 }}>
        Pay pending invoices for your company. Rates and contracts are managed by your agency —
        you only see your own invoices and payment actions here.
      </Typography>
      {unpaidCount > 0 ? (
        <Box
          sx={{
            px: 1.5,
            py: 1.25,
            borderRadius: 1.5,
            bgcolor: overdueCount > 0 ? "rgba(248,113,113,0.12)" : "rgba(255,193,7,0.12)",
            border: `1px solid ${overdueCount > 0 ? "rgba(248,113,113,0.35)" : "rgba(255,193,7,0.35)"}`,
          }}
        >
          <Typography fontWeight={700} sx={{ color: theme.app.text.primary }}>
            {unpaidCount} unpaid invoice{unpaidCount === 1 ? "" : "s"}
          </Typography>
          <Typography variant="body2" sx={{ color: theme.app.dashboard.textMuted, mt: 0.25 }}>
            {overdueCount > 0
              ? `${overdueCount} overdue · ${pendingCount} pending`
              : `${pendingCount} pending — use Pay on each row below.`}
          </Typography>
        </Box>
      ) : (
        <Typography variant="body2" sx={{ color: theme.app.dashboard.textMuted }}>
          No pending invoices right now.
        </Typography>
      )}
    </DashboardCard>
  );
}
