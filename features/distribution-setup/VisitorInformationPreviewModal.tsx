"use client";

import type { ReactNode } from "react";
import { useBodyScrollLock } from "@/lib/ui/useBodyScrollLock";
import { dialogBackdropBackground } from "@/lib/ui/dialogBackdrop";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { Button, Divider, IconSlot, Typography } from "@/components/common";
import { ModalGlassShell } from "@/components/common/FormModal/ModalGlassShell";
import { gradientPrimaryButtonSx } from "@/components/common/Button/Button.styles";
import { CloseCircleIcon } from "@/components/common/icons";
import { modalCloseIconButtonSx } from "@/lib/design-system";

export interface VisitorInformationPreviewModalProps {
  open: boolean;
  onClose: () => void;
}

function InfoGrid({
  items,
}: {
  items: { label: string; value: string }[];
}) {
  const theme = useTheme() as AppTheme;
  const border = `1px solid ${theme.app.dashboard.cardBorder}`;
  const half = Math.ceil(items.length / 2);

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
        border,
        borderRadius: 2,
        overflow: "hidden",
      }}
    >
      {items.map((item, i) => (
        <Box
          key={item.label}
          sx={{
            p: 2,
            borderRight: { xs: "none", sm: i % 2 === 0 ? border : "none" },
            borderBottom: { xs: i < items.length - 1 ? border : "none", sm: i < half * 2 - 2 ? border : "none" },
          }}
        >
          <Typography
            variant="small"
            sx={{ color: theme.app.dashboard.textMuted, fontSize: 12, mb: 0.75, display: "block" }}
          >
            {item.label}
          </Typography>
          <Typography variant="medium" sx={{ color: theme.app.text.primary, fontWeight: 600, fontSize: 15 }}>
            {item.value}
          </Typography>
        </Box>
      ))}
    </Box>
  );
}

function ChatBubble({ children }: { children: ReactNode }) {
  const theme = useTheme() as AppTheme;
  return (
    <Box
      sx={{
        alignSelf: "flex-start",
        maxWidth: "92%",
        px: 1.75,
        py: 1.25,
        borderRadius: 2,
        bgcolor: theme.app.dashboard.overlayMedium,
        border: `1px solid ${theme.app.dashboard.cardBorder}`,
      }}
    >
      <Typography variant="medium" sx={{ color: theme.app.text.primary, fontSize: 14, lineHeight: 1.5 }}>
        {children}
      </Typography>
    </Box>
  );
}

