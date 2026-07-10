"use client";

import { useEffect, useState } from "react";
import ChatRounded from "@mui/icons-material/ChatRounded";
import OpenInNewRounded from "@mui/icons-material/OpenInNewRounded";
import SendRounded from "@mui/icons-material/SendRounded";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { Typography } from "@/components/common";
import {
  resolveAccentPalette,
  resolveDensityTokens,
} from "@/lib/chat-widget/design-accent-density";
import {
  resolveBubbleSurfaceSx,
  resolveWidgetPanelHeaderSurfaceSx,
  resolveWidgetPanelSurfaceSx,
  type WidgetLauncherStyleId,
} from "@/lib/chat-widget/launcher-style";
import type { WidgetChatColorsDraft } from "@/lib/chat-widget/widget-colors-draft";
import { WidgetChatAvatarBubble } from "@/lib/chat-widget/widget-chat-avatar-svg";
import type { WidgetInstallChatMode } from "@/lib/chat-widget/widgetDraft";
import { WIDGET_GOOGLE_FONTS_STYLESHEET_HREF } from "@/lib/chat-widget/widget-google-fonts";
import { resolveBannerMediaSx } from "@/lib/chat-widget/banner-media-height";

export interface ChatBoxLivePreviewModel {
  headerTitle: string;
  headerLogoDataUrl?: string;
  headerLogoHeightPx?: number;
  headerAlign: "Center" | "Left";
  buttonColor: string;
  buttonHoverColor?: string;
  textColor: string;
  backgroundColor: string;
  bannerOn: boolean;
  bannerTitle: string;
  bannerDataUrl: string;
  bannerMediaType: "image" | "video";
  bannerHeightPx?: number;
  bannerCtaLabel?: string;
  bannerCtaHref?: string;
  videoWelcomeOn?: boolean;
  videoWelcomeUrl?: string;
  videoWelcomeHeightPx?: number;
  greetingMessage: string;
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
  talkToAgentEnabled: boolean;
  talkToAgentTriggerText: string;
  chatMode: WidgetInstallChatMode;
  panelSurfaceStyle?: WidgetLauncherStyleId;
  bubbleSurfaceStyle?: WidgetLauncherStyleId;
  agentAvatarEnabled?: boolean;
  agentAvatarDataUrl?: string;
  agentAvatarPreset?: string;
  visitorAvatarEnabled?: boolean;
  visitorAvatarDataUrl?: string;
  visitorAvatarPreset?: string;
  themeFontFamily?: string;
  themeBubbleStyle?: string;
  themeBorderRadiusPx?: number;
  bubbleBorderRadiusPx?: number;
  themeWelcomeFontSizePx?: number;
  themeBodyFontSizePx?: number;
  themeInputFontSizePx?: number;
  themeCtaFontSizePx?: number;
  themeLineHeightPx?: number;
  themeDesignJsonAccent?: string;
  themeDesignJsonDensity?: string;
}

function clampBox(n: number, min: number, max: number, fallback: number): number {
  return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : fallback;
}

function resolveBubbleBorderRadius(
  role: "assistant" | "visitor" | "greeting",
  themeBubbleStyle: string | undefined,
  borderRadiusPx: number,
): string {
  const style = (themeBubbleStyle ?? "rounded").toLowerCase();
  const radius =
    style === "pill"
      ? Math.max(18, borderRadiusPx + 6)
      : style === "square"
        ? Math.max(4, Math.min(8, borderRadiusPx))
        : Math.max(10, borderRadiusPx);
  const tail = style === "pill" ? radius : style === "square" ? 4 : 4;
  if (role === "greeting") return `${radius}px`;
  if (role === "visitor") return `${radius}px ${radius}px ${tail}px ${radius}px`;
  return `${radius}px ${radius}px ${radius}px ${tail}px`;
}

