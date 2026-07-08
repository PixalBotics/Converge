"use client";

import ChatRounded from "@mui/icons-material/ChatRounded";
import CloseRounded from "@mui/icons-material/CloseRounded";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import { alpha, useTheme } from "@mui/material/styles";
import { useMemo, useState } from "react";
import type { AppTheme } from "@/theme/theme";
import type { JsonRecord } from "@/api/types/common.types";
import { Typography } from "@/components/common";
import { LauncherPresetIcon } from "@/lib/chat-widget/launcherIcons";
import type { LauncherIconPresetId } from "@/lib/chat-widget/widgetDraft";
import type { ParsedSnapshotPreview } from "@/lib/chat-widget/snapshot-preview-model";

const FAB = 56;

function radiusFromShape(shape: unknown): string {
  const s = String(shape ?? "circle").toLowerCase();
  if (s === "square") return "10px";
  if (s === "rounded") return "16px";
  return "50%";
}

function ChatMiniPreview({ chat, compact }: { chat: JsonRecord; compact?: boolean }) {
  const theme = useTheme() as AppTheme;
  const [open, setOpen] = useState(true);

  const launcher = (chat.launcher ?? {}) as JsonRecord;
  const chatBox = (chat.chatBox ?? {}) as JsonRecord;
  const colors = (chat.colors ?? {}) as JsonRecord;

  const position = String(launcher.position ?? "right").toLowerCase();
  const insetBottom = Number(launcher.insetBottomPx ?? 28);
  const insetSide = Number(launcher.insetSidePx ?? 28);
  const iconPreset = String(launcher.iconPreset ?? "") as LauncherIconPresetId;

  const btn = String(colors.button ?? "#1E63D5");
  const btnHover = String(colors.buttonHover ?? btn);
  const iconCol = String(colors.icon ?? "#FFFFFF");
  const headerTextCol = String(colors.headerText ?? "#FFFFFF");

  const headerTitle = String(chatBox.headerTitle ?? "Chat");
  const headerAlign = String(chatBox.headerAlign ?? "Center");
  const greeting = String(chatBox.greetingMessage ?? "");
  const placeholder = String(chatBox.sendPlaceholder ?? "Message…");
  const boxW = Math.min(380, Math.max(260, Number(chatBox.boxWidth ?? 320)));
  const boxH = Math.min(520, Math.max(280, Number(chatBox.boxHeight ?? 360)));

  const horizontalFab =
    position === "left"
      ? { left: insetSide, right: "auto", transform: "none" }
      : position === "center"
        ? {
            left: "50%",
            right: "auto",
            transform: `translateX(calc(-50% + ${insetSide}px))`,
          }
        : { right: insetSide, left: "auto", transform: "none" };

  const panelBottom = insetBottom + FAB + 12;

  const shape = launcher.shape;

  return (
    <Box
      sx={{
        position: "relative",
        width: "100%",
        height: compact ? 300 : 440,
        borderRadius: 2,
        bgcolor: "#E8ECF4",
        overflow: "hidden",
        border: `1px solid ${theme.app.dashboard.cardBorder}`,
      }}
    >
      <Typography
        variant="caption"
        sx={{
          position: "absolute",
          top: 8,
          left: 12,
          right: 12,
          color: theme.app.dashboard.textMuted,
          zIndex: 2,
        }}
      >
        Saved configuration preview (draft or published version from snapshot)
      </Typography>

      {open ? (
        <Box
          sx={{
            ...horizontalFab,
            position: "absolute",
            bottom: panelBottom,
            width: boxW,
            height: boxH,
            maxHeight: "72%",
            borderRadius: 2,
            overflow: "hidden",
            boxShadow: "0 12px 40px rgba(2,12,43,0.35)",
            border: `1px solid ${alpha("#000", 0.08)}`,
            display: "flex",
            flexDirection: "column",
            bgcolor: "#F8FAFC",
            zIndex: 3,
          }}
        >
          <Box
            sx={{
              px: 1.5,
              py: 1.25,
              bgcolor: btn,
              color: headerTextCol,
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              gap: 1,
            }}
          >
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography
                variant="mediumLarge"
                sx={{
                  color: "inherit",
                  textAlign: headerAlign === "Left" ? "left" : "center",
                }}
              >
                {headerTitle}
              </Typography>
              <Typography variant="body2" sx={{ color: "inherit", opacity: 0.92 }}>
                Online
              </Typography>
            </Box>
            <IconButton
              size="small"
              aria-label="Close preview panel"
              onClick={() => setOpen(false)}
              sx={{ color: "inherit", mt: -0.5 }}
            >
              <CloseRounded fontSize="small" />
            </IconButton>
          </Box>
          <Box sx={{ flex: 1, overflow: "auto", p: 1.5 }}>
            {greeting ? (
              <Box
                sx={{
                  alignSelf: "flex-start",
                  maxWidth: "88%",
                  bgcolor: alpha("#64748B", 0.18),
                  borderRadius: 2,
                  px: 1.25,
                  py: 1,
                }}
              >
                <Typography variant="body2" sx={{ color: "#1e293b" }}>
                  {greeting}
                </Typography>
              </Box>
            ) : (
              <Typography variant="body2" sx={{ color: theme.app.dashboard.textMuted }}>
                No greeting message in snapshot.
              </Typography>
            )}
          </Box>
          <Box
            sx={{
              p: 1.25,
              borderTop: `1px solid ${alpha("#64748B", 0.2)}`,
              display: "flex",
              alignItems: "center",
              gap: 1,
              bgcolor: "#fff",
            }}
          >
            <Typography variant="body2" sx={{ color: theme.app.dashboard.textMuted, flex: 1 }}>
              {placeholder}
            </Typography>
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: "50%",
                bgcolor: btn,
                flexShrink: 0,
              }}
            />
          </Box>
        </Box>
      ) : null}

      <Box
        role="presentation"
        onClick={() => setOpen(true)}
        sx={{
          ...horizontalFab,
          position: "absolute",
          bottom: insetBottom,
          width: FAB,
          height: FAB,
          borderRadius: radiusFromShape(shape),
          bgcolor: btn,
          color: iconCol,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          boxShadow: "0 10px 28px rgba(2,12,43,0.35)",
          zIndex: 4,
          "&:hover": { bgcolor: btnHover },
        }}
      >
        {open ? (
          <CloseRounded sx={{ fontSize: 28 }} />
        ) : iconPreset ? (
          <LauncherPresetIcon presetId={iconPreset} color={iconCol} fontSizePx={28} />
        ) : (
          <ChatRounded sx={{ fontSize: 28 }} />
        )}
      </Box>
    </Box>
  );
}

