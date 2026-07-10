"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Box from "@mui/material/Box";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { Button, DashboardCard, Typography } from "@/components/common";
import { useAuth } from "@/lib/auth";
import {
  useCreateResellerCheckoutMutation,
  useMyResellerSubscriptionQuery,
} from "@/lib/hooks/query/billing/billing";
import { publishAppToast } from "@/lib/notify";
import { extractApiErrorMessageForToast } from "@/lib/notify/extract-api-message";

export function BillingSubscriptionPanel() {
  const theme = useTheme() as AppTheme;
  const searchParams = useSearchParams();
  const { isPlatformAdmin, user } = useAuth();
  const isResellerAdmin = user?.wideResellerScope === true && !isPlatformAdmin;

  const subscriptionQuery = useMyResellerSubscriptionQuery({
    enabled: isResellerAdmin,
    refetchInterval: searchParams.get("checkout") === "success" ? 5000 : false,
  });
  const checkoutMutation = useCreateResellerCheckoutMutation();

  const sub = subscriptionQuery.data?.data;
  const checkoutSuccess = searchParams.get("checkout") === "success";
  const paymentPending = Boolean(sub?.paymentPending ?? sub?.showCountdown ?? sub?.isExpired);

  useEffect(() => {
    if (checkoutSuccess && sub && !sub.isExpired) {
      publishAppToast({
        message: "Payment received — your plan will renew shortly.",
        variant: "success",
      });
    }
  }, [checkoutSuccess, sub]);

  if (isPlatformAdmin) {
    return (
      <DashboardCard sx={{ p: 2, mb: 0 }}>
        <Typography fontWeight={700} color="white" sx={{ mb: 1 }}>
          Platform billing setup
        </Typography>
        <Typography variant="body2" sx={{ color: theme.app.dashboard.textMuted, mb: 1.5 }}>
          Configure Stripe and assign reseller subscription plans.
        </Typography>
        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
          <Button component={Link} href="/dashboard/billing/payments" variant="secondary" size="small">
            Payment setup
          </Button>
          <Button
            component={Link}
            href="/dashboard/billing/reseller-subscriptions"
            variant="secondary"
            size="small"
          >
            Reseller plans
          </Button>
          <Button component={Link} href="/dashboard/billing/website-contracts" variant="secondary" size="small">
            Contracts
          </Button>
        </Box>
      </DashboardCard>
    );
  }

  if (!isResellerAdmin) return null;

  if (subscriptionQuery.isLoading) {
    return (
      <DashboardCard sx={{ p: 2 }}>
        <Typography sx={{ color: theme.app.dashboard.textMuted }}>Loading subscription…</Typography>
      </DashboardCard>
    );
  }

  if (!sub) {
    return (
      <DashboardCard sx={{ p: 2 }}>
        <Typography color="white" fontWeight={600}>
          No platform subscription assigned
        </Typography>
        <Typography variant="body2" sx={{ color: theme.app.dashboard.textMuted, mt: 0.5 }}>
          Contact platform support to activate your reseller plan.
        </Typography>
      </DashboardCard>
    );
  }

  const handlePay = async () => {
    try {
      const res = await checkoutMutation.mutateAsync();
      const url = res.data.checkoutUrl;
      if (!url) {
        publishAppToast({ message: "Checkout URL not available.", variant: "error" });
        return;
      }
      window.location.href = url;
    } catch (err) {
      publishAppToast({
        message: extractApiErrorMessageForToast(err) ?? "Could not start checkout.",
        variant: "error",
      });
    }
  };

  return (
    <DashboardCard
      sx={{
        p: 2,
        ...(paymentPending
          ? {
              border: sub.isExpired
                ? "1px solid rgba(248,113,113,0.45)"
                : "1px solid rgba(255,193,7,0.4)",
              bgcolor: sub.isExpired ? "rgba(248,113,113,0.08)" : "rgba(255,193,7,0.08)",
            }
          : {}),
      }}
    >
      <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2, flexWrap: "wrap", alignItems: "flex-start" }}>
        <Box sx={{ flex: 1, minWidth: 280 }}>
          <Typography fontWeight={700} color="white">
            Your payment to platform
          </Typography>
          <Box
            sx={{
              mt: 1,
              p: 1.25,
              borderRadius: 1.5,
              border: `1px solid ${theme.app.dashboard.cardBorder}`,
              bgcolor: "rgba(255,255,255,0.02)",
              display: "grid",
              gap: 0.5,
            }}
          >
            <Typography variant="body2" sx={{ color: theme.app.dashboard.textMuted }}>
              Plan: <strong style={{ color: "white" }}>{sub.planName}</strong> · {sub.billingCycle} · ends {sub.endDate}
            </Typography>
            <Typography variant="body2" sx={{ color: theme.app.dashboard.textMuted }}>
              Base {sub.currency} {sub.basePrice ?? "0"}
              {sub.modules?.length
                ? ` + modules ${sub.currency} ${sub.modulesTotal ?? "0"}`
                : ""}{" "}
              = <strong style={{ color: "white" }}>{sub.currency} {sub.price}</strong>
            </Typography>
          </Box>
          {sub.modules?.length ? (
            <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted, display: "block", mt: 0.75 }}>
              Modules: {sub.modules.map((m) => m.name).join(", ")}
            </Typography>
          ) : null}
          {checkoutSuccess ? (
            <Typography variant="body2" sx={{ color: "#4ade80", mt: 0.75, fontWeight: 600 }}>
              Payment processing — plan renews via Stripe webhook.
            </Typography>
          ) : null}
          {paymentPending ? (
            <Typography
              variant="body2"
              sx={{
                color: sub.isExpired ? "#f87171" : "#ffc107",
                mt: 0.75,
                fontWeight: 700,
              }}
            >
              {sub.isExpired
                ? "Payment pending — your platform plan has expired. Pay to renew."
                : sub.daysRemaining <= 1
                  ? "Payment pending — 1 day left on your platform plan."
                  : `Payment pending — ${sub.daysRemaining} days left on your platform plan.`}
            </Typography>
          ) : (
            <Typography variant="body2" sx={{ color: theme.app.dashboard.textMuted, mt: 0.75 }}>
              Status: {sub.status}
            </Typography>
          )}
        </Box>
        <Box sx={{ display: "flex", gap: 1, alignItems: "center", flexWrap: "wrap" }}>
          <Button
            variant="primary"
            onClick={() => void handlePay()}
            disabled={checkoutMutation.isPending}
            size="small"
            sx={{ minWidth: 128, borderRadius: 1.5, alignSelf: "flex-start" }}
          >
            {paymentPending ? "Pay now" : "Pay / renew"}
          </Button>
        </Box>
      </Box>
    </DashboardCard>
  );
}