function Bubble({
  children,
  bg,
  color,
  alignSelf,
  maxWidth = "88%",
  model,
  role = "assistant",
  fontSize,
}: {
  children: React.ReactNode;
  bg: string;
  color: string;
  alignSelf: "flex-start" | "flex-end";
  maxWidth?: string;
  model: ChatBoxLivePreviewModel;
  role?: "assistant" | "visitor" | "greeting";
  fontSize?: number;
}) {
  const accent = resolveAccentPalette(model.themeDesignJsonAccent);
  const borderRadius = resolveBubbleBorderRadius(
    role,
    model.themeBubbleStyle,
    model.bubbleBorderRadiusPx ?? model.themeBorderRadiusPx ?? 12,
  );
  const surface = resolveBubbleSurfaceSx({
    style: model.bubbleSurfaceStyle ?? "solid",
    role,
    baseBg: bg,
    baseText: color,
    primary: model.buttonColor,
    hover: model.buttonHoverColor || model.buttonColor,
  });
  const isGlow = model.bubbleSurfaceStyle === "glow";
  return (
    <Box
      sx={{
        px: 1.25,
        py: 0.9,
        borderRadius,
        color,
        bgcolor: bg,
        fontSize: fontSize ?? model.themeBodyFontSizePx ?? 13,
        lineHeight: (model.themeLineHeightPx ?? 22) / (model.themeBodyFontSizePx ?? 14),
        whiteSpace: "pre-wrap",
        overflowWrap: "break-word",
        wordBreak: "normal",
        width: "fit-content",
        maxWidth,
        minWidth: 0,
        overflow: isGlow ? "visible" : "hidden",
        alignSelf,
        border: `1px solid ${role === "visitor" ? bg : accent.border}44`,
        boxShadow:
          role === "greeting"
            ? `0 2px 8px ${accent.main}18`
            : `0 2px 6px ${accent.main}16`,
        ...(surface as object),
      }}
    >
      {children}
    </Box>
  );
}

function PanelHeaderLogo({ src, heightPx = 28 }: { src?: string; heightPx?: number }) {
  if (!src?.trim()) return null;
  const h = clampBox(heightPx, 16, 64, 28);
  return (
    <Box
      component="img"
      src={src}
      alt=""
      sx={{
        height: h,
        width: "auto",
        maxWidth: Math.round(h * 3.4),
        objectFit: "contain",
        flexShrink: 0,
      }}
    />
  );
}

