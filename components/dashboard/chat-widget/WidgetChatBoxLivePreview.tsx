"use client";



import { useState } from "react";

import ChatRounded from "@mui/icons-material/ChatRounded";

import SendRounded from "@mui/icons-material/SendRounded";

import Box from "@mui/material/Box";

import IconButton from "@mui/material/IconButton";

import Stack from "@mui/material/Stack";

import ToggleButton from "@mui/material/ToggleButton";

import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";

import { useTheme } from "@mui/material/styles";

import type { AppTheme } from "@/theme/theme";

import { Button, Typography } from "@/components/common";

import type { WidgetChatColorsDraft } from "@/lib/chat-widget/widget-colors-draft";

import type { WidgetInstallChatMode } from "@/lib/chat-widget/widgetDraft";



export type ChatBoxPreviewTab = "greeting" | "chat" | "prechat";



export interface ChatBoxLivePreviewModel {

  headerTitle: string;

  headerAlign: "Center" | "Left";

  buttonColor: string;

  textColor: string;

  backgroundColor: string;

  bannerOn: boolean;

  bannerTitle: string;

  bannerDescription: string;

  bannerDataUrl: string;

  bannerMediaType: "image" | "video";

  greetingMessage: string;

  firstMessage: string;

  sendPlaceholder: string;

  messagePlaceholder: string;

  boxWidth: number;

  boxHeight: number;

  colors: WidgetChatColorsDraft;

  inquiryOn: boolean;

  inquiryOptions: string[];

  formEnabled: boolean;

  formTitle: string;

  formSubtitle: string;

  formSubmitLabel: string;

  prechatNameEnabled: boolean;

  prechatEmailEnabled: boolean;

  prechatPhoneEnabled: boolean;

  prechatMessageEnabled: boolean;

  handoverEnabled: boolean;

  handoverTriggerText: string;

  chatMode: WidgetInstallChatMode;

}



function clampBox(n: number, min: number, max: number, fallback: number): number {

  return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : fallback;

}



function AgentAvatar() {

  return (

    <Box

      sx={{

        width: 28,

        height: 28,

        borderRadius: "50%",

        bgcolor: "#E5E7EB",

        border: "1px solid #CBD5E1",

        display: "inline-flex",

        alignItems: "center",

        justifyContent: "center",

        flexShrink: 0,

      }}

    >

      <ChatRounded sx={{ color: "#64748B", fontSize: 16 }} />

    </Box>

  );

}



function Bubble({

  children,

  bg,

  color,

  alignSelf,

  maxWidth = "88%",

}: {

  children: React.ReactNode;

  bg: string;

  color: string;

  alignSelf: "flex-start" | "flex-end";

  maxWidth?: string;

}) {

  return (

    <Box

      sx={{

        alignSelf,

        maxWidth,

        px: 1.25,

        py: 0.9,

        borderRadius: 1.5,

        bgcolor: bg,

        color,

        fontSize: 13,

        lineHeight: 1.45,

        wordBreak: "break-word",

      }}

    >

      {children}

    </Box>

  );

}



function MockInput({

  label,

  colors,

  multiline,

}: {

  label: string;

  colors: WidgetChatColorsDraft;

  multiline?: boolean;

}) {

  return (

    <Box>

      <Typography variant="caption" sx={{ color: colors.labelColor, display: "block", mb: 0.35, fontSize: 11 }}>

        {label}

      </Typography>

      <Box

        sx={{

          bgcolor: colors.inputBackground,

          color: colors.inputText,

          border: `1px solid ${colors.inputBorderColor}`,

          borderRadius: 1,

          px: 1,

          py: multiline ? 0.75 : 0.55,

          minHeight: multiline ? 48 : 28,

          fontSize: 12,

          fontStyle: "italic",

          opacity: 0.85,

        }}

      >

        {multiline ? "Your message…" : "…"}

      </Box>

    </Box>

  );

}



