"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Phone from "@mui/icons-material/Phone";
import Box from "@mui/material/Box";
import Switch from "@mui/material/Switch";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { Button, InputField, Typography } from "@/components/common";
import { gradientPrimaryButtonSx } from "@/components/common/Button/Button.styles";
import { AddIpBlockWizardShell } from "@/features/ip-block";

export default function AddIpBlockConfigurePage() {
  const router = useRouter();
  const theme = useTheme() as AppTheme;
  const [ipAddress, setIpAddress] = useState("122.2432.342");
  const [reason, setReason] = useState("");
  const [ruleOn, setRuleOn] = useState(true);

  return (
    <AddIpBlockWizardShell
      step={2}
      cardTitle="IP Block Configuration"
      footer={
        <>
          <Button type="button" variant="secondary" onClick={() => router.push("/dashboard/ip-block-list/add")}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="primary"
            sx={gradientPrimaryButtonSx}
            onClick={() => router.push("/dashboard/ip-block-list/add/details")}
          >
            Block IP
          </Button>
        </>
      }
    >
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <InputField
          label="IP Address"
          name="ipAddress"
          value={ipAddress}
          onChange={(e) => setIpAddress(e.target.value)}
        />
        <InputField
          label="Reason (Optional)"
          name="reason"
          placeholder="E.g. Spam message detected , suspicious login....."
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
      </Box>

      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 2,
          p: 2,
          borderRadius: 2,
          border: `1px solid ${theme.app.dashboard.cardBorder}`,
          bgcolor: theme.app.dashboard.overlayMedium,
        }}
      >
        <Box
          sx={{
            width: 44,
            height: 44,
            borderRadius: "50%",
            bgcolor: theme.app.dashboard.overlayLight,
            border: `1px solid ${theme.app.dashboard.cardBorder}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
          aria-hidden
        >
          <Phone sx={{ fontSize: 22, color: theme.app.dashboard.textMuted }} />
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="mediumLarge" component="p" sx={{ mb: 0.25, color: theme.app.text.primary }}>
            Rule Status
          </Typography>
          <Typography variant="medium" sx={{ color: theme.app.dashboard.textMuted }}>
            Determine if this block rule is active immediately.
          </Typography>
        </Box>
        <Switch
          checked={ruleOn}
          onChange={(_, v) => setRuleOn(v)}
          color="success"
          inputProps={{ "aria-label": "Rule status" }}
        />
      </Box>
    </AddIpBlockWizardShell>
  );
}