function PanelHeader({ model }: { model: ChatBoxLivePreviewModel }) {
  const headerJustify = model.headerAlign === "Left" ? "flex-start" : "center";
  const headerTextAlign = model.headerAlign === "Left" ? "left" : "center";
  return (
    <Box
      sx={{
        px: 1.5,
        py: 1.1,
        color: model.textColor,
        fontFamily: model.themeFontFamily,
        ...resolveWidgetPanelHeaderSurfaceSx({
          style: model.panelSurfaceStyle ?? "solid",
          headerBg: model.buttonColor,
          buttonHoverColor: model.buttonHoverColor,
        }),
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: headerJustify, gap: 0.75 }}>
        <PanelHeaderLogo src={model.headerLogoDataUrl} heightPx={model.headerLogoHeightPx} />
        {model.headerTitle.trim() ? (
          <Typography
            variant="subtitle2"
            sx={{
              color: "inherit",
              fontWeight: 700,
              textAlign: headerTextAlign,
              fontSize: model.themeBodyFontSizePx ?? 14,
              fontFamily: "inherit",
            }}
          >
            {model.headerTitle.trim()}
          </Typography>
        ) : null}
      </Box>
    </Box>
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
  const width = clampBox(model.boxWidth, 280, 520, 350);
  const height = clampBox(model.boxHeight, 320, 640, 430);
  const isGlow = model.panelSurfaceStyle === "glow";
  return (
    <Box
      sx={{
        ...resolveWidgetPanelSurfaceSx({
          style: model.panelSurfaceStyle ?? "solid",
          buttonColor: model.buttonColor,
          buttonHoverColor: model.buttonHoverColor || model.buttonColor,
          panelBackground: model.backgroundColor,
          borderRadiusPx: model.themeBorderRadiusPx ?? 12,
        }),
        overflow: isGlow ? "visible" : "hidden",
        width: "100%",
        maxWidth: width,
        minHeight: minHeight ?? Math.min(height, 480),
        mx: "auto",
        display: "flex",
        flexDirection: "column",
        color: model.colors.chatBodyText,
        fontFamily: model.themeFontFamily,
        fontSize: model.themeBodyFontSizePx ?? 13,
        lineHeight: (model.themeLineHeightPx ?? 22) / (model.themeBodyFontSizePx ?? 14),
      }}
    >
      {children}
    </Box>
  );
}

function BannerBlock({ model, inset = false }: { model: ChatBoxLivePreviewModel; inset?: boolean }) {
  const c = model.colors;
  const accent = resolveAccentPalette(model.themeDesignJsonAccent);
  const bannerHeight = model.bannerHeightPx && model.bannerHeightPx > 0 ? model.bannerHeightPx : 0;
  const mediaSx = resolveBannerMediaSx(bannerHeight, { bgcolor: "#000" });
  const ctaLabel = model.bannerCtaLabel?.trim() ?? "";
  const ctaHref = model.bannerCtaHref?.trim() ?? "";
  if (!model.bannerOn) return null;
  const hasMedia = Boolean(model.bannerDataUrl?.trim());
  const hasTitle = Boolean(model.bannerTitle?.trim());
  const hasCta = Boolean(ctaLabel && ctaHref);
  if (!hasMedia && !hasTitle && !hasCta) return null;

  return (
    <Box
      sx={{
        borderRadius: `${model.themeBorderRadiusPx ?? 12}px`,
        overflow: "hidden",
        border: inset ? "none" : `1px solid ${c.inputBorderColor}`,
        bgcolor: inset ? "transparent" : c.inquiryPillBg,
        width: "100%",
      }}
    >
      {hasMedia ? (
        model.bannerMediaType === "video" ? (
          <Box
            component="video"
            src={model.bannerDataUrl}
            muted
            autoPlay
            loop
            playsInline
            controls
            sx={mediaSx}
          />
        ) : (
          <Box component="img" src={model.bannerDataUrl} alt="" sx={mediaSx} />
        )
      ) : null}
      {(hasTitle || hasCta) && (
        <Box sx={{ px: 1, py: 0.75, display: "flex", flexDirection: "column", gap: 0.5 }}>
          {hasTitle ? (
            <Typography
              variant="caption"
              sx={{ color: c.chatBodyText, fontWeight: 700, display: "block", fontFamily: "inherit" }}
            >
              {model.bannerTitle.trim()}
            </Typography>
          ) : null}
          {hasCta ? (
            <Box
              component="a"
              href={ctaHref}
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                display: "inline-flex",
                alignItems: "center",
                gap: 0.5,
                alignSelf: "flex-start",
                px: 1.1,
                py: 0.45,
                borderRadius: 1.5,
                bgcolor: accent.main,
                color: "#fff",
                fontSize: model.themeCtaFontSizePx ?? 12,
                fontWeight: 700,
                textDecoration: "none",
                "&:hover": { opacity: 0.92 },
              }}
            >
              {ctaLabel}
              <OpenInNewRounded sx={{ fontSize: 14 }} />
            </Box>
          ) : null}
        </Box>
      )}
    </Box>
  );
}

function VideoWelcomeBlock({ model, inset = false }: { model: ChatBoxLivePreviewModel; inset?: boolean }) {
  if (!model.videoWelcomeOn || !model.videoWelcomeUrl?.trim()) return null;
  const h = clampBox(model.videoWelcomeHeightPx ?? 160, 80, 320, 160);
  const url = model.videoWelcomeUrl.trim();
  const isEmbed = /youtube\.com|youtu\.be|vimeo\.com/i.test(url);
  return (
    <Box
      sx={{
        borderRadius: `${model.themeBorderRadiusPx ?? 12}px`,
        overflow: "hidden",
        border: inset ? "none" : `1px solid ${model.colors.inputBorderColor}`,
        bgcolor: "#000",
        height: h,
        width: "100%",
      }}
    >
      {isEmbed ? (
        <Box
          component="iframe"
          src={url}
          title="Video welcome"
          sx={{ width: "100%", height: "100%", border: 0, display: "block" }}
        />
      ) : (
        <Box
          component="video"
          src={url}
          controls
          playsInline
          sx={{ width: "100%", height: "100%", objectFit: "contain", display: "block" }}
        />
      )}
    </Box>
  );
}

