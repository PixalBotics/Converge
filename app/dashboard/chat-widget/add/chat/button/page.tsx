"use client";

import { useRef, useState, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import CloudUploadOutlined from "@mui/icons-material/CloudUploadOutlined";
import DeleteOutline from "@mui/icons-material/DeleteOutline";
import Settings from "@mui/icons-material/Settings";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { Button, InputField, SelectField, Typography } from "@/components/common";
import { gradientPrimaryButtonSx } from "@/components/common/Button/Button.styles";
import { WidgetFlowShell } from "@/components/dashboard/WidgetFlowShell";

const STEPS = ["Widget Button Design", "Chat Box Design", "Notifications & Advanced"];

export default function ChatWidgetButtonDesignPage() {
  const router = useRouter();
  const theme = useTheme() as AppTheme;
  const [buttonShape, setButtonShape] = useState<"circle" | "rounded">("circle");
  const [buttonPosition, setButtonPosition] = useState("center");
  const [selectedButtonColor, setSelectedButtonColor] = useState("#2AA9E0");
  const [iconFileName, setIconFileName] = useState("");
  const iconUploadRef = useRef<HTMLInputElement | null>(null);

  const handlePickColor = (event: ChangeEvent<HTMLInputElement>) => {
    const color = event.target.value;
    if (!color) return;
    setSelectedButtonColor(color);
  };

  const handleHexInput = (event: ChangeEvent<HTMLInputElement>) => {
    const raw = event.target.value.trim();
    if (!raw) {
      setSelectedButtonColor("");
      return;
    }
    const withHash = raw.startsWith("#") ? raw : `#${raw}`;
    setSelectedButtonColor(withHash);
  };

  const handleIconUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setIconFileName(file.name);
  };

  return (
    <WidgetFlowShell
      pageTitle="Widget Customization"
      subtitle="Connect your workflow with industry-leading CRM platform minutes."
      cardTitle="Button Shape"
      stepper={{ labels: STEPS, currentStep: 0 }}
      footer={
        <>
          <Button type="button" variant="secondary" onClick={() => router.push("/dashboard/chat-widget")}>
            Cancel
          </Button>
          <Button type="button" variant="primary" sx={gradientPrimaryButtonSx} onClick={() => router.push("/dashboard/chat-widget/add/chat/box")}>
            Next
          </Button>
        </>
      }
    >
      <Typography variant="mediumLarge" sx={{ color: theme.app.text.primary, mb: -1.25 }}>Button Shape</Typography>
      <Box sx={{ display: "flex", gap: 1.5 }}>
        <IconButton onClick={() => setButtonShape("circle")} sx={{ width: 44, height: 44, bgcolor: buttonShape === "circle" ? theme.app.dashboard.accentBlue : theme.app.dashboard.overlayLight }}>
          <DeleteOutline sx={{ fontSize: 18, color: theme.app.text.primary }} />
        </IconButton>
        <IconButton onClick={() => setButtonShape("rounded")} sx={{ width: 44, height: 44, borderRadius: 2, bgcolor: buttonShape === "rounded" ? theme.app.dashboard.accentBlue : theme.app.dashboard.overlayLight }}>
          <Settings sx={{ fontSize: 18, color: theme.app.text.primary }} />
        </IconButton>
      </Box>

      <Typography variant="body2" sx={{ color: theme.app.dashboard.textMuted, mt: -0.75, mb: 0.5 }}>
        {buttonShape === "circle" ? "Circle" : "Rounded"}
      </Typography>

      <Typography variant="mediumLarge" sx={{ color: theme.app.text.primary, mb: -1.25 }}>Button Color</Typography>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
        <Box
          component="input"
          type="color"
          value={selectedButtonColor || "#000000"}
          onChange={handlePickColor}
          aria-label="Choose color"
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
      <InputField label="Hex" name="hexColor" value={selectedButtonColor} onChange={handleHexInput} />

      <Box
        role="button"
        tabIndex={0}
        onClick={() => iconUploadRef.current?.click()}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            iconUploadRef.current?.click();
          }
        }}
        sx={{
          border: `1px dashed ${theme.app.dashboard.accentBlue}`,
          borderRadius: 1.5,
          py: 2,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "rgba(6, 12, 54, 0.4)",
          gap: 0.75,
          cursor: "pointer",
        }}
      >
        <CloudUploadOutlined sx={{ color: theme.app.dashboard.accentBlue }} />
        <Typography variant="body2" sx={{ color: theme.app.dashboard.textMuted }}>
          Upload SVG icon or icon
        </Typography>
        <Typography variant="body2" sx={{ color: theme.app.dashboard.textMuted }}>
          {iconFileName || "Max 10 MB files are allowed"}
        </Typography>
      </Box>
      <Box component="input" ref={iconUploadRef} type="file" accept=".svg,.png,.jpg,.jpeg,.webp" onChange={handleIconUpload} sx={{ display: "none" }} />

      <SelectField
        label="Button Position"
        value={buttonPosition}
        onChange={setButtonPosition}
        options={[{ label: "Center", value: "center" }, { label: "Left", value: "left" }, { label: "Right", value: "right" }]}
      />
    </WidgetFlowShell>
  );
}
