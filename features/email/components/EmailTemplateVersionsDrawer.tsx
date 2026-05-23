"use client";

import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import Skeleton from "@mui/material/Skeleton";
import CloseOutlined from "@mui/icons-material/CloseOutlined";
import HistoryOutlined from "@mui/icons-material/HistoryOutlined";
import RestoreOutlined from "@mui/icons-material/RestoreOutlined";
import { alpha, useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { Button, Typography } from "@/components/common";
import type { EmailTemplateVersionRow } from "@/api/types/email.types";
import { extractApiErrorMessageForToast, publishAppToast } from "@/lib/notify";

const DRAWER_BG = "#0e1524";

function VersionCard({
  row,
  canRestore,
  restoring,
  onRestore,
}: {
  row: EmailTemplateVersionRow;
  canRestore: boolean;
  restoring: boolean;
  onRestore: () => void;
}) {
  const theme = useTheme() as AppTheme;

  return (
    <Box
      sx={{
        p: 2,
        borderRadius: 2,
        border: `1px solid ${row.isCurrent ? alpha(theme.palette.success.main, 0.45) : alpha(theme.palette.common.white, 0.12)}`,
        bgcolor: row.isCurrent
          ? alpha(theme.palette.success.main, 0.08)
          : alpha(theme.palette.common.white, 0.04),
      }}
    >
      <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "flex-start", gap: 1, mb: 1 }}>
        <Typography variant="medium" fontWeight={700} color="white">
          {row.versionLabel}
        </Typography>
        {row.isCurrent ? (
          <Chip size="small" color="success" label="Live now" />
        ) : row.isArchived ? (
          <Chip
            size="small"
            label="Archived"
            sx={{
              color: alpha(theme.palette.common.white, 0.85),
              borderColor: alpha(theme.palette.common.white, 0.25),
            }}
            variant="outlined"
          />
        ) : null}
      </Box>

      <Typography variant="small" sx={{ color: alpha(theme.palette.common.white, 0.75), display: "block" }}>
        {row.name}
      </Typography>

      <Typography
        variant="caption"
        sx={{ color: alpha(theme.palette.common.white, 0.55), display: "block", mt: 0.75 }}
      >
        Published{" "}
        {row.publishedAt ? new Date(row.publishedAt).toLocaleString() : "—"}
        {row.publishedBy?.displayName || row.publishedBy?.email
          ? ` · ${row.publishedBy.displayName ?? row.publishedBy.email}`
          : ""}
      </Typography>

      <Typography
        variant="caption"
        sx={{ color: alpha(theme.palette.common.white, 0.45), display: "block", mt: 0.25 }}
      >
        {row.blockCount} content block{row.blockCount === 1 ? "" : "s"}
      </Typography>

      {canRestore ? (
        <Button
          type="button"
          variant="secondary"
          size="compact"
          startIcon={<RestoreOutlined />}
          disabled={restoring}
          onClick={onRestore}
          sx={{ mt: 1.5 }}
        >
          {restoring ? "Restoring…" : "Restore to draft"}
        </Button>
      ) : null}
    </Box>
  );
}

export function EmailTemplateVersionsDrawer({
  open,
  onClose,
  title,
  versions,
  loading,
  restoringId,
  canRestore,
  onRestore,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  versions: EmailTemplateVersionRow[];
  loading?: boolean;
  restoringId?: string | null;
  canRestore: boolean;
  onRestore: (versionId: string) => Promise<void>;
}) {
  const theme = useTheme() as AppTheme;

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      slotProps={{
        backdrop: {
          sx: {
            bgcolor: alpha(theme.palette.common.black, 0.65),
            backdropFilter: "blur(4px)",
          },
        },
        paper: {
          sx: {
            width: { xs: "100%", sm: 440 },
            maxWidth: "100vw",
            bgcolor: DRAWER_BG,
            backgroundImage: "none",
            backdropFilter: "none",
            borderLeft: `1px solid ${alpha(theme.palette.common.white, 0.12)}`,
            boxShadow: `-12px 0 48px ${alpha(theme.palette.common.black, 0.45)}`,
            display: "flex",
            flexDirection: "column",
          },
        },
      }}
      sx={{ zIndex: 1700 }}
    >
      <Box
        sx={{
          flexShrink: 0,
          px: 2.5,
          pt: 2.5,
          pb: 2,
          borderBottom: `1px solid ${alpha(theme.palette.common.white, 0.1)}`,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.25 }}>
          <HistoryOutlined sx={{ mt: 0.25, color: theme.palette.primary.light, fontSize: 26 }} />
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="mediumLarge" fontWeight={700} color="white">
              {title}
            </Typography>
            <Typography
              variant="small"
              sx={{ color: alpha(theme.palette.common.white, 0.72), mt: 0.5, lineHeight: 1.5 }}
            >
              Restore copies a version into your draft. Publish when you are ready to go live.
            </Typography>
          </Box>
          <IconButton
            aria-label="Close versions"
            onClick={onClose}
            size="small"
            sx={{
              color: theme.palette.common.white,
              border: `1px solid ${alpha(theme.palette.common.white, 0.2)}`,
            }}
          >
            <CloseOutlined fontSize="small" />
          </IconButton>
        </Box>
      </Box>

      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          overflowY: "auto",
          px: 2.5,
          py: 2,
          display: "flex",
          flexDirection: "column",
          gap: 1.5,
        }}
      >
        {loading ? (
          <>
            <Skeleton variant="rounded" height={120} sx={{ bgcolor: alpha(theme.palette.common.white, 0.08) }} />
            <Skeleton variant="rounded" height={120} sx={{ bgcolor: alpha(theme.palette.common.white, 0.08) }} />
          </>
        ) : versions.length === 0 ? (
          <Box
            sx={{
              p: 3,
              borderRadius: 2,
              border: `1px dashed ${alpha(theme.palette.common.white, 0.2)}`,
              textAlign: "center",
            }}
          >
            <Typography variant="small" sx={{ color: alpha(theme.palette.common.white, 0.7) }}>
              No published versions yet. Publish your design to start version history.
            </Typography>
          </Box>
        ) : (
          versions.map((row) => (
            <VersionCard
              key={row.id}
              row={row}
              canRestore={canRestore}
              restoring={restoringId === row.id}
              onRestore={() => {
                if (
                  !window.confirm(
                    `Restore "${row.name}" into the draft? You must publish to apply live.`,
                  )
                ) {
                  return;
                }
                void onRestore(row.id)
                  .then(() => {
                    publishAppToast({
                      variant: "success",
                      message: "Draft updated from version. Publish when ready.",
                    });
                    onClose();
                  })
                  .catch((err) => {
                    publishAppToast({
                      variant: "error",
                      message:
                        extractApiErrorMessageForToast(err) ?? "Could not restore version.",
                    });
                  });
              }}
            />
          ))
        )}
      </Box>
    </Drawer>
  );
}