function TextUsMiniPreview({ textUs, compact }: { textUs: JsonRecord; compact?: boolean }) {
  const theme = useTheme() as AppTheme;
  const btn = String(textUs.buttonColor ?? "#da9b2f");
  const headerTitle = String(textUs.headerTitle ?? "Text Us");
  const welcome = String(textUs.welcomeMessage ?? "");
  const position = String(textUs.position ?? "center").toLowerCase();

  const anchor =
    position === "left"
      ? { left: 12, transform: "none" }
      : position === "right"
        ? { right: 12, left: "auto", transform: "none" }
        : { left: "50%", transform: "translateX(-50%)" };

  return (
    <Box
      sx={{
        position: "relative",
        width: "100%",
        height: compact ? 260 : 440,
        borderRadius: 2,
        bgcolor: "#E8ECF4",
        overflow: "hidden",
        border: `1px solid ${theme.app.dashboard.cardBorder}`,
      }}
    >
      <Typography
        variant="caption"
        sx={{
          position: "absolute",
          top: 8,
          left: 12,
          color: theme.app.dashboard.textMuted,
          zIndex: 2,
        }}
      >
        Text Us — saved theme from snapshot
      </Typography>

      <Box
        sx={{
          position: "absolute",
          bottom: 80,
          ...anchor,
          width: "min(320px, 92%)",
          borderRadius: 2,
          overflow: "hidden",
          boxShadow: "0 12px 40px rgba(2,12,43,0.28)",
          bgcolor: "#fff",
          border: `1px solid ${alpha("#000", 0.06)}`,
          zIndex: 3,
        }}
      >
        <Box sx={{ px: 2, py: 1.5, bgcolor: btn, color: "#fff" }}>
          <Typography variant="mediumLarge" sx={{ color: "inherit" }}>
            {headerTitle}
          </Typography>
          {welcome ? (
            <Typography variant="body2" sx={{ color: "inherit", opacity: 0.95, mt: 0.5 }}>
              {welcome}
            </Typography>
          ) : null}
        </Box>
        <Box sx={{ p: 2 }}>
          <Typography variant="body2" sx={{ color: theme.app.dashboard.textMuted }}>
            Form fields follow your saved <code>config.form.fields</code> on publish.
          </Typography>
        </Box>
      </Box>

      <Box
        sx={{
          position: "absolute",
          bottom: 16,
          right: position === "left" ? "auto" : 12,
          left: position === "left" ? 12 : "auto",
          px: 2,
          py: 1,
          borderRadius: "10px 10px 0 0",
          bgcolor: btn,
          color: "#fff",
          fontWeight: 700,
          fontSize: "0.9rem",
          boxShadow: "0 6px 20px rgba(0,0,0,0.2)",
        }}
      >
        Text Us
      </Box>
    </Box>
  );
}

export function WidgetSnapshotPreview({
  parsed,
}: {
  parsed: ParsedSnapshotPreview | null;
}) {
  const theme = useTheme() as AppTheme;

  const body = useMemo(() => {
    if (!parsed || !parsed.hasRenderable) {
      return (
        <Typography variant="body2" sx={{ color: theme.app.dashboard.textMuted }}>
          No theme blocks found under <code>draft.config.theme.designJson</code>. Save the widget
          or open the editor snapshot below.
        </Typography>
      );
    }

    if (parsed.kind === "TEXT_US" && parsed.textUs) {
      return <TextUsMiniPreview textUs={parsed.textUs} />;
    }

    if (parsed.kind === "CHAT" && parsed.chat) {
      return <ChatMiniPreview chat={parsed.chat} />;
    }

    if (parsed.kind === "BOTH") {
      return (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {parsed.chat ? (
            <>
              <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted }}>
                Chat surface
              </Typography>
              <ChatMiniPreview chat={parsed.chat} compact />
            </>
          ) : null}
          {parsed.textUs ? (
            <>
              <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted }}>
                Text Us surface
              </Typography>
              <TextUsMiniPreview textUs={parsed.textUs} compact />
            </>
          ) : null}
        </Box>
      );
    }

    if (parsed.chat) return <ChatMiniPreview chat={parsed.chat} />;
    if (parsed.textUs) return <TextUsMiniPreview textUs={parsed.textUs} />;

    return (
      <Typography variant="body2" sx={{ color: theme.app.dashboard.textMuted }}>
        Could not render preview from snapshot shape.
      </Typography>
    );
  }, [parsed, theme.app.dashboard.textMuted]);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
      {parsed?.mode ? (
        <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted }}>
          Mode in snapshot: <strong>{parsed.mode}</strong> · Type: <strong>{parsed.widgetTypeLabel}</strong>
        </Typography>
      ) : (
        <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted }}>
          Widget type: <strong>{parsed?.widgetTypeLabel ?? "—"}</strong>
        </Typography>
      )}
      {body}
    </Box>
  );
}
