"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Box from "@mui/material/Box";
import { alpha, useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import {
  Button,
  DashboardCard,
  InputField,
  SelectField,
  Typography,
} from "@/components/common";
import { gradientPrimaryButtonSx } from "@/components/common/Button/Button.styles";
import { CopyableField } from "@/features/billing/components/CopyableField";
import { StripeStatusBadge } from "@/features/billing/components/StripeStatusBadge";
import { getPublicPayBaseUrl, getResellerStripeWebhookUrl } from "@/lib/billing/stripe-urls";
import {
  getResellerPaymentSetupStatus,
  isResellerStripeApiReady,
  isResellerStripeWebhookReady,
} from "@/lib/billing/stripe-setup-status";
import {
  useDeleteResellerStripeConfigMutation,
  usePutResellerStripeConfigMutation,
  useResellerBillingPolicyQuery,
  useTestResellerStripeConfigMutation,
} from "@/lib/hooks/query/billing/billing";
import { publishAppToast } from "@/lib/notify";
import { extractApiErrorMessageForToast } from "@/lib/notify/extract-api-message";

type ResellerStripeSetupPanelProps = {
  resellerId: string;
};

export function ResellerStripeSetupPanel({ resellerId }: ResellerStripeSetupPanelProps) {
  const theme = useTheme() as AppTheme;
  const d = theme.app.dashboard;

  const policyQuery = useResellerBillingPolicyQuery(resellerId, {
    enabled: Boolean(resellerId),
  });
  const putMutation = usePutResellerStripeConfigMutation();
  const deleteMutation = useDeleteResellerStripeConfigMutation();
  const testMutation = useTestResellerStripeConfigMutation();

  const policy = policyQuery.data?.data;
  const [publishableKey, setPublishableKey] = useState("");
  const [secretKey, setSecretKey] = useState("");
  const [webhookSecret, setWebhookSecret] = useState("");
  const [isEnabled, setIsEnabled] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  const webhookUrl =
    policy?.webhookUrl ??
    (policy?.webhookSlug ? getResellerStripeWebhookUrl(policy.webhookSlug) : "");

  useEffect(() => {
    if (!policyQuery.isSuccess || !policy || hydrated) return;
    setPublishableKey(policy.publishableKey ?? "");
    setIsEnabled(policy.isEnabled !== false);
    setHydrated(true);
  }, [policy, policyQuery.isSuccess, hydrated]);

  const apiReady = isResellerStripeApiReady(policy);
  const webhookReady = isResellerStripeWebhookReady(policy);
  const paymentStatus = getResellerPaymentSetupStatus(policy);

  const handleSave = async () => {
    if (!resellerId) return;
    try {
      await putMutation.mutateAsync({
        resellerId,
        body: {
          publishableKey: publishableKey.trim() || undefined,
          secretKey: secretKey.trim() || undefined,
          webhookSecret: webhookSecret.trim() || undefined,
          isEnabled,
        },
      });
      setSecretKey("");
      setWebhookSecret("");
      publishAppToast({ message: "Payment settings saved.", variant: "success" });
    } catch (err) {
      publishAppToast({
        message: extractApiErrorMessageForToast(err) ?? "Could not save payment settings.",
        variant: "error",
      });
    }
  };

  const handleTest = async () => {
    if (!resellerId) return;
    const secret = secretKey.trim();
    if (!secret && !policy?.hasSecretKey) {
      publishAppToast({
        message: "Enter your Stripe secret key (sk_...) first, then Test or Save.",
        variant: "error",
      });
      return;
    }
    try {
      await testMutation.mutateAsync({
        resellerId,
        body: secret ? { secretKey: secret } : undefined,
      });
      publishAppToast({ message: "Stripe connection verified.", variant: "success" });
    } catch (err) {
      publishAppToast({
        message: extractApiErrorMessageForToast(err) ?? "Stripe test failed.",
        variant: "error",
      });
    }
  };

  const handleClear = async () => {
    if (!resellerId) return;
    try {
      await deleteMutation.mutateAsync(resellerId);
      setPublishableKey("");
      setSecretKey("");
      setWebhookSecret("");
      setIsEnabled(false);
      setHydrated(false);
      publishAppToast({ message: "Payment settings cleared.", variant: "success" });
    } catch (err) {
      publishAppToast({
        message: extractApiErrorMessageForToast(err) ?? "Could not clear payment settings.",
        variant: "error",
      });
    }
  };

  if (policyQuery.isLoading) {
    return (
      <DashboardCard sx={{ p: 2 }}>
        <Typography sx={{ color: d.textMuted }}>Loading payment setup…</Typography>
      </DashboardCard>
    );
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
      <DashboardCard sx={{ p: { xs: 2, md: 2.5 }, display: "flex", flexDirection: "column", gap: 2 }}>
        <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "flex-start", justifyContent: "space-between", gap: 1.5 }}>
          <Box>
            <Typography fontWeight={700} sx={{ color: theme.app.text.primary, mb: 0.5 }}>
              Agency Stripe payment configuration
            </Typography>
            <Typography variant="body2" sx={{ color: d.textMuted, maxWidth: 640, lineHeight: 1.55 }}>
              Add your own Stripe keys and webhook secret. Client invoice payments go directly to your
              Stripe account — separate from the platform webhook.
            </Typography>
          </Box>
          <StripeStatusBadge
            label={paymentStatus.label}
            ok={paymentStatus.ok}
            tone={paymentStatus.tone}
          />
        </Box>

        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
          <StripeStatusBadge label={apiReady ? "Keys saved" : "Keys missing"} ok={apiReady} />
          <StripeStatusBadge label={webhookReady ? "Webhook saved" : "Webhook missing"} ok={webhookReady} />
        </Box>

        {policy?.lastTestedAt ? (
          <Typography variant="caption" sx={{ color: d.textMuted }}>
            Last connection test: {policy.lastTestStatus ?? "—"} ·{" "}
            {new Date(policy.lastTestedAt).toLocaleString()}
          </Typography>
        ) : null}

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "repeat(2, minmax(0, 1fr))" },
            gap: 2,
          }}
        >
          <InputField
            label="Publishable key"
            value={publishableKey}
            onChange={(e) => setPublishableKey(e.target.value)}
            placeholder="pk_test_... or pk_live_..."
          />
          <InputField
            label="Secret key"
            type="password"
            value={secretKey}
            onChange={(e) => setSecretKey(e.target.value)}
            placeholder={policy?.hasSecretKey ? "•••••••• (leave blank to keep)" : "sk_test_... or sk_live_..."}
          />
        </Box>

        <SelectField
          label="Enable payments"
          value={isEnabled ? "yes" : "no"}
          onChange={(v) => setIsEnabled(v === "yes")}
          options={[
            { value: "yes", label: "Yes — allow checkout" },
            { value: "no", label: "No — disable" },
          ]}
          searchable={false}
        />

        <Button
          variant="secondary"
          onClick={() => void handleTest()}
          disabled={testMutation.isPending}
          sx={{ alignSelf: "flex-start" }}
        >
          Test Stripe connection
        </Button>

        <Box sx={{ pt: 1, borderTop: `1px solid ${d.cardBorder}` }}>
          <Typography fontWeight={600} sx={{ color: theme.app.text.primary, mb: 0.75 }}>
            Webhook (checkout.session.completed)
          </Typography>
          <Typography variant="body2" sx={{ color: d.textMuted, mb: 1.5, lineHeight: 1.55 }}>
            In your Stripe Dashboard → Developers → Webhooks, add this agency-specific endpoint URL
            {policy?.webhookSlug ? ` (/pay/${policy.webhookSlug})` : ""} and paste the signing secret
            below. This URL is unique to your agency and different from the platform webhook.
          </Typography>
          {webhookUrl ? <CopyableField label="Webhook endpoint URL" value={webhookUrl} /> : null}
          <Box
            sx={{
              mt: 1.5,
              p: 1.5,
              borderRadius: 1.5,
              bgcolor: alpha(d.cardBorder, 0.1),
            }}
          >
            <Typography variant="caption" sx={{ color: d.textMuted }}>
              Subscribe to <strong>checkout.session.completed</strong> so paid client invoices update
              automatically.
            </Typography>
          </Box>
          <Box sx={{ mt: 1.5 }}>
            <InputField
              label="Webhook signing secret"
              type="password"
              value={webhookSecret}
              onChange={(e) => setWebhookSecret(e.target.value)}
              placeholder={policy?.hasWebhookSecret ? "•••••••• (leave blank to keep)" : "whsec_..."}
            />
          </Box>
        </Box>

        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", pt: 0.5 }}>
          <Button
            variant="primary"
            onClick={() => void handleSave()}
            disabled={putMutation.isPending}
            sx={gradientPrimaryButtonSx}
          >
            Save payment settings
          </Button>
          <Button variant="outlined" onClick={() => void handleClear()} disabled={deleteMutation.isPending}>
            Clear keys
          </Button>
        </Box>
      </DashboardCard>

      <DashboardCard sx={{ p: { xs: 2, md: 2.5 }, display: "flex", flexDirection: "column", gap: 2 }}>
        <Box>
          <Typography fontWeight={700} sx={{ color: theme.app.text.primary, mb: 0.5 }}>
            Client pay links
          </Typography>
          <Typography variant="body2" sx={{ color: d.textMuted, lineHeight: 1.55, maxWidth: 640 }}>
            Invoice emails include a secure pay link. Payments use your Stripe keys configured above.
          </Typography>
        </Box>

        <CopyableField label="Client pay link (in invoice emails)" value={`${getPublicPayBaseUrl()}/<invoice-token>`} />

        <Button component={Link} href="/dashboard/billing" variant="secondary" size="small" sx={{ alignSelf: "flex-start" }}>
          Go to client invoices →
        </Button>
      </DashboardCard>
    </Box>
  );
}
