"use client";

import Link from "next/link";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import AccessTimeRounded from "@mui/icons-material/AccessTimeRounded";
import { Typography } from "@/components/common";
import { useAuth } from "@/lib/auth";
import { useMyResellerSubscriptionQuery } from "@/lib/hooks/query/billing/billing";

export function SubscriptionCountdownBanner() {
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
    <Box
      role="status"
      aria-live="polite"
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 2,
        flexWrap: "wrap",
        px: { xs: 1.5, sm: 2 },
        py: 1,
        mb: { xs: 0.5, md: 1 },
        borderRadius: 2,
        border: urgent
          ? "1px solid rgba(248, 113, 113, 0.55)"
          : "1px solid rgba(255, 193, 7, 0.45)",
        bgcolor: urgent ? "rgba(248, 113, 113, 0.12)" : "rgba(255, 193, 7, 0.12)",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, minWidth: 0 }}>
        <AccessTimeRounded
          sx={{
            fontSize: 20,
            color: urgent ? "#f87171" : "#ffc107",
            flexShrink: 0,
          }}
        />
        <Typography variant="body2" color="white" sx={{ minWidth: 0 }}>
          {sub.isExpired ? (
            <>
              <strong>Payment pending</strong> — your platform plan <strong>{sub.planName}</strong>{" "}
              has expired. Pay to renew.
            </>
          ) : (
            <>
              <strong>Payment pending</strong> — platform plan <strong>{sub.planName}</strong> ends on{" "}
              <strong>{sub.endDate}</strong> —{" "}
              <strong>
                {sub.daysRemaining} day{sub.daysRemaining === 1 ? "" : "s"} left
              </strong>
            </>
          )}
        </Typography>
      </Box>
      <Button
        component={Link}
        href="/dashboard/billing"
        size="small"
        variant="outlined"
        sx={{
          flexShrink: 0,
          color: "white",
          borderColor: "rgba(255,255,255,0.35)",
          "&:hover": {
            borderColor: "rgba(255,255,255,0.6)",
            bgcolor: "rgba(255,255,255,0.06)",
          },
        }}
      >
        Pay now
      </Button>
    </Box>
  );
}
