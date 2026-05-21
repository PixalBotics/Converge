"use client";

import Box from "@mui/material/Box";
import Checkbox from "@mui/material/Checkbox";
import Stack from "@mui/material/Stack";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { Typography } from "@/components/common";
import type { WidgetChatColorsDraft } from "@/lib/chat-widget/widget-colors-draft";
import type { WidgetInstallChatMode } from "@/lib/chat-widget/widgetDraft";

export interface BehaviorLivePreviewModel {
  chatMode: WidgetInstallChatMode;
  buttonColor: string;
  backgroundColor: string;
  colors: WidgetChatColorsDraft;
  browserNotification: boolean;
  soundNotification: boolean;
  fallbackText: string;
  botEnabled: boolean;
  welcomeMessageBehavior: string;
  inquiryOn: boolean;
  inquiryOptions: string[];
  autoOpenEnabled: boolean;
  autoOpenDelaySeconds: number;
  fileUploadEnabled: boolean;
  emojiEnabled: boolean;
  consentRequired: boolean;
  consentText: string;
  privacyNotice: string;
  persistVisitorSession: boolean;
  sessionTtlMinutes: number;
  formEnabled: boolean;
  formTitle: string;
  formSubtitle: string;
  formSubmitLabel: string;
  prechatNameEnabled: boolean;
  prechatEmailEnabled: boolean;
  prechatPhoneEnabled: boolean;
  prechatMessageEnabled: boolean;
  responseWelcomeMessage: string;
  responseGreetingMessage: string;
  responseSendPlaceholder: string;
  responseOfflineMessage: string;
  responseAiPromptHint: string;
  handoverEnabled: boolean;
  handoverTriggerText: string;
  greetingMessage: string;
}

function Chip({ label, on }: { label: string; on?: boolean }) {
  const theme = useTheme() as AppTheme;
  return (
    <Box
      component="span"
      sx={{
        px: 0.9,
        py: 0.25,
        borderRadius: 1,
        fontSize: 10,
        fontWeight: 600,
        bgcolor: on ? "rgba(30, 215, 96, 0.2)" : "rgba(148, 163, 184, 0.15)",
        color: on ? "#86efac" : theme.app.dashboard.textMuted,
        border: `1px solid ${on ? "rgba(30, 215, 96, 0.45)" : theme.app.dashboard.cardBorder}`,
      }}
    >
      {label}
    </Box>
  );
}

