"use client";

import { useRef, useState, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import CloudUploadOutlined from "@mui/icons-material/CloudUploadOutlined";
import Box from "@mui/material/Box";
import FormControlLabel from "@mui/material/FormControlLabel";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import Switch from "@mui/material/Switch";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { Button, Checkbox, InputField, Typography } from "@/components/common";
import { gradientPrimaryButtonSx } from "@/components/common/Button/Button.styles";
import { WidgetFlowShell } from "@/components/dashboard/WidgetFlowShell";

const STEPS = ["Widget Button Design", "Chat Box Design", "Notifications & Advanced"];

export default function ChatWidgetNotificationsPage() {
  const router = useRouter();
  const theme = useTheme() as AppTheme;
  const [browserNotification, setBrowserNotification] = useState(true);
  const [soundNotification, setSoundNotification] = useState(false);
  const [videoWelcomeOn, setVideoWelcomeOn] = useState(false);
  const [videoSource, setVideoSource] = useState("upload");
  const [videoFileName, setVideoFileName] = useState("");
  const videoUploadRef = useRef<HTMLInputElement | null>(null);

  const handleVideoUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setVideoFileName(file.name);
  };

  return (
    <WidgetFlowShell
      pageTitle="Widget Customization"
      subtitle="Connect your workflow with industry-leading CRM platform minutes."
      cardTitle="Notifications & Advanced"
      stepper={{ labels: STEPS, currentStep: 2 }}
      footer={
        <>
          <Button type="button" variant="secondary" onClick={() => router.push("/dashboard/chat-widget")}>
            Cancel
          </Button>
          <Button type="button" variant="primary" sx={gradientPrimaryButtonSx} onClick={() => router.push("/dashboard/chat-widget/add/chat/script")}>
            Next
          </Button>
        </>
      }
    >
      <Typography variant="mediumLarge" sx={{ color: theme.app.text.primary, mb: -1.25 }}>Notification Settings</Typography>
      <Box sx={{ display: "flex", gap: 2.5 }}>
        <Checkbox checked={browserNotification} onChange={(e) => setBrowserNotification(e.target.checked)} />
        <Typography variant="medium" sx={{ color: theme.app.dashboard.textMuted, ml: -1.5 }}>Browser Notification</Typography>
        <Checkbox checked={soundNotification} onChange={(e) => setSoundNotification(e.target.checked)} />
        <Typography variant="medium" sx={{ color: theme.app.dashboard.textMuted, ml: -1.5 }}>Sound Notification</Typography>
      </Box>

      <InputField label="Fallback Notification Text" name="fallback" value="You have a new message from support." inputProps={{ maxLength: 120 }} />

      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Typography variant="mediumLarge" sx={{ color: theme.app.text.primary }}>
          Video Welcome Message
        </Typography>
        <Switch checked={videoWelcomeOn} onChange={(_, checked) => setVideoWelcomeOn(checked)} color="success" />
      </Box>

      {videoWelcomeOn ? (
        <>
          <Typography variant="mediumLarge" sx={{ color: theme.app.text.primary, mb: -1.25 }}>Video Source</Typography>
          <RadioGroup row value={videoSource} onChange={(e) => setVideoSource(e.target.value)} sx={{ gap: 2.5 }}>
            <FormControlLabel value="upload" control={<Radio />} label={<Typography variant="medium" sx={{ color: theme.app.dashboard.textMuted }}>Upload Video</Typography>} />
            <FormControlLabel value="url" control={<Radio />} label={<Typography variant="medium" sx={{ color: theme.app.dashboard.textMuted }}>Video URL (YouTube/Vimeo)</Typography>} />
          </RadioGroup>

          <Box
            role="button"
            tabIndex={0}
            onClick={() => videoUploadRef.current?.click()}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                videoUploadRef.current?.click();
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
              Click to upload video
            </Typography>
            <Typography variant="body2" sx={{ color: theme.app.dashboard.textMuted }}>
              {videoFileName || "Max 10 MB files are allowed"}
            </Typography>
          </Box>
          <Box component="input" ref={videoUploadRef} type="file" accept=".mp4,.webm,.mov" onChange={handleVideoUpload} sx={{ display: "none" }} />
        </>
      ) : null}
    </WidgetFlowShell>
  );
}
