"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import Box from "@mui/material/Box";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { Typography } from "@/components/common";
import { useAuth } from "@/lib/auth";
import { getPublicPayBaseUrl } from "@/lib/billing/stripe-urls";
import { getPlatformPaymentSetupStatus, getResellerPaymentSetupStatus } from "@/lib/billing/stripe-setup-status";
import {
  usePlatformStripeConfigQuery,
  useResellerBillingPolicyQuery,
} from "@/lib/hooks/query/billing/billing";
import { CopyableField } from "@/features/billing/components/CopyableField";
import { PlatformStripeConfigPanel } from "@/features/billing/components/PlatformStripeConfigPanel";
import { ResellerStripeSetupPanel } from "@/features/billing/components/ResellerStripeSetupPanel";
import { StripeStatusBadge } from "@/features/billing/components/StripeStatusBadge";
import { BillingBackButton } from "@/features/billing/components/BillingBackButton";
import {
  paymentAsideCard,
  paymentHeroCard,
  paymentProgressFill,
  paymentProgressTrack,
  paymentQuickLink,
  paymentSetupWrapper,
} from "@/features/billing/payment-setup.styles";
import { mergeSx } from "@/lib/mui/merge-sx";

function ProgressBar({ percent }: { percent: number }) {
  return (
    <Box sx={paymentProgressTrack}>
      <Box sx={mergeSx(paymentProgressFill, { width: `${percent}%` })} />
    </Box>
  );
}

function QuickLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Box component={Link} href={href} sx={paymentQuickLink}>
      {children}
    </Box>
  );
}

export function PaymentSetupPageClient() {
  const theme = useTheme() as AppTheme;
  const app = theme.app;
  const { isPlatformAdmin, user } = useAuth();
  const isResellerAdmin = user?.wideResellerScope === true && !isPlatformAdmin;
  const resellerId = user?.resellerId?.trim() ?? "";

  const stripeQuery = usePlatformStripeConfigQuery({ enabled: isPlatformAdmin });
  const policyQuery = useResellerBillingPolicyQuery(resellerId, {
    enabled: isResellerAdmin && Boolean(resellerId),
  });

  const stripe = stripeQuery.data?.data;
  const policy = policyQuery.data?.data;

  const platformSetupStatus = getPlatformPaymentSetupStatus(stripe);
  const agencySetupStatus = getResellerPaymentSetupStatus(policy);
  const paymentsLive = isPlatformAdmin ? platformSetupStatus.ok : agencySetupStatus.ok;
  const progressPercent = paymentsLive ? 100 : isPlatformAdmin ? 40 : agencySetupStatus.ok ? 100 : 0;

  if (!isPlatformAdmin && !isResellerAdmin) {
    return (
      <Box sx={paymentSetupWrapper}>
        <Typography sx={{ color: app.dashboard.textMuted }}>
          Payment setup is for platform or agency administrators.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={paymentSetupWrapper}>
      <BillingBackButton />
      <Box sx={paymentHeroCard}>
        <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2, flexWrap: "wrap" }}>
          <Box sx={{ maxWidth: 560 }}>
            <Typography variant="regularLarge" fontWeight={800} sx={{ color: app.text.primary, mb: 0.75 }}>
              Payment setup
            </Typography>
            <Typography variant="body2" sx={{ color: app.dashboard.textMuted, lineHeight: 1.6 }}>
              {isPlatformAdmin
                ? "Configure Stripe once on this page — keys, webhook, and checkout — then issue client invoices."
                : "Add your agency Stripe keys and webhook secret. Your webhook URL is unique (/pay/your-agency-name) and separate from the platform."}
            </Typography>
          </Box>
          <Box sx={{ textAlign: { xs: "left", sm: "right" } }}>
            <Typography variant="caption" sx={{ color: app.dashboard.textMuted }}>
              Status
            </Typography>
            <Typography variant="h4" fontWeight={800} sx={{ color: app.text.primary }}>
              {paymentsLive ? "Ready" : "Incomplete"}
            </Typography>
            <StripeStatusBadge
              label={isPlatformAdmin ? platformSetupStatus.label : agencySetupStatus.label}
              ok={paymentsLive}
              tone={paymentsLive ? "success" : "warning"}
              sx={{ mt: 1 }}
            />
          </Box>
        </Box>
        <ProgressBar percent={progressPercent} />
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", lg: "1fr 300px" },
          gap: 3,
          alignItems: "start",
        }}
      >
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
          {isPlatformAdmin ? (
            <PlatformStripeConfigPanel />
          ) : (
            <ResellerStripeSetupPanel resellerId={resellerId} />
          )}
        </Box>

        <Box sx={paymentAsideCard}>
          <Typography fontWeight={700} sx={{ color: app.text.primary, mb: 2 }}>
            Quick links
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1, mb: 2.5 }}>
            {isPlatformAdmin ? (
              <QuickLink href="/dashboard/billing/website-contracts">Agency contracts</QuickLink>
            ) : null}
            <QuickLink href="/dashboard/billing">Invoices</QuickLink>
          </Box>

          <CopyableField label="Client pay link" value={`${getPublicPayBaseUrl()}/<invoice-token>`} />
          <Typography
            variant="caption"
            sx={{ color: app.dashboard.textMuted, mt: 1.5, display: "block", lineHeight: 1.5 }}
          >
            Included in invoice emails. Opens secure Stripe Checkout.
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