function InquiryPills({

  options,

  colors,

  accentColor,

}: {

  options: string[];

  colors: WidgetChatColorsDraft;

  accentColor: string;

}) {

  if (!options.length) return null;

  return (

    <Stack direction="row" flexWrap="wrap" gap={0.75} sx={{ mb: 1 }}>

      {options.map((opt, i) => {

        const selected = i === 0;

        return (

          <Box

            key={opt}

            component="span"

            sx={{

              px: 1.1,

              py: 0.45,

              borderRadius: 2,

              fontSize: 11,

              fontWeight: 600,

              border: `1px solid ${selected ? colors.inquiryPillSelectedBg ?? accentColor : colors.inquiryPillBorder}`,

              bgcolor: selected ? colors.inquiryPillSelectedBg ?? accentColor : colors.inquiryPillBg,

              color: selected ? colors.inquiryPillSelectedText ?? "#fff" : colors.inquiryPillText,

            }}

          >

            {opt}

          </Box>

        );

      })}

    </Stack>

  );

}



function PreviewShell({

  model,

  children,

  minHeight,

}: {

  model: ChatBoxLivePreviewModel;

  children: React.ReactNode;

  minHeight?: number;

}) {

  const c = model.colors;

  const width = clampBox(model.boxWidth, 280, 460, 350);

  const height = clampBox(model.boxHeight, 320, 560, 430);



  return (

    <Box

      sx={{

        borderRadius: 2,

        overflow: "hidden",

        border: `1px solid ${c.inputBorderColor}`,

        bgcolor: model.backgroundColor,

        width: "100%",

        maxWidth: width,

        minHeight: minHeight ?? Math.min(height, 420),

        mx: "auto",

        display: "flex",

        flexDirection: "column",

        color: c.chatBodyText,

        fontSize: 13,

      }}

    >

      {children}

    </Box>

  );

}



function PrechatPreview({ model }: { model: ChatBoxLivePreviewModel }) {

  const c = model.colors;

  const inquiryList = model.inquiryOn

    ? model.inquiryOptions.map((s) => s.trim()).filter(Boolean)

    : [];



  if (!model.formEnabled) {

    return (

      <PreviewShell model={model} minHeight={200}>

        <Box sx={{ p: 2, textAlign: "center" }}>

          <Typography variant="body2" sx={{ color: c.chatMutedText }}>

            Pre-chat form disabled — enable it on the Notifications & Advanced step.

          </Typography>

        </Box>

      </PreviewShell>

    );

  }



  return (

    <PreviewShell model={model}>

      <Stack spacing={1} sx={{ p: 1.25, flex: 1 }}>

        {model.bannerOn ? (

          <Box

            sx={{

              borderRadius: 1.5,

              overflow: "hidden",

              border: `1px solid ${c.inputBorderColor}`,

              bgcolor: c.inquiryPillBg,

              mb: 0.25,

            }}

          >

            {model.bannerDataUrl ? (

              <Box

                component="img"

                src={model.bannerDataUrl}

                alt=""

                sx={{ width: "100%", height: 56, objectFit: "cover", display: "block" }}

              />

            ) : (

              <Box sx={{ height: 40, bgcolor: c.greetingBubbleBg }} />

            )}

          </Box>

        ) : null}

        <Typography variant="subtitle2" sx={{ color: c.chatBodyText, fontWeight: 700, fontSize: 14 }}>

          {model.formTitle || "Before we start"}

        </Typography>

        {model.formSubtitle.trim() ? (

          <Typography variant="caption" sx={{ color: c.chatMutedText, display: "block", mt: -0.5 }}>

            {model.formSubtitle}

          </Typography>

        ) : null}

        <InquiryPills options={inquiryList} colors={c} accentColor={model.buttonColor} />

        {model.prechatNameEnabled ? <MockInput label="Name" colors={c} /> : null}

        {model.prechatEmailEnabled ? <MockInput label="Email" colors={c} /> : null}

        {model.prechatPhoneEnabled ? <MockInput label="Phone" colors={c} /> : null}

        {model.prechatMessageEnabled ? <MockInput label="Message" colors={c} multiline /> : null}

        <Button

          type="button"

          variant="primary"

          tabIndex={-1}

          sx={{

            mt: 0.5,

            bgcolor: model.buttonColor,

            color: c.outgoingMessageText,

            textTransform: "none",

            fontWeight: 700,

            "&:hover": { bgcolor: model.buttonColor },

          }}

        >

          {model.formSubmitLabel || "Start chat"}

        </Button>

      </Stack>

    </PreviewShell>

  );

}



