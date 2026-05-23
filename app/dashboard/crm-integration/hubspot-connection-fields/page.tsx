"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import FormControlLabel from "@mui/material/FormControlLabel";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { Button, InputField, Typography } from "@/components/common";
import { gradientPrimaryButtonSx } from "@/components/common/Button/Button.styles";
import { CrmIntegrationWizardShell } from "@/features/crm-integration";
import { smtpWizardFormGrid2 } from "../../smtp-email-integration/wizard.styles";

type SyncOption = "objectTypeSync" | "deal" | "token";

export default function HubSpotConnectionFieldsPage() {
  const router = useRouter();
  const theme = useTheme() as AppTheme;
  const [apiToken, setApiToken] = useState("Zoho CRM");
  const [portalId, setPortalId] = useState("Zoho CRM");
  const [syncType, setSyncType] = useState<SyncOption>("objectTypeSync");

  const primary = theme.palette.primary.main;
  const muted = theme.app.dashboard.textMuted;
  const inactiveBorder = theme.app.dashboard.radioInactiveBorder;

  const radioIcon = (
    <Box
      sx={{
        width: 18,
        height: 18,
        borderRadius: "50%",
        border: `2px solid ${inactiveBorder}`,
        boxSizing: "border-box",
      }}
    />
  );
  const radioChecked = (
    <Box
      sx={{
        width: 18,
        height: 18,
        borderRadius: "50%",
        border: `2px solid ${primary}`,
        boxSizing: "border-box",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Box sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: primary }} />
    </Box>
  );

  const options: { value: SyncOption; label: string }[] = [
    { value: "objectTypeSync", label: "Object Type Sync" },
    { value: "deal", label: "Deal" },
    { value: "token", label: "Token" },
  ];

  return (
    <CrmIntegrationWizardShell
      step={3}
      cardTitle="HubSpot Connection Fields"
      footer={
        <>
          <Button type="button" variant="secondary" onClick={() => {}}>
            Test Connection
          </Button>
          <Button
            type="button"
            variant="primary"
            sx={gradientPrimaryButtonSx}
            onClick={() => router.push("/dashboard")}
          >
            Save Integration
          </Button>
        </>
      }
    >
      <Box sx={smtpWizardFormGrid2}>
        <InputField
          label="API Token"
          name="apiToken"
          value={apiToken}
          onChange={(e) => setApiToken(e.target.value)}
        />
        <InputField
          label="Portal ID"
          name="portalId"
          value={portalId}
          onChange={(e) => setPortalId(e.target.value)}
        />
      </Box>

      <Box sx={{ mt: 0.5 }}>
        <Typography
          id="crm-sync-type-label"
          variant="mediumLarge"
          component="p"
          sx={{ mb: 0.75, color: theme.app.text.primary }}
        >
          Encryption Type
        </Typography>
        <RadioGroup
          row
          value={syncType}
          onChange={(e) => setSyncType(e.target.value as SyncOption)}
          aria-labelledby="crm-sync-type-label"
          sx={{ gap: { xs: 2, sm: 4 }, flexWrap: "wrap" }}
        >
          {options.map((opt) => (
            <FormControlLabel
              key={opt.value}
              value={opt.value}
              control={
                <Radio
                  disableRipple
                  icon={radioIcon}
                  checkedIcon={radioChecked}
                  sx={{ p: 0.75 }}
                />
              }
              label={
                <Typography
                  variant="medium"
                  sx={{
                    color: syncType === opt.value ? primary : muted,
                    fontWeight: syncType === opt.value ? 600 : 500,
                  }}
                >
                  {opt.label}
                </Typography>
              }
              sx={{ mr: 0, gap: 1, alignItems: "center" }}
            />
          ))}
        </RadioGroup>
      </Box>
    </CrmIntegrationWizardShell>
  );
}
