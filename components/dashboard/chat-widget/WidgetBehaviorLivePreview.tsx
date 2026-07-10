"use client";

import { useState } from "react";
import ChatRounded from "@mui/icons-material/ChatRounded";
import SendRounded from "@mui/icons-material/SendRounded";
import Box from "@mui/material/Box";
import Checkbox from "@mui/material/Checkbox";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { Button, Typography } from "@/components/common";
import type { WidgetChatColorsDraft } from "@/lib/chat-widget/widget-colors-draft";
import type { WidgetInstallChatMode } from "@/lib/chat-widget/widgetDraft";

export type BehaviorPreviewTab = "form" | "chat" | "offline";

export interface BehaviorLivePreviewModel {
  chatMode: WidgetInstallChatMode;
  buttonColor: string;
  textColor: string;
  backgroundColor: string;
  colors: WidgetChatColorsDraft;
  formEnabled: boolean;
  formTitle: string;
  formSubtitle: string;
  formSubmitLabel: string;
  prechatNameEnabled: boolean;
  prechatEmailEnabled: boolean;
  prechatPhoneEnabled: boolean;
  prechatMessageEnabled: boolean;
  consentRequired: boolean;
  consentText: string;
  inquiryOn: boolean;
  inquiryOptions: string[];
  inquiryRequired?: boolean;
  inquirySkipLabel?: string;
  talkToAgentEnabled: boolean;
  talkToAgentTriggerText: string;
  greetingMessage: string;
  firstMessage: string;
  sendPlaceholder: string;
  headerTitle: string;
  offlineMessage: string;
  offlineFormEnabled?: boolean;
  offlineFormTitle?: string;
  offlineFormSubtitle?: string;
  offlineFormSubmitLabel?: string;
  offlinePrechatNameEnabled?: boolean;
  offlinePrechatEmailEnabled?: boolean;
  offlinePrechatPhoneEnabled?: boolean;
  offlinePrechatMessageEnabled?: boolean;
}

function MockField({ label, colors }: { label: string; colors: WidgetChatColorsDraft }) {
  return (
    <Box>
      <Typography variant="caption" sx={{ color: colors.labelColor, display: "block", mb: 0.35, fontSize: 11 }}>
        {label}
      </Typography>
      <Box
        sx={{
          bgcolor: colors.inputBackground,
          border: `1px solid ${colors.inputBorderColor}`,
          borderRadius: 1,
          px: 1,
          py: 0.55,
          minHeight: 28,
          fontSize: 12,
          fontStyle: "italic",
          color: colors.inputPlaceholderColor,
          opacity: 0.85,
        }}
      >
        …
      </Box>
    </Box>
  );
}