export function WidgetBehaviorLivePreview({ model }: { model: BehaviorLivePreviewModel }) {
  const theme = useTheme() as AppTheme;
  const c = model.colors;
  const inquiryList = model.inquiryOn
    ? model.inquiryOptions.map((s) => s.trim()).filter(Boolean)
    : [];

  return (
    <Box>
      <Typography variant="mediumLarge" sx={{ color: theme.app.text.primary, mb: 1 }}>
        Live preview
      </Typography>
      <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted, display: "block", mb: 1.5 }}>
        Notifications, behavior, session, form, and response settings as visitors see them.
      </Typography>
      <Box
        sx={{
          border: `1px solid ${theme.app.dashboard.cardBorder}`,
          borderRadius: 2.5,
          p: 1.5,
          bgcolor: "rgba(6, 12, 54, 0.35)",
          overflow: "auto",
          maxHeight: { xl: "calc(100vh - 140px)" },
        }}
      >
        <Stack spacing={1.25}>
          <Stack direction="row" flexWrap="wrap" gap={0.5}>
            <Chip label={model.chatMode} on />
            <Chip label={model.botEnabled ? "Bot on" : "Bot off"} on={model.botEnabled} />
            <Chip
              label={model.browserNotification ? "Browser alerts" : "No browser alerts"}
              on={model.browserNotification}
            />
            <Chip label={model.soundNotification ? "Sound on" : "Sound off"} on={model.soundNotification} />
            <Chip
              label={model.autoOpenEnabled ? `Auto-open ${model.autoOpenDelaySeconds}s` : "No auto-open"}
              on={model.autoOpenEnabled}
            />
            <Chip
              label={model.persistVisitorSession ? `Session ${model.sessionTtlMinutes}m` : "No session persist"}
              on={model.persistVisitorSession}
            />
          </Stack>

          <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted }}>
            Fallback notification: {model.fallbackText || "—"}
          </Typography>

          {model.formEnabled ? (
            <Box
              sx={{
                borderRadius: 2,
                border: `1px solid ${c.inputBorderColor}`,
                bgcolor: model.backgroundColor,
                color: c.chatBodyText,
                p: 1.25,
              }}
            >
              <Typography variant="caption" sx={{ color: c.chatMutedText, display: "block", mb: 0.75 }}>
                Pre-chat form
              </Typography>
              <Typography variant="subtitle2" sx={{ color: c.chatBodyText, fontWeight: 700, fontSize: 13 }}>
                {model.formTitle || "Before we start"}
              </Typography>
              {model.formSubtitle.trim() ? (
                <Typography variant="caption" sx={{ color: c.chatMutedText }}>
                  {model.formSubtitle}
                </Typography>
              ) : null}
              {inquiryList.length ? (
                <Stack direction="row" flexWrap="wrap" gap={0.5} sx={{ mt: 0.75, mb: 0.75 }}>
                  {inquiryList.map((opt, i) => (
                    <Box
                      key={opt}
                      component="span"
                      sx={{
                        px: 0.9,
                        py: 0.35,
                        borderRadius: 2,
                        fontSize: 10,
                        border: `1px solid ${c.inquiryPillBorder}`,
                        bgcolor: i === 0 ? c.inquiryPillSelectedBg ?? model.buttonColor : c.inquiryPillBg,
                        color: i === 0 ? c.inquiryPillSelectedText ?? "#fff" : c.inquiryPillText,
                      }}
                    >
                      {opt}
                    </Box>
                  ))}
                </Stack>
              ) : null}
              <Stack spacing={0.5} sx={{ mt: 0.5 }}>
                {model.prechatNameEnabled ? (
                  <Typography variant="caption" sx={{ color: c.labelColor }}>
                    Name field
                  </Typography>
                ) : null}
                {model.prechatEmailEnabled ? (
                  <Typography variant="caption" sx={{ color: c.labelColor }}>
                    Email field
                  </Typography>
                ) : null}
                {model.prechatPhoneEnabled ? (
                  <Typography variant="caption" sx={{ color: c.labelColor }}>
                    Phone field
                  </Typography>
                ) : null}
                {model.prechatMessageEnabled ? (
                  <Typography variant="caption" sx={{ color: c.labelColor }}>
                    Message field
                  </Typography>
                ) : null}
              </Stack>
              <Box
                sx={{
                  mt: 1,
                  py: 0.6,
                  px: 1,
                  borderRadius: 1.5,
                  bgcolor: model.buttonColor,
                  color: c.outgoingMessageText,
                  fontSize: 12,
                  fontWeight: 700,
                  textAlign: "center",
                }}
              >
                {model.formSubmitLabel || "Start chat"}
              </Box>
              {model.consentRequired ? (
                <Box sx={{ display: "flex", alignItems: "flex-start", gap: 0.5, mt: 1 }}>
                  <Checkbox size="small" checked disabled sx={{ p: 0 }} />
                  <Typography variant="caption" sx={{ color: c.chatMutedText, fontSize: 10 }}>
                    {model.consentText || "Consent required"}
                  </Typography>
                </Box>
              ) : null}
            </Box>
          ) : (
            <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted }}>
              Form disabled — visitors skip straight to chat.
            </Typography>
          )}

          <Box
            sx={{
              borderRadius: 2,
              border: `1px solid ${c.inputBorderColor}`,
              bgcolor: model.backgroundColor,
              color: c.chatBodyText,
              p: 1.25,
            }}
          >
            <Typography variant="caption" sx={{ color: c.chatMutedText, display: "block", mb: 0.75 }}>
              In-chat copy
            </Typography>
            {model.welcomeMessageBehavior.trim() ? (
              <Typography variant="caption" sx={{ display: "block", color: c.chatMutedText, mb: 0.5 }}>
                Behavior welcome: {model.welcomeMessageBehavior}
              </Typography>
            ) : null}
            {model.responseWelcomeMessage.trim() ? (
              <Box
                sx={{
                  px: 1,
                  py: 0.75,
                  borderRadius: 1.5,
                  bgcolor: c.greetingBubbleBg,
                  color: c.greetingBubbleText,
                  fontSize: 12,
                  mb: 0.5,
                }}
              >
                {model.responseWelcomeMessage}
              </Box>
            ) : null}
            {model.responseGreetingMessage.trim() ? (
              <Typography variant="caption" sx={{ color: c.chatBodyText, display: "block", mb: 0.5 }}>
                Greeting: {model.responseGreetingMessage}
              </Typography>
            ) : null}
            {model.greetingMessage.trim() ? (
              <Typography variant="caption" sx={{ color: c.chatMutedText, display: "block", mb: 0.5 }}>
                Chat box greeting: {model.greetingMessage}
              </Typography>
            ) : null}
            {model.responseOfflineMessage.trim() ? (
              <Typography variant="caption" sx={{ color: c.chatMutedText, display: "block", mb: 0.5 }}>
                Offline: {model.responseOfflineMessage}
              </Typography>
            ) : null}
            {model.responseAiPromptHint.trim() ? (
              <Typography variant="caption" sx={{ color: c.chatMutedText, display: "block", mb: 0.5 }}>
                AI hint: {model.responseAiPromptHint}
              </Typography>
            ) : null}
            <Box
              sx={{
                mt: 0.5,
                px: 1,
                py: 0.55,
                borderRadius: 2,
                border: `1px solid ${c.inputBorderColor}`,
                bgcolor: c.inputBackground,
                color: c.inputPlaceholderColor || c.chatMutedText,
                fontSize: 11,
                fontStyle: "italic",
              }}
            >
              {model.responseSendPlaceholder || "Composer placeholder"}
            </Box>
            <Stack direction="row" gap={0.5} sx={{ mt: 0.75 }} flexWrap="wrap">
              <Chip label={model.fileUploadEnabled ? "Uploads" : "No uploads"} on={model.fileUploadEnabled} />
              <Chip label={model.emojiEnabled ? "Emoji" : "No emoji"} on={model.emojiEnabled} />
            </Stack>
            {model.handoverEnabled && model.chatMode === "HYBRID" ? (
              <Box
                sx={{
                  mt: 1,
                  py: 0.65,
                  px: 1,
                  borderRadius: 2,
                  border: `1px solid ${c.handoverButtonBorder}`,
                  bgcolor: c.handoverButtonBg,
                  color: c.handoverButtonText,
                  fontSize: 12,
                  fontWeight: 600,
                  textAlign: "center",
                }}
              >
                {model.handoverTriggerText || "Talk to a human"}
              </Box>
            ) : null}
          </Box>

          {model.privacyNotice.trim() ? (
            <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted, fontSize: 10 }}>
              {model.privacyNotice}
            </Typography>
          ) : null}
        </Stack>
      </Box>
    </Box>
  );
}
