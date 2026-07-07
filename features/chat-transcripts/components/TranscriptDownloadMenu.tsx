"use client";

import { useCallback, useState } from "react";
import ArrowDropDownRounded from "@mui/icons-material/ArrowDropDownRounded";
import DownloadRounded from "@mui/icons-material/DownloadRounded";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { Button } from "@/components/common";
import type { ChatMessage } from "@/services/chat/chat.types";
import { publishAppToast } from "@/lib/notify";
import {
  downloadTranscriptDocx,
  downloadTranscriptXlsx,
  type TranscriptExportMeta,
} from "../utils/export-transcript";

type Props = {
  messages: ChatMessage[];
  meta: TranscriptExportMeta;
  disabled?: boolean;
};

export function TranscriptDownloadMenu({ messages, meta, disabled = false }: Props) {
  const theme = useTheme() as AppTheme;
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [exporting, setExporting] = useState(false);
  const open = Boolean(anchorEl);
  const canDownload = !disabled && messages.length > 0 && !exporting;

  const closeMenu = useCallback(() => setAnchorEl(null), []);

  const handleExcel = useCallback(() => {
    closeMenu();
    try {
      downloadTranscriptXlsx(messages, meta);
    } catch {
      publishAppToast({
        variant: "error",
        message: "Could not export transcript to Excel.",
      });
    }
  }, [closeMenu, messages, meta]);

  const handleWord = useCallback(async () => {
    closeMenu();
    setExporting(true);
    try {
      await downloadTranscriptDocx(messages, meta);
    } catch {
      publishAppToast({
        variant: "error",
        message: "Could not export transcript to Word.",
      });
    } finally {
      setExporting(false);
    }
  }, [closeMenu, messages, meta]);

  return (
    <>
      <Button
        type="button"
        variant="secondary"
        size="compact"
        disabled={!canDownload}
        startIcon={<DownloadRounded sx={{ fontSize: 18 }} />}
        endIcon={<ArrowDropDownRounded sx={{ fontSize: 18 }} />}
        onClick={(e) => setAnchorEl(e.currentTarget)}
        aria-haspopup="menu"
        aria-expanded={open ? "true" : undefined}
      >
        {exporting ? "Exporting…" : "Download"}
      </Button>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={closeMenu}
        slotProps={{
          paper: {
            sx: {
              bgcolor: theme.app.dashboard.menuSurfaceBg,
              border: `1px solid ${theme.app.dashboard.cardBorder}`,
              minWidth: 180,
            },
          },
        }}
      >
        <MenuItem onClick={handleExcel} disabled={!canDownload}>
          Excel (.xlsx)
        </MenuItem>
        <MenuItem onClick={() => void handleWord()} disabled={!canDownload}>
          Word (.docx)
        </MenuItem>
      </Menu>
    </>
  );
}
