"use client";

import { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Collapse from "@mui/material/Collapse";
import { alpha, useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { Button, InputField, Typography } from "@/components/common";
import type { WebsiteBillingPreviewLine } from "@/api/billing/agency-billing-contract.api";
import { usePutWebsiteBillingProfileMutation } from "@/lib/hooks/query/billing/billing";
import { publishAppToast } from "@/lib/notify";
import { extractApiErrorMessageForToast } from "@/lib/notify/extract-api-message";
import { WebsiteBillingStatusBadge } from "@/features/billing/components/WebsiteBillingStatusBadge";
import { clientInvoiceLineParts } from "@/lib/billing/client-invoice-lines";

type Props = {
  row: WebsiteBillingPreviewLine;
  currency: string;
  index: number;
  onSaved: () => void;
};

function money(currency: string, amount: number) {
  return `${currency} ${amount.toFixed(2)}`;
}

export function WebsiteRateEditorRow({ row, currency, index, onSaved }: Props) {
  const theme = useTheme() as AppTheme;
  const putMutation = usePutWebsiteBillingProfileMutation();
  const [open, setOpen] = useState(false);
  const [costPerChat, setCostPerChat] = useState(String(row.costPerChat));
  const [freeChats, setFreeChats] = useState(String(row.freeChatsPerMonth));
  const [monthlyChats, setMonthlyChats] = useState(
    row.monthlyChatsPerSite != null ? String(row.monthlyChatsPerSite) : "",
  );
  const [platformFee, setPlatformFee] = useState(String(row.platformFeeMonthly));
  const [aiToolsFee, setAiToolsFee] = useState(String(row.aiToolsMonthly));
  const [softwareFee, setSoftwareFee] = useState(String(row.modulesFeeMonthly));

  useEffect(() => {
    setCostPerChat(String(row.costPerChat));
    setFreeChats(String(row.freeChatsPerMonth));
    setMonthlyChats(row.monthlyChatsPerSite != null ? String(row.monthlyChatsPerSite) : "");
    setPlatformFee(String(row.platformFeeMonthly));
    setAiToolsFee(String(row.aiToolsMonthly));
    setSoftwareFee(String(row.modulesFeeMonthly));
  }, [row]);

  const parts = clientInvoiceLineParts(row);

  const handleSave = async () => {
    try {
      await putMutation.mutateAsync({
        websiteId: row.websiteId,
        costPerChat: Number(costPerChat) || 0,
        freeChatsPerMonth: Number(freeChats) || 0,
        monthlyChatsPerSite: monthlyChats.trim() ? Number(monthlyChats) || 0 : undefined,
        platformFeeMonthly: Number(platformFee) || 0,
        aiToolsMonthly: Number(aiToolsFee) || 0,
        modulesFeeMonthly: Number(softwareFee) || 0,
        currency,
      });
      publishAppToast({ message: "Website rates saved.", variant: "success" });
      onSaved();
    } catch (err) {
      publishAppToast({
        message: extractApiErrorMessageForToast(err) ?? "Could not save website rates.",
        variant: "error",
      });
    }
  };

  return (
    <Box
      sx={{
        py: 1.25,
        px: 1.5,
        borderBottom: `1px solid ${alpha(theme.app.dashboard.cardBorder, 0.5)}`,
        "&:last-child": { borderBottom: "none" },
      }}
    >
      <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 1, mb: 0.75 }}>
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 1, mb: 0.35 }}>
            <Typography variant="body2" fontWeight={600} sx={{ color: theme.app.text.primary }}>
              Site {index + 1}: {row.websiteUrl.replace(/^https?:\/\//i, "")}
            </Typography>
            <WebsiteBillingStatusBadge
              status={row.billingStatus}
              trialEndDate={row.trialEndDate}
              graceEndDate={row.graceEndDate}
            />
          </Box>
          <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted }}>
            {row.childCompanyName} · {parts.chargeableChats} chargeable / {parts.billableChats} billable chats
          </Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Typography variant="body2" fontWeight={700} sx={{ color: theme.app.text.primary, whiteSpace: "nowrap" }}>
            {money(currency, row.lineTotal)}
          </Typography>
          <Button size="small" variant="secondary" onClick={() => setOpen((v) => !v)}>
            {open ? "Hide rates" : "Edit rates"}
          </Button>
        </Box>
      </Box>
      <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted, display: "block", mb: open ? 1 : 0 }}>
        Software package: {money(currency, parts.softwarePackage)} · Support fee: {money(currency, parts.supportFee)} · Chat usage:{" "}
        {money(currency, parts.chatUsage)}
      </Typography>
      <Collapse in={open}>
        <Box
          sx={{
            mt: 1,
            p: 1.5,
            borderRadius: 2,
            border: `1px solid ${alpha(theme.app.dashboard.cardBorder, 0.7)}`,
            bgcolor: alpha(theme.app.dashboard.cardBorder, 0.08),
          }}
        >
          <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted, display: "block", mb: 1 }}>
            Per-website rates (override agency defaults for this site only).
          </Typography>
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" }, gap: 1, mb: 1 }}>
            <InputField label="Chat price" value={costPerChat} onChange={(e) => setCostPerChat(e.target.value)} />
            <InputField label="Free chats / month" value={freeChats} onChange={(e) => setFreeChats(e.target.value)} />
            <InputField
              label="Monthly chats"
              value={monthlyChats}
              onChange={(e) => setMonthlyChats(e.target.value)}
              placeholder="e.g. 500"
            />
            <InputField label="Support fee / month" value={platformFee} onChange={(e) => setPlatformFee(e.target.value)} />
            <InputField label="AI support fee / month" value={aiToolsFee} onChange={(e) => setAiToolsFee(e.target.value)} />
            <InputField label="Software package / month" value={softwareFee} onChange={(e) => setSoftwareFee(e.target.value)} />
          </Box>
          <Button size="small" variant="primary" onClick={() => void handleSave()} disabled={putMutation.isPending}>
            Save website rates
          </Button>
        </Box>
      </Collapse>
    </Box>
  );
}
