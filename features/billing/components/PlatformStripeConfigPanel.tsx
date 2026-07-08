"use client";

import { useEffect, useState } from "react";
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
import { getStripeWebhookUrl } from "@/lib/billing/stripe-urls";
import {
  getPlatformPaymentSetupStatus,
  isPlatformStripeApiReady,
  isPlatformStripeWebhookReady,
} from "@/lib/billing/stripe-setup-status";
import {
  useDeletePlatformStripeConfigMutation,
  usePlatformStripeConfigQuery,
  usePutPlatformStripeConfigMutation,
  useTestPlatformStripeConfigMutation,
} from "@/lib/hooks/query/billing/billing";
import { CopyableField } from "@/features/billing/components/CopyableField";
import { StripeStatusBadge } from "@/features/billing/components/StripeStatusBadge";
import { publishAppToast } from "@/lib/notify";
import { extractApiErrorMessageForToast } from "@/lib/notify/extract-api-message";

export function PlatformStripeConfigPanel() {
  const theme = useTheme() as AppTheme;
  const configQuery = usePlatformStripeConfigQuery({ enabled: true });
  const putMutation = usePutPlatformStripeConfigMutation();
  const deleteMutation = useDeletePlatformStripeConfigMutation();
  const testMutation = useTestPlatformStripeConfigMutation();

  const config = configQuery.data?.data;
  const [publishableKey, setPublishableKey] = useState("");
  const [secretKey, setSecretKey] = useState("");
  const [webhookSecret, setWebhookSecret] = useState("");
  const [isEnabled, setIsEnabled] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  const webhookUrl = config?.webhookUrl ?? getStripeWebhookUrl();

  useEffect(() => {
    if (!configQuery.isSuccess || !config || hydrated) return;
    setPublishableKey(config.publishableKey ?? "");
    setIsEnabled(config.isEnabled !== false);
    setHydrated(true);
  }, [config, configQuery.isSuccess, hydrated]);

  const apiReady = isPlatformStripeApiReady(config);
  const webhookReady = isPlatformStripeWebhookReady(config);
  const paymentStatus = getPlatformPaymentSetupStatus(config);

  const handleSave = async () => {
    try {
      await putMutation.mutateAsync({
        publishableKey: publishableKey.trim() || undefined,
        secretKey: secretKey.trim() || undefined,
        webhookSecret: webhookSecret.trim() || undefined,
        isEnabled,
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
    const secret = secretKey.trim();
    if (!secret && !config?.hasSecretKey) {
      publishAppToast({
        message: "Enter your Stripe secret key (sk_...) first, then Test or Save.",
        variant: "error",
      });
      return;
    }
    try {
      await testMutation.mutateAsync(secret ? { secretKey: secret } : undefined);
      publishAppToast({ message: "Stripe connection verified.", variant: "success" });
    } catch (err) {
      publishAppToast({
        message: extractApiErrorMessageForToast(err) ?? "Stripe test failed.",
        variant: "error",
      });
    }
  };

  const handleClear = async () => {
    try {
      await deleteMutation.mutateAsync();
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

  return (
    <DashboardCard sx={{ p: { xs: 2, md: 2.5 }, display: "flex", flexDirection: "column", gap: 2 }}>
      <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "flex-start", justifyContent: "space-between", gap: 1.5 }}>
        <Box>
          <Typography fontWeight={700} sx={{ color: theme.app.text.primary, mb: 0.5 }}>
            Stripe payment configuration
          </Typography>
          <Typography variant="body2" sx={{ color: theme.app.dashboard.textMuted, maxWidth: 640, lineHeight: 1.55 }}>
            Add your Stripe keys and webhook secret here. Checkout sessions use the keys; the webhook marks
            invoices as paid after successful payment.
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

      {config?.lastTestedAt ? (
        <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted }}>
          Last connection test: {config.lastTestStatus ?? "—"} · {new Date(config.lastTestedAt).toLocaleString()}
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
          placeholder={config?.hasSecretKey ? "•••••••• (leave blank to keep)" : "sk_test_... or sk_live_..."}
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

      <Box sx={{ pt: 1, borderTop: `1px solid ${theme.app.dashboard.cardBorder}` }}>
        <Typography fontWeight={600} sx={{ color: theme.app.text.primary, mb: 0.75 }}>
          Webhook (checkout.session.completed)
        </Typography>
        <Typography variant="body2" sx={{ color: theme.app.dashboard.textMuted, mb: 1.5, lineHeight: 1.55 }}>
          In Stripe Dashboard → Developers → Webhooks, add this endpoint URL and paste the signing secret below.
        </Typography>
        <CopyableField label="Webhook endpoint URL" value={webhookUrl} />
        <Box
          sx={{
            mt: 1.5,
            p: 1.5,
            borderRadius: 1.5,
            bgcolor: alpha(theme.app.dashboard.cardBorder, 0.1),
          }}
        >
          <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted }}>
            Subscribe to <strong>checkout.session.completed</strong> so paid invoices update automatically.
          </Typography>
        </Box>
        <Box sx={{ mt: 1.5 }}>
          <InputField
            label="Webhook signing secret"
            type="password"
            value={webhookSecret}
            onChange={(e) => setWebhookSecret(e.target.value)}
            placeholder={config?.hasWebhookSecret ? "•••••••• (leave blank to keep)" : "whsec_..."}
          />
        </Box>
      </Box>

      <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", pt: 0.5 }}>
        <Button variant="primary" onClick={() => void handleSave()} disabled={putMutation.isPending}>
          Save payment settings
        </Button>
        <Button variant="outlined" onClick={() => void handleClear()} disabled={deleteMutation.isPending}>
          Clear keys
        </Button>
      </Box>
    </DashboardCard>
  );
}
