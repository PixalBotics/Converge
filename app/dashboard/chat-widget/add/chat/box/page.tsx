"use client";

import { useRef, useState, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import CloudUploadOutlined from "@mui/icons-material/CloudUploadOutlined";
import ChatRounded from "@mui/icons-material/ChatRounded";
import SendRounded from "@mui/icons-material/SendRounded";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Switch from "@mui/material/Switch";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { Button, InputField, SelectField, Typography } from "@/components/common";
import { gradientPrimaryButtonSx } from "@/components/common/Button/Button.styles";
import { WidgetFlowShell } from "@/components/dashboard/WidgetFlowShell";
import { saveWidgetDraft } from "@/lib/chat-widget/widgetDraft";

const STEPS = ["Widget Button Design", "Chat Box Design", "Notifications & Advanced"];
export default function ChatWidgetBoxDesignPage() {
  const router = useRouter();
  const theme = useTheme() as AppTheme;
  const [headerTitle, setHeaderTitle] = useState("Center");
  const [bannerOn, setBannerOn] = useState(true);
  const [buttonColor, setButtonColor] = useState("#1ed760");
  const [textColor, setTextColor] = useState("#d62cad");
  const [bannerFileName, setBannerFileName] = useState("");
  const [bannerDataUrl, setBannerDataUrl] = useState("");
  const [bannerMediaType, setBannerMediaType] = useState<"image" | "video">("image");
  const [companyLogo, setCompanyLogo] = useState("veinso");
  const [greetingMessage, setGreetingMessage] = useState("Welcome to Florida Luxurious. Tell me your budget, location, and property type preference.");
  const [sendPlaceholder, setSendPlaceholder] = useState("Ask about location, budget, or options...");
  const [boxWidth, setBoxWidth] = useState("350");
  const [boxHeight, setBoxHeight] = useState("430");
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
    setBannerMediaType(file.type.startsWith("video/") ? "video" : "image");
    const reader = new FileReader();
    reader.onload = () => setBannerDataUrl(typeof reader.result === "string" ? reader.result : "");
    reader.readAsDataURL(file);
  };

  const handleNext = () => {
    const parsedWidth = Number.parseInt(boxWidth, 10);
    const parsedHeight = Number.parseInt(boxHeight, 10);
    const safeWidth = Number.isFinite(parsedWidth) ? Math.min(520, Math.max(280, parsedWidth)) : 350;
    const safeHeight = Number.isFinite(parsedHeight) ? Math.min(640, Math.max(320, parsedHeight)) : 430;
    saveWidgetDraft({
      headerTitleAlign: headerTitle as "Center" | "Left",
      headerTitle: companyLogo || "AI Sales Assistant",
      buttonColor: buttonColor || "#1ed760",
      textColor: textColor || "#FFFFFF",
      greetingMessage,
      sendPlaceholder,
      bannerOn,
      bannerDataUrl,
      bannerMediaType,
      boxWidth: safeWidth,
      boxHeight: safeHeight,
    });
    router.push("/dashboard/chat-widget/add/chat/notifications");
  };

  const renderAgentIcon = () => (
    <Box
      sx={{
        width: 30,
        height: 30,
        borderRadius: "50%",
        bgcolor: "#E5E7EB",
        border: "1px solid #CBD5E1",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      <ChatRounded sx={{ color: "#64748B", fontSize: 18 }} />
    </Box>
  );

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
          <Button type="button" variant="primary" sx={gradientPrimaryButtonSx} onClick={handleNext}>
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

      <InputField label="Company Logo" name="logo" value={companyLogo} onChange={(event) => setCompanyLogo(event.target.value)} />

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
      <Box component="input" ref={bannerUploadRef} type="file" accept=".png,.jpg,.jpeg,.webp,.gif,.mp4,.webm,.ogg,.mov" onChange={handleBannerUpload} sx={{ display: "none" }} />

      <Typography variant="mediumLarge" sx={{ color: theme.app.text.primary, mb: -1.25 }}>Text & Labels</Typography>
      <InputField label="Greeting Message" name="greeting-message" value={greetingMessage} onChange={(event) => setGreetingMessage(event.target.value)} />

      <InputField label="Send Message Placeholder" name="send-placeholder" value={sendPlaceholder} onChange={(event) => setSendPlaceholder(event.target.value)} />
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 1.5 }}>
        <InputField
          label="Chat Box Width (px)"
          name="box-width"
          type="text"
          value={boxWidth}
          onChange={(event) => setBoxWidth(event.target.value)}
          inputProps={{ inputMode: "numeric", pattern: "[0-9]*", min: 280, max: 520 }}
        />
        <InputField
          label="Chat Box Height (px)"
          name="box-height"
          type="text"
          value={boxHeight}
          onChange={(event) => setBoxHeight(event.target.value)}
          inputProps={{ inputMode: "numeric", pattern: "[0-9]*", min: 320, max: 640 }}
        />
      </Box>

      <Typography variant="mediumLarge" sx={{ color: theme.app.text.primary, mt: 0.5, mb: -0.5 }}>
        Live Preview
      </Typography>
      <Box
        sx={{
          border: `1px solid ${theme.app.dashboard.cardBorder}`,
          borderRadius: 3,
          p: 2,
          bgcolor: "rgba(6, 12, 54, 0.45)",
        }}
      >
        <Box
          sx={{
            borderRadius: 2.5,
            overflow: "hidden",
            border: `1px solid ${theme.app.dashboard.cardBorder}`,
            bgcolor: "#EEF1F7",
            width: `${Math.min(460, Math.max(280, Number.parseInt(boxWidth, 10) || 350))}px`,
            minHeight: `${Math.min(560, Math.max(320, Number.parseInt(boxHeight, 10) || 430))}px`,
            mx: "auto",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Box sx={{ px: 2, py: 1.5, bgcolor: buttonColor || "#1ed760", color: textColor || "#ffffff" }}>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: headerTitle === "Left" ? "flex-start" : "center", gap: 1 }}>
              {renderAgentIcon()}
              <Box>
                <Typography variant="mediumLarge" sx={{ color: "inherit", textAlign: headerTitle === "Left" ? "left" : "center" }}>
                  {companyLogo || "AI Sales Assistant"}
                </Typography>
                <Typography variant="body2" sx={{ color: "inherit", opacity: 0.9, textAlign: headerTitle === "Left" ? "left" : "center" }}>
                  Online now
                </Typography>
              </Box>
            </Box>
          </Box>

          <Box sx={{ p: 1.5, display: "grid", gap: 1.1, flex: 1 }}>
            {bannerOn && bannerDataUrl ? (
              bannerMediaType === "video" ? (
                <Box
                  component="video"
                  src={bannerDataUrl}
                  muted
                  autoPlay
                  loop
                  playsInline
                  controls
                  sx={{ width: "100%", height: 120, objectFit: "cover", borderRadius: 2, bgcolor: "#000000" }}
                />
              ) : (
                <Box
                  component="img"
                  src={bannerDataUrl}
                  alt="Uploaded banner"
                  sx={{ width: "100%", height: 120, objectFit: "cover", borderRadius: 2 }}
                />
              )
            ) : null}

            <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1 }}>
              {renderAgentIcon()}
              <Box sx={{ bgcolor: "#DDE3EC", borderRadius: 2, p: 1.2 }}>
                <Typography variant="body2" sx={{ color: "#1B2A3D" }}>
                  {greetingMessage || "Welcome! How can we help you today?"}
                </Typography>
              </Box>
            </Box>

            <Box sx={{ alignSelf: "flex-end", bgcolor: "#0E60D5", borderRadius: 2, p: 1.1, maxWidth: "78%" }}>
              <Typography variant="body2" sx={{ color: "#FFFFFF" }}>
                Great! Please share your preferred location.
              </Typography>
            </Box>

            <Box sx={{ display: "flex", alignItems: "center", gap: 1, bgcolor: "#FFFFFF", border: "1px solid #CCD6E6", borderRadius: "22px", px: 1.2, py: 0.75, mt: "auto" }}>
              <ChatRounded sx={{ color: buttonColor || "#1ed760", fontSize: 20 }} />
              <Typography variant="body2" sx={{ color: "#5B6B82", flex: 1 }}>
                {sendPlaceholder || "Type your message..."}
              </Typography>
              <IconButton
                type="button"
                aria-label="Send message"
                size="small"
                tabIndex={-1}
                disableRipple
                sx={{
                  bgcolor: buttonColor || "#1ed760",
                  color: "#FFFFFF",
                  width: 42,
                  height: 42,
                  flexShrink: 0,
                  "&:hover": { bgcolor: buttonColor || "#1ed760", filter: "brightness(1.06)" },
                }}
              >
                <SendRounded sx={{ fontSize: 22 }} />
              </IconButton>
            </Box>
          </Box>
        </Box>
      </Box>
    </WidgetFlowShell>
  );
}

 
