"use client";

import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import { Edit as EditIcon, Delete as DeleteIcon } from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { dataTableActionButton } from "@/components/common";

export function EmailTableActions({
  editLabel,
  deleteLabel,
  onEdit,
  onDelete,
  canEdit = true,
  canDelete = true,
  deleteDisabled = false,
  deleting = false,
}: {
  editLabel: string;
  deleteLabel: string;
  onEdit?: () => void;
  onDelete?: () => void;
  canEdit?: boolean;
  canDelete?: boolean;
  deleteDisabled?: boolean;
  deleting?: boolean;
}) {
  const theme = useTheme() as AppTheme;

  if (!canEdit && !canDelete) return null;

  return (
    <Box
      sx={{ display: "flex", justifyContent: "flex-end", gap: 0.5, flexShrink: 0 }}
      onClick={(e) => e.stopPropagation()}
    >
      {canEdit && onEdit ? (
        <IconButton
          size="small"
          aria-label={editLabel}
          sx={{ ...dataTableActionButton, color: theme.app.dashboard.white80 }}
          onClick={onEdit}
        >
          <EditIcon fontSize="small" />
        </IconButton>
      ) : null}
      {canDelete && onDelete ? (
        <IconButton
          size="small"
          aria-label={deleteLabel}
          disabled={deleteDisabled || deleting}
          sx={{ ...dataTableActionButton, color: theme.app.dashboard.accentRedLight }}
          onClick={onDelete}
        >
          <DeleteIcon fontSize="small" />
        </IconButton>
      ) : null}
    </Box>
  );
}
