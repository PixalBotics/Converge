"use client";

import { useCallback, useEffect, useState } from "react";
import EmailOutlined from "@mui/icons-material/EmailOutlined";
import PersonOutline from "@mui/icons-material/PersonOutline";
import PhoneOutlined from "@mui/icons-material/PhoneOutlined";
import Box from "@mui/material/Box";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import { alpha, useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { Typography } from "@/components/common";
import type { VisitorProfileField } from "@/services/chat/chat.types";
import { patchAgentVisitorProfile } from "@/services/chat/agent-inbox.api";
import { publishAppToast } from "@/lib/notify";
import {
  readVisitorProfileErrorMessage,
  type VisitorProfileCaptureAnchor,
} from "../utils/visitor-profile-capture";

export type { VisitorProfileCaptureAnchor };

type VisitorProfileCaptureMenuProps = {
  conversationId: string;
  anchor: VisitorProfileCaptureAnchor | null;
  onClose: () => void;
};

function isAlreadySetError(err: unknown): boolean {
  const msg = readVisitorProfileErrorMessage(err).toLowerCase();
  return msg.includes("already set");
}

const FIELD_OPTIONS: Array<{
  field: VisitorProfileField;
  label: string;
  icon: typeof PersonOutline;
}> = [
  { field: "name", label: "Set as name", icon: PersonOutline },
  { field: "email", label: "Set as email", icon: EmailOutlined },
  { field: "phone", label: "Set as phone", icon: PhoneOutlined },
];

export function VisitorProfileCaptureMenu({
  conversationId,
  anchor,
  onClose,
}: VisitorProfileCaptureMenuProps) {
  const theme = useTheme() as AppTheme;
  const [busyField, setBusyField] = useState<VisitorProfileField | null>(null);
  const [inlineError, setInlineError] = useState<string | null>(null);

  useEffect(() => {
    if (!anchor) {
      setBusyField(null);
      setInlineError(null);
    }
  }, [anchor]);

  const applyField = useCallback(
    async (field: VisitorProfileField) => {
      if (!anchor?.selectedText.trim()) return;
      const value = anchor.selectedText.trim();
      const body = {
        field,
        value,
        sourceMessageId: anchor.messageId,
        sourceText: value,
      };

      const submit = async (confirmOverwrite = false) => {
        setBusyField(field);
        setInlineError(null);
        try {
          await patchAgentVisitorProfile(conversationId, {
            ...body,
            confirmOverwrite,
          });
          publishAppToast({
            variant: "success",
            message:
              field === "name"
                ? "Visitor name updated."
                : field === "email"
                  ? "Visitor email updated."
                  : "Visitor phone updated.",
          });
          onClose();
        } catch (err) {
          if (!confirmOverwrite && isAlreadySetError(err)) {
            const msg = readVisitorProfileErrorMessage(err);
            const ok = window.confirm(`${msg}\n\nReplace with the selected text?`);
            if (ok) {
              await submit(true);
              return;
            }
            setInlineError(msg);
          } else {
            const msg = readVisitorProfileErrorMessage(err);
            setInlineError(msg);
          }
        } finally {
          setBusyField(null);
        }
      };

      await submit(false);
    },
    [anchor, conversationId, onClose],
  );

  return (
    <Menu
      open={Boolean(anchor)}
      onClose={onClose}
      anchorReference="anchorPosition"
      anchorPosition={
        anchor
          ? { top: anchor.anchorPosition.top, left: anchor.anchorPosition.left }
          : undefined
      }
      slotProps={{
        paper: {
          sx: { minWidth: 220, maxWidth: 320 },
        },
      }}
    >
      {anchor ? (
        <Box sx={{ px: 2, pt: 1.25, pb: 0.75 }}>
          <Typography
            sx={{
              fontSize: 11,
              fontWeight: 600,
              color: theme.app.dashboard.textMuted,
              textTransform: "uppercase",
              letterSpacing: "0.04em",
            }}
          >
            Selected text
          </Typography>
          <Typography
            sx={{
              mt: 0.35,
              fontSize: 13,
              fontWeight: 600,
              color: theme.app.text.primary,
              wordBreak: "break-word",
            }}
          >
            {anchor.selectedText}
          </Typography>
        </Box>
      ) : null}

      {inlineError ? (
        <Box
          sx={{
            mx: 1.5,
            mb: 0.75,
            px: 1.25,
            py: 0.85,
            borderRadius: 1,
            bgcolor: alpha(theme.palette.error.main, 0.12),
            border: `1px solid ${alpha(theme.palette.error.main, 0.35)}`,
          }}
        >
          <Typography
            sx={{
              fontSize: 12,
              lineHeight: 1.45,
              color: theme.palette.error.light,
              fontWeight: 500,
            }}
          >
            {inlineError}
          </Typography>
        </Box>
      ) : null}

      {FIELD_OPTIONS.map(({ field, label, icon: Icon }) => (
        <MenuItem
          key={field}
          disabled={busyField !== null}
          onClick={() => void applyField(field)}
        >
          <ListItemIcon sx={{ minWidth: 32 }}>
            <Icon fontSize="small" />
          </ListItemIcon>
          <ListItemText
            primary={label}
            primaryTypographyProps={{ fontSize: 13 }}
          />
        </MenuItem>
      ))}
    </Menu>
  );
}
