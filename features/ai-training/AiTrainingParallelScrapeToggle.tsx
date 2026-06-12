"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import Checkbox from "@mui/material/Checkbox";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import FormControlLabel from "@mui/material/FormControlLabel";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { Button, Typography } from "@/components/common";

export function AiTrainingParallelScrapeToggle({
  checked,
  disabled,
  onSave,
  label = "Faster parallel scrape (optional)",
  description = "Off by default — one page at a time with clear progress. Turn on only if you want several pages fetched at once.",
}: {
  checked: boolean;
  disabled?: boolean;
  onSave: (enabled: boolean) => Promise<void>;
  label?: string;
  description?: string;
}) {
  const theme = useTheme() as AppTheme;
  const d = theme.app.dashboard;
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const apply = async (enabled: boolean) => {
    setSaving(true);
    try {
      await onSave(enabled);
      setConfirmOpen(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <FormControlLabel
        sx={{ alignItems: "flex-start", m: 0 }}
        control={
          <Checkbox
            checked={checked}
            disabled={disabled || saving}
            onChange={(e) => {
              const next = e.target.checked;
              if (next) {
                setConfirmOpen(true);
                return;
              }
              void apply(false);
            }}
            size="small"
            sx={{
              color: d.textMuted,
              "&.Mui-checked": { color: theme.palette.primary.main },
              mt: 0.1,
            }}
          />
        }
        label={
          <Box>
            <Typography variant="body2" fontWeight={700} sx={{ color: theme.app.text.primary }}>
              {label}
            </Typography>
            <Typography variant="caption" sx={{ color: d.textMuted, lineHeight: 1.45, display: "block" }}>
              {description}
            </Typography>
          </Box>
        }
      />

      <Dialog open={confirmOpen} onClose={() => !saving && setConfirmOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Turn on parallel scrape?</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: d.textMuted, lineHeight: 1.6, mb: 1.5 }}>
            Multiple pages will download at the same time. Total scrape time may be shorter, but live
            progress is harder to follow — you may not see which page is active, and some steps can
            look stuck for longer.
          </Typography>
          <Typography variant="body2" sx={{ color: d.textMuted, lineHeight: 1.6 }}>
            Recommended: keep this off unless you need maximum speed and do not need page-by-page
            visibility. This applies on the <strong>next</strong> training or refresh run.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button type="button" variant="secondary" disabled={saving} onClick={() => setConfirmOpen(false)}>
            Cancel
          </Button>
          <Button type="button" variant="primary" disabled={saving} onClick={() => void apply(true)}>
            {saving ? "Saving…" : "Yes, use parallel scrape"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
