"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import FormControlLabel from "@mui/material/FormControlLabel";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { Button, InputField, Typography } from "@/components/common";
import { gradientPrimaryButtonSx } from "@/components/common/Button/Button.styles";
import { SmtpEmailWizardShell } from "@/features/smtp-email";
import { distributionWizardFormGrid3 } from "../../distribution-setup/wizard.styles";
import { smtpWizardFormGrid2 } from "../wizard.styles";

type EncryptionType = "SSL" | "TLS";

export default function SmtpConfigurationPage() {
  const theme = useTheme() as AppTheme;
  const [smtpHost, setSmtpHost] = useState("smtp.gmail.com");
  const [smtpUsername, setSmtpUsername] = useState("Raja Saif");
  const [smtpPort, setSmtpPort] = useState("853");
  const [smtpPassword, setSmtpPassword] = useState("Saif123@");
  const [fromEmail, setFromEmail] = useState("saif@gmail.com");
  const [encryption, setEncryption] = useState<EncryptionType>("SSL");

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

  const handleSave = () => {
    // Wire to API later
  };

  const handleTest = () => {
    // Wire to API later
  };

  return (
    <SmtpEmailWizardShell
      step={2}
      cardTitle="SMTP Configuration"
      footer={
        <>
          <Button type="button" variant="secondary" onClick={handleSave}>
            Save SMTP
          </Button>
          <Button type="button" variant="primary" sx={gradientPrimaryButtonSx} onClick={handleTest}>
            Test SMTP Connection
          </Button>
        </>
      }
    >
      <Box sx={distributionWizardFormGrid3}>
        <InputField
          label="SMTP Host"
          name="smtpHost"
          value={smtpHost}
          onChange={(e) => setSmtpHost(e.target.value)}
        />
        <InputField
          label="SMTP Username"
          name="smtpUsername"
          value={smtpUsername}
          onChange={(e) => setSmtpUsername(e.target.value)}
        />
        <InputField
          label="SMTP Port"
          name="smtpPort"
          value={smtpPort}
          onChange={(e) => setSmtpPort(e.target.value)}
        />
      </Box>

      <Box sx={smtpWizardFormGrid2}>
        <InputField
          label="SMTP Password"
          name="smtpPassword"
          type="password"
          value={smtpPassword}
          onChange={(e) => setSmtpPassword(e.target.value)}
        />
        <InputField
          label="From Email"
          name="fromEmail"
          type="email"
          value={fromEmail}
          onChange={(e) => setFromEmail(e.target.value)}
        />
      </Box>

      <Box sx={{ mt: 0.5 }}>
        <Typography
          id="smtp-encryption-label"
          variant="mediumLarge"
          component="p"
          sx={{ mb: 0.75, color: theme.app.text.primary }}
        >
          Encryption Type
        </Typography>
        <RadioGroup
          row
          value={encryption}
          onChange={(e) => setEncryption(e.target.value as EncryptionType)}
          aria-labelledby="smtp-encryption-label"
          sx={{ gap: { xs: 2, sm: 4 }, flexWrap: "wrap" }}
        >
          {(
            [
              { value: "SSL" as const, label: "SSL" },
              { value: "TLS" as const, label: "TLS" },
            ] as const
          ).map((opt) => (
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
                    color: encryption === opt.value ? primary : muted,
                    fontWeight: encryption === opt.value ? 600 : 500,
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
    </SmtpEmailWizardShell>
  );
}
