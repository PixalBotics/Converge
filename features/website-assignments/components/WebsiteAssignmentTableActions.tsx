"use client";

import EditOutlined from "@mui/icons-material/EditOutlined";
import DeleteOutline from "@mui/icons-material/DeleteOutline";
import Schedule from "@mui/icons-material/Schedule";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { dataTableActionButton } from "@/components/common";

export type WebsiteAssignmentRowAction = {
  websiteId: string;
  websiteName: string;
};

type WebsiteAssignmentTableActionsProps = {
  row: WebsiteAssignmentRowAction;
  canAssign: boolean;
  onEdit: (row: WebsiteAssignmentRowAction) => void;
  onSchedule: (row: WebsiteAssignmentRowAction) => void;
  onClearAgents: (row: WebsiteAssignmentRowAction) => void;
};

export function WebsiteAssignmentTableActions({
  row,
  canAssign,
  onEdit,
  onSchedule,
  onClearAgents,
}: WebsiteAssignmentTableActionsProps) {
  const theme = useTheme() as AppTheme;

  return (
    <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 0.5, flexWrap: "nowrap" }}>
      <Tooltip title="Service scheduling">
        <IconButton
          size="small"
          sx={dataTableActionButton}
          aria-label={`Service scheduling for ${row.websiteName}`}
          onClick={() => onSchedule(row)}
        >
          <Schedule fontSize="small" />
        </IconButton>
      </Tooltip>
      {canAssign ? (
        <>
          <Tooltip title="Edit website roster">
            <IconButton
              size="small"
              sx={dataTableActionButton}
              aria-label={`Edit assignments for ${row.websiteName}`}
              onClick={() => onEdit(row)}
            >
              <EditOutlined fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Clear all agent slots">
            <IconButton
              size="small"
              sx={{
                ...dataTableActionButton,
                color: theme.app.dashboard.accentRedLight,
              }}
              aria-label={`Clear agents for ${row.websiteName}`}
              onClick={() => onClearAgents(row)}
            >
              <DeleteOutline fontSize="small" />
            </IconButton>
          </Tooltip>
        </>
      ) : null}
    </Box>
  );
}