function VisitorFormPreview({ model }: { model: BehaviorLivePreviewModel }) {
  const c = model.colors;
  const inquiryList = model.inquiryOn
    ? model.inquiryOptions.map((s) => s.trim()).filter(Boolean)
    : [];

  if (!model.formEnabled) {
    return (
      <Box sx={{ p: 2, textAlign: "center" }}>
        <Typography variant="body2" sx={{ color: c.chatMutedText }}>
          Visitor form disabled — chat opens directly after the launcher.
        </Typography>
      </Box>
    );
  }

  return (
    <Stack spacing={1} sx={{ p: 1.25 }}>
      <Typography variant="subtitle2" sx={{ color: c.chatBodyText, fontWeight: 700, fontSize: 14 }}>
        {model.formTitle || "Before we start"}
      </Typography>
      {model.formSubtitle.trim() ? (
        <Typography variant="caption" sx={{ color: c.chatMutedText, display: "block", mt: -0.5 }}>
          {model.formSubtitle}
        </Typography>
      ) : null}
      {inquiryList.length ? (
        <Stack spacing={0.75}>
          <Typography variant="caption" sx={{ color: c.chatMutedText, fontSize: 11, fontWeight: 600 }}>
            Inquiry topics
          </Typography>
          <Stack direction="row" flexWrap="wrap" gap={0.75}>
            {inquiryList.map((opt, i) => (
              <Box
                key={opt}
                component="span"
                sx={{
                  px: 1.1,
                  py: 0.45,
                  borderRadius: 2,
                  fontSize: 11,
                  fontWeight: 600,
                  border: `1px solid ${i === 0 ? c.inquiryPillSelectedBg ?? model.buttonColor : c.inquiryPillBorder}`,
                  bgcolor: i === 0 ? c.inquiryPillSelectedBg ?? model.buttonColor : c.inquiryPillBg,
                  color: i === 0 ? c.inquiryPillSelectedText ?? "#fff" : c.inquiryPillText,
                }}
              >
                {opt}
              </Box>
            ))}
            {!model.inquiryRequired && model.inquirySkipLabel?.trim() ? (
              <Box
                component="span"
                sx={{
                  px: 1.1,
                  py: 0.45,
                  borderRadius: 2,
                  fontSize: 11,
                  fontWeight: 600,
                  border: `1px dashed ${c.inquiryPillBorder}`,
                  bgcolor: "transparent",
                  color: c.inquiryPillText,
                }}
              >
                {model.inquirySkipLabel.trim()}
              </Box>
            ) : null}
          </Stack>
        </Stack>
      ) : model.inquiryOn ? (
        <Typography variant="caption" sx={{ color: c.chatMutedText, fontStyle: "italic" }}>
          Inquiry topics enabled — add at least one topic label.
        </Typography>
      ) : null}
      {model.prechatNameEnabled ? <MockField label="Name" colors={c} /> : null}
      {model.prechatEmailEnabled ? <MockField label="Email" colors={c} /> : null}
      {model.prechatPhoneEnabled ? <MockField label="Phone" colors={c} /> : null}
      {model.prechatMessageEnabled ? <MockField label="Message" colors={c} /> : null}
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
      {model.consentRequired ? (
        <Box sx={{ display: "flex", alignItems: "flex-start", gap: 0.5 }}>
          <Checkbox size="small" checked disabled sx={{ p: 0, mt: 0.15 }} />
          <Typography variant="caption" sx={{ color: c.chatMutedText, fontSize: 11 }}>
            {model.consentText || "I agree to the chat terms and privacy policy."}
          </Typography>
        </Box>
      ) : null}
    </Stack>
  );
}

function OfflineFormPreview({ model }: { model: BehaviorLivePreviewModel }) {
  const c = model.colors;

  if (!model.offlineFormEnabled) {
    return (
      <Box sx={{ p: 2, textAlign: "center" }}>
        <Typography variant="body2" sx={{ color: c.chatMutedText }}>
          Offline form disabled — visitors only see the offline message.
        </Typography>
      </Box>
    );
  }

  return (
    <Stack spacing={1} sx={{ p: 1.25 }}>
      <Typography variant="subtitle2" sx={{ color: c.chatBodyText, fontWeight: 700, fontSize: 14 }}>
        {model.offlineFormTitle || "Leave us a message"}
      </Typography>
      {model.offlineFormSubtitle?.trim() ? (
        <Typography variant="caption" sx={{ color: c.chatMutedText, display: "block", mt: -0.5 }}>
          {model.offlineFormSubtitle}
        </Typography>
      ) : null}
      {model.offlineMessage.trim() ? (
        <Typography variant="caption" sx={{ color: c.chatMutedText, display: "block" }}>
          {model.offlineMessage}
        </Typography>
      ) : null}
      {model.offlinePrechatNameEnabled ? <MockField label="Name" colors={c} /> : null}
      {model.offlinePrechatEmailEnabled ? <MockField label="Email" colors={c} /> : null}
      {model.offlinePrechatPhoneEnabled ? <MockField label="Phone" colors={c} /> : null}
      {model.offlinePrechatMessageEnabled ? <MockField label="Message" colors={c} /> : null}
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
        {model.offlineFormSubmitLabel || "Send message"}
      </Button>
    </Stack>
  );
}