function MediaBubble({
  model,
  children,
}: {
  model: ChatBoxLivePreviewModel;
  children: React.ReactNode;
}) {
  const c = model.colors;
  return (
    <Bubble
      model={model}
      role="assistant"
      bg={c.incomingMessageBg}
      color={c.incomingMessageText}
      alignSelf="flex-start"
      maxWidth="100%"
    >
      <Box sx={{ width: "100%" }}>{children}</Box>
    </Bubble>
  );
}

function BannerBubble({ model }: { model: ChatBoxLivePreviewModel }) {
  if (!model.bannerOn) return null;
  const hasMedia = Boolean(model.bannerDataUrl?.trim());
  const hasTitle = Boolean(model.bannerTitle?.trim());
  const hasCta = Boolean(model.bannerCtaLabel?.trim() && model.bannerCtaHref?.trim());
  if (!hasMedia && !hasTitle && !hasCta) return null;
  return (
    <MediaBubble model={model}>
      <BannerBlock model={model} inset />
    </MediaBubble>
  );
}

function VideoWelcomeBubble({ model }: { model: ChatBoxLivePreviewModel }) {
  if (!model.videoWelcomeOn || !model.videoWelcomeUrl?.trim()) return null;
  return (
    <MediaBubble model={model}>
      <VideoWelcomeBlock model={model} inset />
    </MediaBubble>
  );
}

function ChatInputBar({
  model,
  value,
  onChange,
  onSend,
}: {
  model: ChatBoxLivePreviewModel;
  value: string;
  onChange: (v: string) => void;
  onSend: () => void;
}) {
  const c = model.colors;
  return (
    <Box sx={{ mt: "auto", pt: 0.5 }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 0.75,
          bgcolor: c.inputBackground,
          border: `1px solid ${c.inputBorderColor}`,
          borderRadius:
            model.themeBubbleStyle === "pill"
              ? "999px"
              : `${Math.max(8, (model.themeBorderRadiusPx ?? 12) + 8)}px`,
          px: 1,
          py: 0.5,
        }}
      >
        <ChatRounded sx={{ color: model.buttonColor, fontSize: 18 }} />
        <Box
          component="input"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              onSend();
            }
          }}
          placeholder={model.sendPlaceholder || model.messagePlaceholder || "Type a message…"}
          sx={{
            flex: 1,
            border: "none",
            outline: "none",
            bgcolor: "transparent",
            color: c.inputText,
            fontFamily: "inherit",
            fontSize: model.themeInputFontSizePx ?? 12,
            "&::placeholder": { color: c.inputPlaceholderColor || c.chatMutedText },
          }}
        />
        <IconButton
          size="small"
          onClick={onSend}
          aria-label="Send message"
          sx={{
            bgcolor: model.buttonColor,
            color: c.outgoingMessageText,
            width: 32,
            height: 32,
            "&:hover": { bgcolor: model.buttonHoverColor || model.buttonColor },
          }}
        >
          <SendRounded sx={{ fontSize: 18 }} />
        </IconButton>
      </Box>
    </Box>
  );
}