function GreetingPreview({ model }: { model: ChatBoxLivePreviewModel }) {
  const c = model.colors;
  const headerTextAlign = model.headerAlign === "Left" ? "left" : "center";
  return (
    <PreviewShell model={model}>
      <Box
        sx={{
          px: 1.5,
          py: 1.1,
          bgcolor: model.buttonColor,
          color: model.textColor,
        }}
      >
        <Typography variant="subtitle2" sx={{ color: "inherit", fontWeight: 700, textAlign: headerTextAlign }}>
          {model.headerTitle || "Live chat"}
        </Typography>
      </Box>
      <Stack spacing={1.5} sx={{ p: 1.5, flex: 1 }}>
        <Bubble bg={c.greetingBubbleBg} color={c.greetingBubbleText} alignSelf="flex-start">
          {model.greetingMessage.trim() || "Add a panel greeting on this step."}
        </Bubble>
        <Button type="button" variant="primary" tabIndex={-1} sx={{ alignSelf: "stretch", bgcolor: model.buttonColor }}>
          Continue
        </Button>
      </Stack>
    </PreviewShell>
  );
}

function ChatPreview({ model }: { model: ChatBoxLivePreviewModel }) {

  const c = model.colors;

  const headerJustify = model.headerAlign === "Left" ? "flex-start" : "center";

  const headerTextAlign = model.headerAlign === "Left" ? "left" : "center";



  return (

    <PreviewShell model={model}>

      <Box

        sx={{

          px: 1.5,

          py: 1.1,

          bgcolor: model.buttonColor,

          color: model.textColor,

        }}

      >

        <Box

          sx={{

            display: "flex",

            alignItems: "center",

            justifyContent: headerJustify,

            gap: 1,

          }}

        >

          <AgentAvatar />

          <Box sx={{ textAlign: headerTextAlign }}>

            <Typography variant="subtitle2" sx={{ color: "inherit", fontWeight: 700, fontSize: 14 }}>

              {model.headerTitle || "Live chat"}

            </Typography>

            <Typography variant="caption" sx={{ color: "inherit", opacity: 0.85 }}>

              Online

            </Typography>

          </Box>

        </Box>

      </Box>



      <Stack spacing={1} sx={{ p: 1.25, flex: 1, minHeight: 0 }}>

        {model.bannerOn ? (

          <Box

            sx={{

              borderRadius: 1.5,

              overflow: "hidden",

              border: `1px solid ${c.inputBorderColor}`,

              bgcolor: c.inquiryPillBg,

            }}

          >

            {model.bannerDataUrl ? (

              model.bannerMediaType === "video" ? (

                <Box

                  component="video"

                  src={model.bannerDataUrl}

                  muted

                  autoPlay

                  loop

                  playsInline

                  sx={{ width: "100%", height: 72, objectFit: "cover", display: "block" }}

                />

              ) : (

                <Box

                  component="img"

                  src={model.bannerDataUrl}

                  alt=""

                  sx={{ width: "100%", height: 72, objectFit: "cover", display: "block" }}

                />

              )

            ) : (

              <Box sx={{ height: 48, bgcolor: c.greetingBubbleBg }} />

            )}

            {(model.bannerTitle || model.bannerDescription) && (

              <Box sx={{ px: 1, py: 0.75 }}>

                {model.bannerTitle ? (

                  <Typography variant="caption" sx={{ color: c.chatBodyText, fontWeight: 700, display: "block" }}>

                    {model.bannerTitle}

                  </Typography>

                ) : null}

                {model.bannerDescription ? (

                  <Typography variant="caption" sx={{ color: c.chatMutedText, display: "block" }}>

                    {model.bannerDescription}

                  </Typography>

                ) : null}

              </Box>

            )}

          </Box>

        ) : null}



        {model.firstMessage.trim() ? (

          <Box sx={{ display: "flex", alignItems: "flex-start", gap: 0.75 }}>

            <AgentAvatar />

            <Bubble bg={c.incomingMessageBg} color={c.incomingMessageText} alignSelf="flex-start">

              {model.firstMessage}

            </Bubble>

          </Box>

        ) : null}



        <Bubble bg={c.outgoingMessageBg} color={c.outgoingMessageText} alignSelf="flex-end" maxWidth="78%">

          Sample visitor message

        </Bubble>



        <Box sx={{ mt: "auto", pt: 0.5 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.75,
              bgcolor: c.inputBackground,
              border: `1px solid ${c.inputBorderColor}`,
              borderRadius: "22px",
              px: 1,
              py: 0.5,
            }}
          >
            <ChatRounded sx={{ color: model.buttonColor, fontSize: 18 }} />
            <Typography
              variant="body2"
              sx={{
                color: c.inputPlaceholderColor || c.chatMutedText,
                flex: 1,
                fontSize: 12,
                fontStyle: "italic",
              }}
            >
              {model.sendPlaceholder || model.messagePlaceholder || "Type a message…"}
            </Typography>
            <IconButton
              size="small"
              tabIndex={-1}
              disableRipple
              aria-hidden
              sx={{
                bgcolor: model.buttonColor,
                color: c.outgoingMessageText,
                width: 32,
                height: 32,
                "&:hover": { bgcolor: model.buttonColor },
              }}
            >
              <SendRounded sx={{ fontSize: 18 }} />
            </IconButton>
          </Box>
          {model.handoverEnabled && model.chatMode === "HYBRID" ? (
            <Box
              component="button"
              type="button"
              tabIndex={-1}
              sx={{
                width: "100%",
                mt: 1,
                py: 0.85,
                px: 1.25,
                borderRadius: 2,
                border: `1px solid ${c.handoverButtonBorder}`,
                bgcolor: c.handoverButtonBg,
                color: c.handoverButtonText,
                fontSize: 13,
                fontWeight: 600,
                cursor: "default",
              }}
            >
              {model.handoverTriggerText || "Talk to agent"}
            </Box>
          ) : null}
        </Box>

      </Stack>

    </PreviewShell>

  );

}



