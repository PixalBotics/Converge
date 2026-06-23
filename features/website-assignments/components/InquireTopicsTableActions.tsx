"use client";

import EditIcon from "@mui/icons-material/Edit";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import { dataTableActionButton } from "@/components/common";

export type InquireTopicsRowAction = {
  websiteId: string;
  websiteName: string;
  visitorTopicsConfigured: boolean;
};

export function InquireTopicsTableActions({
  row,
  onEdit,
}: {
  row: InquireTopicsRowAction;
  onEdit: (row: InquireTopicsRowAction) => void;
}) {
  return (
    <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 0.5 }}>
      <Tooltip title={row.visitorTopicsConfigured ? "Edit topics" : "Set up topics"}>
        <IconButton
          size="small"
          sx={dataTableActionButton}
          aria-label={`Edit inquire topics for ${row.websiteName}`}
          onClick={() => onEdit(row)}
        >
          <EditIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    </Box>
  );
}
