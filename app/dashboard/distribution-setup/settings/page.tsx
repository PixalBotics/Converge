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
import { DistributionWizardShell } from "@/components/dashboard/DistributionWizardShell";

type DistributionMethod = "Email" | "CRM" | "Both";

export default function DistributionSettingsPage() {
  const router = useRouter();
  const theme = useTheme() as AppTheme;
  const [subject, setSubject] = useState("");
  const [method, setMethod] = useState<DistributionMethod>("Email");

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

  const methodOptions: { value: DistributionMethod; label: string }[] = [
    { value: "Email", label: "Email" },
    { value: "CRM", label: "CRM" },
    { value: "Both", label: "Both" },
  ];

  return (
    <DistributionWizardShell
      step={2}
      cardTitle="Distribution Settings"
      footer={
        <>
          <Button type="button" variant="secondary" onClick={() => router.push("/dashboard/distribution-setup")}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="primary"
            sx={gradientPrimaryButtonSx}
            onClick={() => router.push("/dashboard/distribution-setup/table")}
          >
            Next
          </Button>
        </>
      }
    >
      <InputField
        label="Subject"
        name="subject"
        placeholder="Example: Chat Transcript - [Company] - [Department]"
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
      />

      <Box sx={{ mt: 0.5 }}>
        <Typography
          id="distribution-method-label"
          variant="mediumLarge"
          component="p"
          sx={{ mb: 0.75, color: theme.app.text.primary }}
        >
          Distribution Method
        </Typography>
        <RadioGroup
          row
          value={method}
          onChange={(e) => setMethod(e.target.value as DistributionMethod)}
          aria-labelledby="distribution-method-label"
          sx={{ gap: { xs: 2, sm: 4 }, flexWrap: "wrap" }}
        >
          {methodOptions.map((opt) => (
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
                  sx={{ color: method === opt.value ? primary : muted, fontWeight: method === opt.value ? 600 : 500 }}
                >
                  {opt.label}
                </Typography>
              }
              sx={{ mr: 0, gap: 1, alignItems: "center" }}
            />
          ))}
        </RadioGroup>
      </Box>
    </DistributionWizardShell>
  );
}
