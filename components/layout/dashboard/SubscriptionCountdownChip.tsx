"use client";

import Link from "next/link";
import Chip from "@mui/material/Chip";
import { useAuth } from "@/lib/auth";
import { useMyResellerSubscriptionQuery } from "@/lib/hooks/query/billing/billing";

export function SubscriptionCountdownChip() {
  const { user, isPlatformAdmin } = useAuth();
  const isResellerAdmin = user?.wideResellerScope === true && !isPlatformAdmin;

  const subscriptionQuery = useMyResellerSubscriptionQuery({
    enabled: isResellerAdmin,
    refetchInterval: 60_000,
  });

  if (!isResellerAdmin) return null;

  const sub = subscriptionQuery.data?.data;
  const paymentPending = Boolean(sub?.paymentPending ?? sub?.showCountdown ?? sub?.isExpired);
  if (!sub || !paymentPending) return null;

  const urgent = Boolean(sub.isExpired || sub.daysRemaining <= 1);

  return (
    <Chip
      component={Link}
      href="/dashboard/billing"
      clickable
      size="small"
      label={sub.isExpired ? "Payment pending" : `${sub.daysRemaining}d left`}
      sx={{
        fontWeight: 700,
        color: "white",
        bgcolor: urgent ? "rgba(248,113,113,0.25)" : "rgba(255,193,7,0.2)",
        border: urgent
          ? "1px solid rgba(248,113,113,0.55)"
          : "1px solid rgba(255,193,7,0.45)",
        "&:hover": {
          bgcolor: urgent ? "rgba(248,113,113,0.35)" : "rgba(255,193,7,0.3)",
        },
      }}
    />
  );
}