function ChatWithTalkToAgentPreview({ model }: { model: BehaviorLivePreviewModel }) {
  const c = model.colors;
  const showTalkToAgent = model.talkToAgentEnabled && model.chatMode === "HYBRID";

  return (
    <Stack spacing={1} sx={{ p: 0, flex: 1, minHeight: 0 }}>
      <Box sx={{ px: 1.5, py: 1.1, bgcolor: model.buttonColor, color: model.textColor }}>
        <Typography variant="subtitle2" sx={{ color: "inherit", fontWeight: 700, fontSize: 14 }}>
          {model.headerTitle.trim() || null}
        </Typography>
        <Typography variant="caption" sx={{ color: "inherit", opacity: 0.85 }}>
          Online
        </Typography>
      </Box>
      <Stack spacing={1} sx={{ p: 1.25, flex: 1 }}>
        {model.greetingMessage.trim() ? (
          <Box
            sx={{
              alignSelf: "flex-start",
              maxWidth: "88%",
              px: 1.25,
              py: 0.9,
              borderRadius: 1.5,
              bgcolor: c.greetingBubbleBg,
              color: c.greetingBubbleText,
              fontSize: 13,
            }}
          >
            {model.greetingMessage}
          </Box>
        ) : null}
        {model.firstMessage.trim() ? (
          <Box
            sx={{
              alignSelf: "flex-start",
              maxWidth: "88%",
              px: 1.25,
              py: 0.9,
              borderRadius: 1.5,
              bgcolor: c.incomingMessageBg,
              color: c.incomingMessageText,
              fontSize: 13,
            }}
          >
            {model.firstMessage}
          </Box>
        ) : null}
        <Box
          sx={{
            alignSelf: "flex-end",
            maxWidth: "78%",
            px: 1.25,
            py: 0.9,
            borderRadius: 1.5,
            bgcolor: c.outgoingMessageBg,
            color: c.outgoingMessageText,
            fontSize: 13,
          }}
        >
          Sample visitor message
        </Box>
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
              sx={{ color: c.inputPlaceholderColor || c.chatMutedText, flex: 1, fontSize: 12, fontStyle: "italic" }}
            >
              {model.sendPlaceholder || "Type a message…"}
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
          {showTalkToAgent ? (
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
                border: `1px solid ${c.talkToAgentButtonBorder}`,
                bgcolor: c.talkToAgentButtonBg,
                color: c.talkToAgentButtonText,
                fontSize: 13,
                fontWeight: 600,
                cursor: "default",
              }}
            >
              {model.talkToAgentTriggerText || "Talk to agent"}
            </Box>
          ) : model.chatMode !== "HYBRID" ? (
            <Typography variant="caption" sx={{ color: c.chatMutedText, display: "block", mt: 1, textAlign: "center" }}>
              Talk to agent is only available in Hybrid mode.
            </Typography>
          ) : (
            <Typography variant="caption" sx={{ color: c.chatMutedText, display: "block", mt: 1, textAlign: "center" }}>
              Talk to agent button hidden.
            </Typography>
          )}
        </Box>
      </Stack>
    </Stack>
  );
}

export function WidgetBehaviorLivePreview({
  model,
  subtitle = 'Visitor form (info collection) then chat with one "Talk to agent" button in Hybrid mode.',
}: {
  model: BehaviorLivePreviewModel;
  subtitle?: string;
}) {
  const theme = useTheme() as AppTheme;
  const [tab, setTab] = useState<BehaviorPreviewTab>("form");
  const c = model.colors;
  const showOfflineTab = model.offlineFormEnabled !== false;

  return (
    <Box>
      <Typography variant="mediumLarge" sx={{ color: theme.app.text.primary, mb: 1 }}>
        Forms &amp; chat preview
      </Typography>
      <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted, display: "block", mb: 1 }}>
        {subtitle}
      </Typography>
      <ToggleButtonGroup
        exclusive
        size="small"
        value={tab}
        onChange={(_, v: BehaviorPreviewTab | null) => {
          if (v) setTab(v);
        }}
        sx={{ mb: 1.5, flexWrap: "wrap" }}
      >
        <ToggleButton value="form" sx={{ textTransform: "none", fontSize: 12 }}>
          Visitor form
        </ToggleButton>
        {showOfflineTab ? (
          <ToggleButton value="offline" sx={{ textTransform: "none", fontSize: 12 }}>
            Offline form
          </ToggleButton>
        ) : null}
        <ToggleButton value="chat" sx={{ textTransform: "none", fontSize: 12 }}>
          Chat
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
        <Box
          sx={{
            borderRadius: 2,
            overflow: "hidden",
            border: `1px solid ${c.inputBorderColor}`,
            bgcolor: model.backgroundColor,
            maxWidth: 320,
            mx: "auto",
            minHeight: 280,
            display: "flex",
            flexDirection: "column",
          }}
        >
          {tab === "form" ? (
            <VisitorFormPreview model={model} />
          ) : tab === "offline" ? (
            <OfflineFormPreview model={model} />
          ) : (
            <ChatWithTalkToAgentPreview model={model} />
          )}
        </Box>
        {tab !== "offline" && model.offlineMessage.trim() ? (
          <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted, mt: 1, display: "block", textAlign: "center" }}>
            When offline: {model.offlineMessage}
          </Typography>
        ) : null}
      </Box>
    </Box>
  );
}
