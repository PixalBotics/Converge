"use client";

import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { dataTableActionButton } from "@/components/common";

export type ServiceScheduleRowAction = {
  websiteId: string;
  websiteName: string;
  serviceSchedulingConfigured: boolean;
};

export function ServiceScheduleTableActions({
  row,
  canEdit,
  onEdit,
  onDelete,
}: {
  row: ServiceScheduleRowAction;
  canEdit: boolean;
  onEdit: (row: ServiceScheduleRowAction) => void;
  onDelete: (row: ServiceScheduleRowAction) => void;
}) {
  const theme = useTheme() as AppTheme;

  return (
    <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 0.5 }}>
      <Tooltip title={row.serviceSchedulingConfigured ? "Edit schedule" : "Set up schedule"}>
        <IconButton
          size="small"
          sx={dataTableActionButton}
          aria-label={`Edit schedule for ${row.websiteName}`}
          onClick={() => onEdit(row)}
        >
          <EditIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      {canEdit ? (
        <Tooltip title="Delete schedule (hours + parent-company topics)">
          <IconButton
            size="small"
            sx={{
              ...dataTableActionButton,
              color: theme.app.dashboard.accentRedLight,
            }}
            aria-label={`Delete schedule for ${row.websiteName}`}
            onClick={() => onDelete(row)}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      ) : null}
    </Box>
  );
}
