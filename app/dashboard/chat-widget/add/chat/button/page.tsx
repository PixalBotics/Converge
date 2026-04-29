"use client";

import { useRef, useState, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import ChatRounded from "@mui/icons-material/ChatRounded";
import CloudUploadOutlined from "@mui/icons-material/CloudUploadOutlined";
import CropSquareRounded from "@mui/icons-material/CropSquareRounded";
import DeleteOutline from "@mui/icons-material/DeleteOutline";
import Settings from "@mui/icons-material/Settings";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { Button, InputField, SelectField, Typography } from "@/components/common";
import { gradientPrimaryButtonSx } from "@/components/common/Button/Button.styles";
import { WidgetFlowShell } from "@/components/dashboard/WidgetFlowShell";
import { readWidgetDraft, saveWidgetDraft } from "@/lib/chat-widget/widgetDraft";

const STEPS = ["Widget Button Design", "Chat Box Design", "Notifications & Advanced"];

export default function ChatWidgetButtonDesignPage() {
  const router = useRouter();
  const theme = useTheme() as AppTheme;
  const [buttonShape, setButtonShape] = useState<"circle" | "rounded" | "square">("circle");
  const [buttonPosition, setButtonPosition] = useState("right");
  const [selectedButtonColor, setSelectedButtonColor] = useState("#2AA9E0");
  const [selectedHoverColor, setSelectedHoverColor] = useState("#1C8DC2");
  const [selectedIconColor, setSelectedIconColor] = useState("#FFFFFF");
  const [iconFileName, setIconFileName] = useState("");
  const [iconDataUrl, setIconDataUrl] = useState("");
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
    const reader = new FileReader();
    reader.onload = () => setIconDataUrl(typeof reader.result === "string" ? reader.result : "");
    reader.readAsDataURL(file);
  };

  const buttonAlignment = buttonPosition === "left" ? "flex-start" : buttonPosition === "right" ? "flex-end" : "center";
  const buttonRadius = buttonShape === "circle" ? "50%" : buttonShape === "rounded" ? "16px" : "8px";

  const handleNext = () => {
    saveWidgetDraft({
      type: "chat",
      buttonShape,
      buttonPosition: buttonPosition as "left" | "center" | "right",
      buttonColor: selectedButtonColor || "#2AA9E0",
      buttonHoverColor: selectedHoverColor || "#1C8DC2",
      iconColor: selectedIconColor || "#FFFFFF",
      iconDataUrl,
      completed: false,
      widgetId: readWidgetDraft().widgetId || "12345",
    });
    router.push("/dashboard/chat-widget/add/chat/box");
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
          <Button type="button" variant="primary" sx={gradientPrimaryButtonSx} onClick={handleNext}>
            Next
          </Button>
        </>
      }
    >
      <Typography variant="mediumLarge" sx={{ color: theme.app.text.primary, mb: -1.25 }}>Button Shape</Typography>
      <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
        <IconButton onClick={() => setButtonShape("circle")} sx={{ width: 44, height: 44, bgcolor: buttonShape === "circle" ? theme.app.dashboard.accentBlue : theme.app.dashboard.overlayLight }}>
          <DeleteOutline sx={{ fontSize: 18, color: theme.app.text.primary }} />
        </IconButton>
        <IconButton onClick={() => setButtonShape("rounded")} sx={{ width: 44, height: 44, borderRadius: 2, bgcolor: buttonShape === "rounded" ? theme.app.dashboard.accentBlue : theme.app.dashboard.overlayLight }}>
          <Settings sx={{ fontSize: 18, color: theme.app.text.primary }} />
        </IconButton>
        <IconButton onClick={() => setButtonShape("square")} sx={{ width: 44, height: 44, borderRadius: 1, bgcolor: buttonShape === "square" ? theme.app.dashboard.accentBlue : theme.app.dashboard.overlayLight }}>
          <CropSquareRounded sx={{ fontSize: 18, color: theme.app.text.primary }} />
        </IconButton>
      </Box>

      <Typography variant="body2" sx={{ color: theme.app.dashboard.textMuted, mt: -0.75, mb: 0.5 }}>
        {buttonShape === "circle" ? "Circle" : buttonShape === "rounded" ? "Rounded" : "Square"}
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

      <Typography variant="mediumLarge" sx={{ color: theme.app.text.primary, mb: -1.25 }}>Button Hover</Typography>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
        <Box
          component="input"
          type="color"
          value={selectedHoverColor || "#000000"}
          onChange={(event: ChangeEvent<HTMLInputElement>) => setSelectedHoverColor(event.target.value)}
          aria-label="Choose hover color"
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
          Hover color
        </Typography>
      </Box>
      <InputField label="Hover Hex" name="hoverHexColor" value={selectedHoverColor} onChange={(event) => setSelectedHoverColor(event.target.value)} />

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

      <Typography variant="mediumLarge" sx={{ color: theme.app.text.primary, mb: -1.25 }}>Icon Color</Typography>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
        <Box
          component="input"
          type="color"
          value={selectedIconColor || "#FFFFFF"}
          onChange={(event: ChangeEvent<HTMLInputElement>) => setSelectedIconColor(event.target.value)}
          aria-label="Choose icon color"
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
          Choose icon color
        </Typography>
      </Box>
      <InputField
        label="Icon Hex"
        name="iconHexColor"
        value={selectedIconColor}
        onChange={(event) => setSelectedIconColor(event.target.value)}
      />

      <SelectField
        label="Button Position"
        value={buttonPosition}
        onChange={setButtonPosition}
        options={[{ label: "Left", value: "left" }, { label: "Right", value: "right" }]}
      />

      <Typography variant="mediumLarge" sx={{ color: theme.app.text.primary, mt: 0.5, mb: -0.5 }}>
        Live Preview
      </Typography>
      <Box
        sx={{
          border: `1px solid ${theme.app.dashboard.cardBorder}`,
          borderRadius: 3,
          p: 2,
          minHeight: 250,
          bgcolor: "rgba(6, 12, 54, 0.45)",
        }}
      >
        <Box
          sx={{
            borderRadius: 2.5,
            border: `1px solid ${theme.app.dashboard.cardBorder}`,
            bgcolor: "#E5EAF2",
            minHeight: 170,
            p: 1.5,
            display: "flex",
            alignItems: "flex-end",
            justifyContent: buttonAlignment,
          }}
        >
          <Box
            sx={{
              width: 52,
              height: 52,
              borderRadius: buttonRadius,
              bgcolor: selectedButtonColor || "#2AA9E0",
              boxShadow: "0 8px 18px rgba(7, 27, 73, 0.35)",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "transform 0.2s ease, background-color 0.2s ease, box-shadow 0.2s ease",
              "&:hover": {
                bgcolor: selectedHoverColor || "#1C8DC2",
                transform: "translateY(-2px) scale(1.04)",
                boxShadow: "0 16px 30px rgba(7, 27, 73, 0.56), 0 0 0 3px rgba(255, 255, 255, 0.16)",
              },
            }}
          >
            {iconDataUrl ? (
              <Box
                component="img"
                src={iconDataUrl}
                alt="Custom widget icon"
                sx={{ width: 26, height: 26, objectFit: "contain" }}
              />
            ) : (
              <ChatRounded sx={{ color: selectedIconColor || "#FFFFFF", fontSize: 26 }} />
            )}
          </Box>
        </Box>
      </Box>
    </WidgetFlowShell>
  );
}
