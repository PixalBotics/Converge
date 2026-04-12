"use client";

import { useRef, useState, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import CloudUploadOutlined from "@mui/icons-material/CloudUploadOutlined";
import Settings from "@mui/icons-material/Settings";
import Box from "@mui/material/Box";
import Switch from "@mui/material/Switch";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { Button, InputField, SelectField, Typography } from "@/components/common";
import { gradientPrimaryButtonSx } from "@/components/common/Button/Button.styles";
import { WidgetFlowShell } from "@/components/dashboard/WidgetFlowShell";

export default function TextUsWidgetPage() {
  const router = useRouter();
  const theme = useTheme() as AppTheme;
  const [position, setPosition] = useState("center");
  const [contentEnabled, setContentEnabled] = useState(true);
  const [buttonColor, setButtonColor] = useState("#da9b2f");
  const [customFieldFileName, setCustomFieldFileName] = useState("");
  const customFieldUploadRef = useRef<HTMLInputElement | null>(null);

  const handlePickColor = (event: ChangeEvent<HTMLInputElement>) => {
    const color = event.target.value;
    if (!color) return;
    setButtonColor(color);
  };

  const handleCustomFieldUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setCustomFieldFileName(file.name);
  };

  return (
    <WidgetFlowShell
      pageTitle="Text Us Widget"
      subtitle="Connect your workflow with industry-leading CRM platform minutes."
      cardTitle="Widget Button Design"
      footer={
        <>
          <Button type="button" variant="secondary" onClick={() => router.push("/dashboard/chat-widget")}>Cancel</Button>
          <Button type="button" variant="primary" sx={gradientPrimaryButtonSx} onClick={() => router.push("/dashboard/chat-widget/add/text/script")}>Save</Button>
        </>
      }
    >
      <Typography variant="mediumLarge" sx={{ color: theme.app.text.primary, mb: -1.25 }}>Button Color</Typography>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
        <Box
          component="input"
          type="color"
          value={buttonColor}
          onChange={handlePickColor}
          sx={{
            width: 44,
            height: 44,
            p: 0,
            border: `1px solid ${theme.app.dashboard.cardBorder}`,
            borderRadius: "4px",
            bgcolor: "transparent",
            cursor: "pointer",
          }}
        />
        <Typography variant="mediumLarge" sx={{ color: theme.app.dashboard.textMuted }}>
          Choose color
        </Typography>
      </Box>
      <InputField label="Hex" name="button-color-hex" value={buttonColor} onChange={(e) => setButtonColor(e.target.value)} />

      <Typography variant="mediumLarge" sx={{ color: theme.app.text.primary, mb: -1.25 }}>Button Icon</Typography>
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.2 }}>
        {Array.from({ length: 12 }).map((_, i) => (
          <Box key={i} sx={{ width: 28, height: 28, borderRadius: "50%", bgcolor: theme.app.dashboard.overlayLight, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
            <Settings sx={{ fontSize: 14, color: theme.app.dashboard.textMuted }} />
          </Box>
        ))}
        <Box sx={{ width: 28, height: 28, borderRadius: "50%", bgcolor: theme.app.dashboard.overlayLight, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
          <Settings sx={{ fontSize: 14, color: theme.app.dashboard.textMuted }} />
        </Box>
      </Box>

      <SelectField label="Button Position" value={position} onChange={setPosition} options={[{ label: "Center", value: "center" }, { label: "Left", value: "left" }, { label: "Right", value: "right" }]} />

      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Typography variant="mediumLarge" sx={{ color: theme.app.text.primary }}>Widget Content</Typography>
        <Switch checked={contentEnabled} onChange={(_, checked) => setContentEnabled(checked)} color="success" />
      </Box>

      <InputField label="Header Title" name="header" value="Special Offer" />
      <InputField label="Welcome Message" name="welcome" value="Get 20% off all premium plans today." inputProps={{ maxLength: 120 }} />

      <Typography variant="mediumLarge" sx={{ color: theme.app.text.primary, mb: -1.25 }}>Visitor Form</Typography>
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 1.5 }}>
        <InputField label="Name" name="name" value="Zino Chat" />
        <InputField label="Email" name="email" value="Zino CRM" />
      </Box>
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 1.5 }}>
        <InputField label="Message" name="message" value="Zino Chat" />
        <InputField label="Phone Number" name="phone" value="Zino CRM" />
      </Box>

      <Box
        role="button"
        tabIndex={0}
        onClick={() => customFieldUploadRef.current?.click()}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            customFieldUploadRef.current?.click();
          }
        }}
        sx={{ border: `1px dashed ${theme.app.dashboard.accentBlue}`, borderRadius: 1.5, py: 2, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", bgcolor: "rgba(6, 12, 54, 0.4)", gap: 0.75, cursor: "pointer" }}
      >
        <CloudUploadOutlined sx={{ color: theme.app.dashboard.accentBlue }} />
        <Typography variant="body2" sx={{ color: theme.app.dashboard.textMuted }}>Add Custom Field</Typography>
        <Typography variant="body2" sx={{ color: theme.app.dashboard.textMuted }}>{customFieldFileName || "Max 10 MB files are allowed"}</Typography>
      </Box>
      <Box component="input" ref={customFieldUploadRef} type="file" onChange={handleCustomFieldUpload} sx={{ display: "none" }} />
    </WidgetFlowShell>
  );
}
