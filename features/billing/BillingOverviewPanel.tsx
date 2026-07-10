"use client";

import Link from "next/link";
import Box from "@mui/material/Box";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { Button, DashboardCard, Typography } from "@/components/common";
import { gradientPrimaryButtonSx } from "@/components/common/Button/Button.styles";
import { useAuth } from "@/lib/auth";
import { usePlatformStripeConfigQuery } from "@/lib/hooks/query/billing/billing";
import { getPlatformPaymentSetupStatus } from "@/lib/billing/stripe-setup-status";
import { StripeStatusBadge } from "@/features/billing/components/StripeStatusBadge";
import {
  billingOverviewActionCardSx,
  billingOverviewActionDescSx,
  billingOverviewActionTitleSx,
  billingOverviewCardSx,
  billingOverviewNavSx,
} from "@/app/dashboard/billing/billing.styles";
import { mergeSx } from "@/lib/mui/merge-sx";

type ActionCardProps = {
  title: string;
  description: string;
  href: string;
  buttonLabel: string;
  primary?: boolean;
};

function ActionCard({ title, description, href, buttonLabel, primary = false }: ActionCardProps) {
  return (
    <Box sx={billingOverviewActionCardSx}>
      <Typography sx={billingOverviewActionTitleSx}>{title}</Typography>
      <Typography sx={billingOverviewActionDescSx}>{description}</Typography>
      <Button
        component={Link}
        href={href}
        variant={primary ? "primary" : "secondary"}
        size="small"
        sx={primary ? (gradientPrimaryButtonSx as object) : { alignSelf: "flex-start" }}
      >
        {buttonLabel}
      </Button>
    </Box>
  );
}

export function BillingOverviewPanel() {
  const theme = useTheme() as AppTheme;
  const { isPlatformAdmin } = useAuth();
  const stripeQuery = usePlatformStripeConfigQuery({ enabled: isPlatformAdmin });

  if (!isPlatformAdmin) return null;

  const stripe = stripeQuery.data?.data;
  const paymentStatus = getPlatformPaymentSetupStatus(stripe);

  return (
    <DashboardCard sx={billingOverviewCardSx}>
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 1.5,
          mb: 2,
        }}
      >
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="regularLarge" fontWeight={700} sx={{ color: theme.app.text.primary, mb: 0.5 }}>
            Billing & payments
          </Typography>
          <Typography variant="body2" sx={{ color: theme.app.dashboard.textMuted, maxWidth: 640 }}>
            Configure Stripe, agency contract rates, and combined client invoices — one professional billing flow.
          </Typography>
        </Box>
        <StripeStatusBadge
          label={paymentStatus.label}
          ok={paymentStatus.ok}
          tone={paymentStatus.tone}
        />
      </Box>

      <Box
        sx={mergeSx(billingOverviewNavSx, {
          gridTemplateColumns: { xs: "1fr", md: "repeat(2, minmax(0, 1fr))" },
        })}
      >
        <ActionCard
          title="Payment setup"
          description="Stripe keys, webhook, and checkout — complete payment configuration on one page."
          href="/dashboard/billing/payments"
          buttonLabel="Open payment setup →"
          primary={!paymentStatus.ok}
        />
        <ActionCard
          title="Agency contracts"
          description="Set rates once. Each client (parent company) gets one monthly invoice with a line for every website."
          href="/dashboard/billing/website-contracts"
          buttonLabel="Set rates & invoice →"
        />
      </Box>
    </DashboardCard>
  );
}