function PanelFlowPreview({ model }: { model: ChatBoxLivePreviewModel }) {
  const c = model.colors;
  const density = resolveDensityTokens(model.themeDesignJsonDensity);
  const gap = density.stackGapMultiplier;
  const greeting = model.greetingMessage.trim();
  const [input, setInput] = useState("");
  const [sentMessage, setSentMessage] = useState("");

  const handleSend = () => {
    const text = input.trim();
    if (!text) return;
    setSentMessage(text);
    setInput("");
  };

  return (
    <PreviewShell model={model}>
      <PanelHeader model={model} />
      <Stack
        spacing={1 * gap}
        sx={{
          p: density.panelPaddingPx / 16,
          flex: 1,
          minHeight: 0,
          overflowY: "auto",
        }}
      >
        <BannerBubble model={model} />
        <VideoWelcomeBubble model={model} />

        {greeting ? (
          <Box
            sx={{
              display: "flex",
              alignItems: "flex-start",
              gap: 0.75,
              width: "100%",
              maxWidth: "100%",
              justifyContent: "flex-start",
            }}
          >
            {model.agentAvatarEnabled !== false ? (
              <WidgetChatAvatarBubble
                avatarUrl={model.agentAvatarDataUrl}
                preset={model.agentAvatarPreset}
                accentColor={model.buttonColor}
                variant="agent"
                size={32}
              />
            ) : null}
            <Bubble
              model={model}
              role="greeting"
              bg={c.greetingBubbleBg}
              color={c.greetingBubbleText}
              alignSelf="flex-start"
              maxWidth="calc(100% - 40px)"
              fontSize={model.themeWelcomeFontSizePx ?? 15}
            >
              {greeting}
            </Bubble>
          </Box>
        ) : null}

        {sentMessage ? (
          <Box
            sx={{
              display: "flex",
              alignItems: "flex-start",
              gap: 0.75,
              width: "100%",
              maxWidth: "100%",
              justifyContent: "flex-end",
            }}
          >
            <Bubble
              model={model}
              role="visitor"
              bg={c.outgoingMessageBg}
              color={c.outgoingMessageText}
              alignSelf="flex-end"
              maxWidth="calc(100% - 40px)"
            >
              {sentMessage}
            </Bubble>
            {model.visitorAvatarEnabled ? (
              <WidgetChatAvatarBubble
                avatarUrl={model.visitorAvatarDataUrl}
                preset={model.visitorAvatarPreset}
                accentColor={model.buttonColor}
                variant="visitor"
                size={32}
              />
            ) : model.agentAvatarEnabled !== false ? (
              <Box sx={{ width: 32, height: 32, flexShrink: 0 }} aria-hidden />
            ) : null}
          </Box>
        ) : null}

        <ChatInputBar model={model} value={input} onChange={setInput} onSend={handleSend} />
      </Stack>
    </PreviewShell>
  );
}

export function WidgetChatBoxLivePreview({ model }: { model: ChatBoxLivePreviewModel }) {
  const theme = useTheme() as AppTheme;
  const width = clampBox(model.boxWidth, 280, 520, 350);
  const height = clampBox(model.boxHeight, 320, 640, 430);

  useEffect(() => {
    const id = "widget-preview-google-fonts";
    if (document.getElementById(id)) return;
    const link = document.createElement("link");
    link.id = id;
    link.rel = "stylesheet";
    link.href = WIDGET_GOOGLE_FONTS_STYLESHEET_HREF;
    document.head.appendChild(link);
  }, []);

  return (
    <Box>
      <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted, display: "block", mb: 0.75 }}>
        Open chat panel — type &amp; send to start
      </Typography>
      <Box
        sx={{
          border: `1px solid ${theme.app.dashboard.cardBorder}`,
          borderRadius: 2.5,
          p: 1.5,
          bgcolor: "rgba(6, 12, 54, 0.35)",
          overflow: "auto",
        }}
      >
        <PanelFlowPreview model={model} />
        <Typography
          variant="caption"
          sx={{ color: theme.app.dashboard.textMuted, mt: 1, display: "block", textAlign: "center" }}
        >
          {width}×{height}px · {model.themeFontFamily?.split(",")[0]?.replace(/"/g, "") ?? "Inter"} ·{" "}
          {model.themeBubbleStyle ?? "rounded"} bubbles
        </Typography>
      </Box>
    </Box>
  );
}
