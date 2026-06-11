"use client";

import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import VisibilityOutlined from "@mui/icons-material/VisibilityOutlined";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { dataTableActionButton } from "@/components/common";
import { EmailTableActions } from "./EmailTableActions";

export function EmailDesignTableActions({
  previewLabel,
  editLabel,
  canPreview = true,
  canEdit = true,
  previewDisabled = false,
  onPreview,
  onEdit,
}: {
  previewLabel: string;
  editLabel: string;
  canPreview?: boolean;
  canEdit?: boolean;
  previewDisabled?: boolean;
  onPreview?: () => void;
  onEdit?: () => void;
}) {
  const theme = useTheme() as AppTheme;

  if (!canPreview && !canEdit) return null;

  return (
    <Box
      sx={{ display: "flex", justifyContent: "flex-end", gap: 0.5 }}
      onClick={(e) => e.stopPropagation()}
    >
      {canPreview && onPreview ? (
        <IconButton
          size="small"
          aria-label={previewLabel}
          disabled={previewDisabled}
          sx={{ ...dataTableActionButton, color: theme.app.dashboard.white80 }}
          onClick={onPreview}
        >
          <VisibilityOutlined fontSize="small" />
        </IconButton>
      ) : null}
      {canEdit && onEdit ? (
        <EmailTableActions
          editLabel={editLabel}
          deleteLabel=""
          canEdit
          canDelete={false}
          onEdit={onEdit}
        />
      ) : null}
    </Box>
  );
}
