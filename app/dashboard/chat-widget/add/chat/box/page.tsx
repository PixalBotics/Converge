"use client";

import { useRef, useState, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import CloudUploadOutlined from "@mui/icons-material/CloudUploadOutlined";
import Box from "@mui/material/Box";
import Switch from "@mui/material/Switch";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { Button, InputField, SelectField, Typography } from "@/components/common";
import { gradientPrimaryButtonSx } from "@/components/common/Button/Button.styles";
import { WidgetFlowShell } from "@/features/chat-widget";

const STEPS = ["Widget Button Design", "Chat Box Design", "Notifications & Advanced"];
export default function ChatWidgetBoxDesignPage() {
  const router = useRouter();
  const theme = useTheme() as AppTheme;
  const [headerTitle, setHeaderTitle] = useState("Center");
  const [bannerOn, setBannerOn] = useState(true);
  const [buttonColor, setButtonColor] = useState("#1ed760");
  const [textColor, setTextColor] = useState("#d62cad");
  const [bannerFileName, setBannerFileName] = useState("");
  const bannerUploadRef = useRef<HTMLInputElement | null>(null);

  const handleButtonColor = (event: ChangeEvent<HTMLInputElement>) => {
    const color = event.target.value;
    if (!color) return;
    setButtonColor(color);
  };

  const handleTextColor = (event: ChangeEvent<HTMLInputElement>) => {
    const color = event.target.value;
    if (!color) return;
    setTextColor(color);
  };

  const handleBannerUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setBannerFileName(file.name);
  };

  return (
    <WidgetFlowShell
      pageTitle="Widget Customization"
      subtitle="Connect your workflow with industry-leading CRM platform minutes."
      cardTitle="Chat Box Design"
      stepper={{ labels: STEPS, currentStep: 1 }}
      footer={
        <>
          <Button type="button" variant="secondary" onClick={() => router.push("/dashboard/chat-widget")}>
            Cancel
          </Button>
          <Button type="button" variant="primary" sx={gradientPrimaryButtonSx} onClick={() => router.push("/dashboard/chat-widget/add/chat/notifications")}>
            Next
          </Button>
        </>
      }
    >
      <SelectField label="Header Title" value={headerTitle} onChange={setHeaderTitle} options={[{ label: "Center", value: "Center" }, { label: "Left", value: "Left" }]} />

      <Typography variant="mediumLarge" sx={{ color: theme.app.text.primary, mb: -1.25 }}>Button Color</Typography>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
        <Box
          component="input"
          type="color"
          value={buttonColor}
          onChange={handleButtonColor}
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

      <Typography variant="mediumLarge" sx={{ color: theme.app.text.primary, mb: -1.25 }}>Text Color</Typography>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
        <Box
          component="input"
          type="color"
          value={textColor}
          onChange={handleTextColor}
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
      <InputField label="Hex" name="text-color-hex" value={textColor} onChange={(e) => setTextColor(e.target.value)} />

      <InputField label="Company Logo" name="logo" value="veinso" />

      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Typography variant="mediumLarge" sx={{ color: theme.app.text.primary }}>
          Banner (Optional)
        </Typography>
        <Switch checked={bannerOn} onChange={(_, checked) => setBannerOn(checked)} color="success" />
      </Box>

      {bannerOn ? (
        <Box
          role="button"
          tabIndex={0}
          onClick={() => bannerUploadRef.current?.click()}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              bannerUploadRef.current?.click();
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
          <Typography variant="body2" sx={{ color: theme.app.dashboard.textMuted }}>Click to upload banner</Typography>
          <Typography variant="body2" sx={{ color: theme.app.dashboard.textMuted }}>{bannerFileName || "Max 10 MB files are allowed"}</Typography>
        </Box>
      ) : null}
      <Box component="input" ref={bannerUploadRef} type="file" accept=".png,.jpg,.jpeg,.webp,.gif" onChange={handleBannerUpload} sx={{ display: "none" }} />

      <InputField label="Banner Title" name="banner-title" value="Special Offer" />
      <InputField label="Banner Description" name="banner-description" value="Get 20% off all premium plans today." inputProps={{ maxLength: 200 }} />

      <Typography variant="mediumLarge" sx={{ color: theme.app.text.primary, mb: -1.25 }}>Text & Labels</Typography>
      <InputField label="Greeting Message" name="greeting-message" value="Special Offer" />

      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 1.5 }}>
        <InputField label="Start Chat Button Label" name="start-chat" value="Zino Chat" />
        <InputField label="Send Message Placeholder" name="send-placeholder" value="ZinoChat" />
      </Box>
    </WidgetFlowShell>
  );
}

 
