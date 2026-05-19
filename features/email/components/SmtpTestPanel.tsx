"use client";

import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import CheckCircleOutline from "@mui/icons-material/CheckCircleOutline";
import ErrorOutline from "@mui/icons-material/ErrorOutline";
import { Button, InputField, Typography } from "@/components/common";
import { EmailTestPanelCard } from "../styles/email-configuration.styled";

export function SmtpTestPanel({
  toEmail,
  onToEmailChange,
  onTest,
  testing,
  disabled,
  lastTestStatus,
  lastTestedAt,
}: {
  toEmail: string;
  onToEmailChange: (value: string) => void;
  onTest: () => void;
  testing?: boolean;
  disabled?: boolean;
  lastTestStatus?: "success" | "failed" | null;
  lastTestedAt?: string | null;
}) {
  const theme = useTheme() as AppTheme;

  return (
    <EmailTestPanelCard>
      <InputField
        label="Send test to (optional)"
        name="testToEmail"
        type="email"
        placeholder="Leave empty to use your login email"
        value={toEmail}
        onChange={(e) => onToEmailChange(e.target.value)}
        disabled={disabled || testing}
      />
      <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <Button type="button" variant="secondary" onClick={onTest} disabled={disabled || testing}>
          {testing ? "Sending…" : "Send test email"}
        </Button>
        {lastTestStatus === "success" ? (
          <StatusLine
            theme={theme}
            icon={<CheckCircleOutline sx={{ fontSize: 18 }} />}
            color={theme.palette.success.main}
            text={`Last test passed${lastTestedAt ? ` · ${new Date(lastTestedAt).toLocaleString()}` : ""}`}
          />
        ) : lastTestStatus === "failed" ? (
          <StatusLine
            theme={theme}
            icon={<ErrorOutline sx={{ fontSize: 18 }} />}
            color={theme.palette.error.main}
            text={`Last test failed${lastTestedAt ? ` · ${new Date(lastTestedAt).toLocaleString()}` : ""}`}
          />
        ) : null}
      </div>
    </EmailTestPanelCard>
  );
}

function StatusLine({
  theme,
  icon,
  color,
  text,
}: {
  theme: AppTheme;
  icon: React.ReactNode;
  color: string;
  text: string;
}) {
  return (
    <Typography
      variant="small"
      sx={{ color, fontWeight: 600, display: "flex", alignItems: "center", gap: 0.5 }}
    >
      {icon}
      {text}
    </Typography>
  );
}
