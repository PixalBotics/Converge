"use client";

import Box from "@mui/material/Box";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { Typography } from "@/components/common";
import { pageWrapper } from "@/app/dashboard/companies/overview.styles";
import { useAuth } from "@/lib/auth";
import { BillingBackButton } from "@/features/billing/components/BillingBackButton";
import { ResellerStripeSetupPanel } from "@/features/billing/components/ResellerStripeSetupPanel";

export function StripeConnectPageClient() {
  const theme = useTheme() as AppTheme;
  const { user } = useAuth();
  const resellerId = user?.resellerId?.trim() ?? "";

  if (!resellerId) {
    return (
      <Box sx={pageWrapper}>
        <Typography sx={{ color: theme.app.dashboard.textMuted }}>
          Reseller scope required for payment setup.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={pageWrapper}>
      <BillingBackButton href="/dashboard/billing/payments" label="← Back to payment setup" />
      <Typography variant="regularLarge" fontWeight={700} color="white" sx={{ mb: 0.5 }}>
        Agency payment setup
      </Typography>
      <Typography variant="body2" sx={{ color: theme.app.dashboard.textMuted, mb: 2, maxWidth: 720, lineHeight: 1.6 }}>
        Add your Stripe publishable and secret keys, then configure your agency webhook at
        /pay/your-agency-name — separate from the platform webhook.
      </Typography>

      <ResellerStripeSetupPanel resellerId={resellerId} />
    </Box>
  );
}