export function VisitorInformationPreviewModal({ open, onClose }: VisitorInformationPreviewModalProps) {
  const theme = useTheme() as AppTheme;
  useBodyScrollLock(open);

  if (!open) return null;

  const visitorItems = [
    { label: "Name", value: "Raja Saif" },
    { label: "Email", value: "john@example.com" },
    { label: "Phone", value: "+1 (555) 012-3456" },
    { label: "Company", value: "Acme Corp" },
  ];

  const deviceItems = [
    { label: "IP Address", value: "192.168.1.1" },
    { label: "Browser", value: "Chrome 114.0" },
    { label: "OS", value: "MacOS Ventura" },
    { label: "Location", value: "New York, USA" },
  ];

  return (
    <Box
      sx={{
        position: "fixed",
        inset: 0,
        zIndex: 1400,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: dialogBackdropBackground(theme),
        p: { xs: 1.5, sm: 2 },
      }}
    >
      <ModalGlassShell
        sx={{
          width: "100%",
          maxWidth: 640,
          maxHeight: "92vh",
          display: "flex",
          flexDirection: "column",
          p: { xs: 2, sm: 3 },
          borderRadius: "20px",
        }}
      >
        <Box
          sx={{
            flexShrink: 0,
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 2,
            mb: 2,
          }}
        >
          <Box>
            <Typography variant="mediumLarge" fontWeight={600} sx={{ color: theme.app.text.primary }}>
              Visitor Information
            </Typography>
            <Typography variant="body2" sx={{ mt: 0.5, color: theme.app.dashboard.textMuted, fontSize: 14 }}>
              Preview visitor details, device, chat, and page context before continuing.
            </Typography>
          </Box>
          <IconButton
            onClick={onClose}
            size="small"
            aria-label="Close preview"
            sx={{
              ...(modalCloseIconButtonSx(theme) as object),
              borderColor: theme.palette.error.main,
              color: theme.palette.error.main,
              "&:hover": {
                borderColor: theme.palette.error.main,
              },
            }}
          >
            <IconSlot slot={36} glyph="md">
              <CloseCircleIcon />
            </IconSlot>
          </IconButton>
        </Box>

        <Box
          sx={{
            flex: 1,
            minHeight: 0,
            overflowY: "auto",
            scrollbarWidth: "none",
            msOverflowStyle: "none",
            "&::-webkit-scrollbar": { display: "none" },
          }}
        >
          <Typography variant="medium" fontWeight={600} sx={{ color: theme.app.text.primary, mb: 1.5 }}>
            Visitor Information
          </Typography>
          <InfoGrid items={visitorItems} />

          <Divider sx={{ my: 2.5, borderColor: theme.app.dashboard.tableDivider }} />

          <Typography variant="medium" fontWeight={600} sx={{ color: theme.app.text.primary, mb: 1.5 }}>
            Device Information
          </Typography>
          <InfoGrid items={deviceItems} />

          <Divider sx={{ my: 2.5, borderColor: theme.app.dashboard.tableDivider }} />

          <Typography variant="medium" fontWeight={600} sx={{ color: theme.app.text.primary, mb: 1.5 }}>
            Chat Conversation
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Box>
              <Box sx={{ display: "flex", alignItems: "baseline", gap: 1, mb: 1 }}>
                <Typography variant="medium" fontWeight={600} sx={{ color: theme.app.text.primary }}>
                  Mojixa Tan
                </Typography>
                <Typography variant="small" sx={{ color: theme.app.dashboard.textMuted, fontSize: 12 }}>
                  09:03 pm
                </Typography>
              </Box>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                <ChatBubble>Hi, how are you all?</ChatBubble>
                <ChatBubble>How many of you prepared the presentation?</ChatBubble>
              </Box>
            </Box>
            <Box>
              <Box sx={{ display: "flex", alignItems: "baseline", gap: 1, mb: 1 }}>
                <Typography variant="medium" fontWeight={600} sx={{ color: theme.app.text.primary }}>
                  Rockstar Benj
                </Typography>
                <Typography variant="small" sx={{ color: theme.app.dashboard.textMuted, fontSize: 12 }}>
                  09:31 pm
                </Typography>
              </Box>
              <ChatBubble>Hello Mojixa! I am just about to start the preparation.</ChatBubble>
            </Box>
          </Box>

          <Divider sx={{ my: 2.5, borderColor: theme.app.dashboard.tableDivider }} />

          <Typography variant="medium" fontWeight={600} sx={{ color: theme.app.text.primary, mb: 1.5 }}>
            Page Information
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Box>
              <Typography variant="small" sx={{ color: theme.app.dashboard.textMuted, fontSize: 12, mb: 0.75 }}>
                URL
              </Typography>
              <Typography variant="medium" sx={{ color: theme.app.text.primary, fontSize: 14, wordBreak: "break-all" }}>
                https://abc.com/pricing
              </Typography>
            </Box>
            <Box>
              <Typography variant="small" sx={{ color: theme.app.dashboard.textMuted, fontSize: 12, mb: 0.75 }}>
                Referrer
              </Typography>
              <Typography variant="medium" sx={{ color: theme.app.text.primary, fontSize: 14, wordBreak: "break-all" }}>
                https://abc.com/pricing
              </Typography>
            </Box>
          </Box>
        </Box>

        <Box sx={{ flexShrink: 0, display: "flex", justifyContent: "flex-end", pt: 2.5, mt: 1 }}>
          <Button type="button" variant="primary" onClick={onClose} sx={gradientPrimaryButtonSx}>
            &lt;&lt; Close Preview
          </Button>
        </Box>
      </ModalGlassShell>
    </Box>
  );
}
