"use client";

import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import type { ProactiveSecondaryCta } from "@/lib/chat-widget/proactive-teaser-types";

function WhatsAppIcon({ size = 20 }: { size?: number }) {
  return (
    <Box
      component="svg"
      viewBox="0 0 24 24"
      aria-hidden
      sx={{ width: size, height: size, flexShrink: 0 }}
    >
      <path
        fill="#25D366"
        d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"
      />
    </Box>
  );
}

export type WidgetProactiveTeaserBubbleProps = {
  text: string;
  avatarUrl?: string;
  secondaryCta?: ProactiveSecondaryCta;
  onOpenChat?: () => void;
  backgroundColor?: string;
  textColor?: string;
  motionEnabled?: boolean;
};

export function WidgetProactiveTeaserBubble({
  text,
  avatarUrl = "",
  secondaryCta,
  onOpenChat,
  backgroundColor = "#ffffff",
  textColor = "#0f172a",
  motionEnabled = true,
}: WidgetProactiveTeaserBubbleProps) {
  const copy = text.trim();
  const cta = secondaryCta?.enabled ? secondaryCta : null;
  if (!copy && !cta) return null;

  const handleCardClick = () => {
    if (cta) return;
    onOpenChat?.();
  };

  return (
    <Paper
      elevation={0}
      onClick={cta ? undefined : handleCardClick}
      role={cta ? undefined : onOpenChat ? "button" : undefined}
      tabIndex={cta ? undefined : onOpenChat ? 0 : undefined}
      onKeyDown={
        cta || !onOpenChat
          ? undefined
          : (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onOpenChat();
              }
            }
      }
      sx={{
        maxWidth: 300,
        px: 1.5,
        py: 1.25,
        cursor: cta ? "default" : onOpenChat ? "pointer" : "default",
        borderRadius: 2,
        bgcolor: backgroundColor,
        color: textColor,
        border: "1px solid rgba(15, 23, 42, 0.1)",
        boxShadow: "0 2px 8px rgba(15, 23, 42, 0.08)",
        ...(motionEnabled
          ? {
              animation: "converge-widget-teaser-in 0.35s ease",
              "@keyframes converge-widget-teaser-in": {
                from: { opacity: 0, transform: "translateY(8px)" },
                to: { opacity: 1, transform: "translateY(0)" },
              },
            }
          : {}),
      }}
    >
      <Box sx={{ display: "flex", gap: 1, alignItems: "flex-start", mb: cta ? 1 : 0 }}>
        {avatarUrl.trim() ? (
          <Box
            component="img"
            src={avatarUrl}
            alt=""
            sx={{
              width: 36,
              height: 36,
              borderRadius: "50%",
              objectFit: "cover",
              flexShrink: 0,
            }}
          />
        ) : null}
        <Typography
          variant="body2"
          sx={{ fontSize: 13, lineHeight: 1.45, fontWeight: 500, flex: 1, pt: avatarUrl.trim() ? 0.25 : 0 }}
        >
          {copy}
        </Typography>
      </Box>
      {cta ? (
        <Box
          component="a"
          href={cta.href}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 1,
            py: 1,
            px: 1.25,
            borderRadius: 1.5,
            bgcolor: "#f1f5f9",
            color: "#0f172a",
            textDecoration: "none",
            fontSize: 13,
            fontWeight: 700,
            "&:hover": { bgcolor: "#e2e8f0" },
          }}
        >
          {cta.kind === "whatsapp" ? <WhatsAppIcon /> : null}
          {cta.label}
        </Box>
      ) : null}
    </Paper>
  );
}