export function WidgetChatBoxLivePreview({ model }: { model: ChatBoxLivePreviewModel }) {

  const theme = useTheme() as AppTheme;

  const [tab, setTab] = useState<ChatBoxPreviewTab>("greeting");

  const width = clampBox(model.boxWidth, 280, 460, 350);

  const height = clampBox(model.boxHeight, 320, 560, 430);



  return (

    <Box>

      <Typography variant="mediumLarge" sx={{ color: theme.app.text.primary, mb: 1 }}>

        Live preview

      </Typography>

      <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted, display: "block", mb: 1 }}>

        Open panel: greeting → chat → visitor form (matches live embed).

      </Typography>

      <ToggleButtonGroup

        exclusive

        size="small"

        value={tab}

        onChange={(_, v: ChatBoxPreviewTab | null) => {

          if (v) setTab(v);

        }}

        sx={{ mb: 1.5, flexWrap: "wrap" }}

      >

        <ToggleButton value="greeting" sx={{ textTransform: "none", fontSize: 12 }}>
          Greeting
        </ToggleButton>
        <ToggleButton value="chat" sx={{ textTransform: "none", fontSize: 12 }}>
          Chat
        </ToggleButton>
        <ToggleButton value="prechat" sx={{ textTransform: "none", fontSize: 12 }}>
          Visitor form
        </ToggleButton>
      </ToggleButtonGroup>

      <Box

        sx={{

          border: `1px solid ${theme.app.dashboard.cardBorder}`,

          borderRadius: 2.5,

          p: 1.5,

          bgcolor: "rgba(6, 12, 54, 0.35)",

          overflow: "auto",

        }}

      >

        {tab === "greeting" ? <GreetingPreview model={model} /> : null}
        {tab === "chat" ? <ChatPreview model={model} /> : null}
        {tab === "prechat" ? <PrechatPreview model={model} /> : null}

        <Typography

          variant="caption"

          sx={{ color: theme.app.dashboard.textMuted, mt: 1, display: "block", textAlign: "center" }}

        >

          {width}×{height}px · panel {model.backgroundColor}

        </Typography>

      </Box>

    </Box>

  );

}


