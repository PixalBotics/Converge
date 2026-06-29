"use client";

import type { ReactNode } from "react";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import GroupsOutlined from "@mui/icons-material/GroupsOutlined";
import LanguageOutlined from "@mui/icons-material/LanguageOutlined";
import PersonOutline from "@mui/icons-material/PersonOutline";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Collapse from "@mui/material/Collapse";
import { alpha, useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { Button, Typography } from "@/components/common";
import {
  chatOpsHubControlBarSx,
  chatOpsHubPanelBodySx,
  chatOpsHubSummaryChipSx,
  chatOpsHubToggleButtonSx,
} from "../styles/chat-operations.styles";

type ChatOpsTeamHubSectionProps = {
  open: boolean;
  onToggle: () => void;
  websiteLabel?: string | null;
  websiteSelected: boolean;
  teamAgentName?: string | null;
  agentCount?: number;
  onClearAgent?: () => void;
  children: ReactNode;
};

export function ChatOpsTeamHubSection({
  open,
  onToggle,
  websiteLabel,
  websiteSelected,
  teamAgentName,
  agentCount,
  onClearAgent,
  children,
}: ChatOpsTeamHubSectionProps) {
  const theme = useTheme() as AppTheme;

  const summaryParts = [
    websiteSelected && websiteLabel ? websiteLabel : websiteSelected ? "Website selected" : null,
    teamAgentName ? teamAgentName : agentCount != null && websiteSelected ? `${agentCount} agents` : null,
  ].filter(Boolean);

  return (
    <Box sx={{ flexShrink: 0, minHeight: 0 }}>
      <Box sx={chatOpsHubControlBarSx(open)}>
        <Button
          type="button"
          variant="secondary"
          size="compact"
          onClick={onToggle}
          startIcon={<GroupsOutlined sx={{ fontSize: 17 }} />}
          endIcon={
            open ? (
              <ExpandLess sx={{ fontSize: 18 }} />
            ) : (
              <ExpandMore sx={{ fontSize: 18 }} />
            )
          }
          sx={chatOpsHubToggleButtonSx(open)}
          aria-expanded={open}
          aria-controls="chat-ops-team-hub-panel"
        >
          {open ? "Hide agent picker" : "Show agent picker"}
        </Button>

        {!open ? (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.75,
              flex: 1,
              minWidth: 0,
              flexWrap: "wrap",
              justifyContent: { xs: "flex-start", sm: "flex-end" },
            }}
          >
            {summaryParts.length === 0 ? (
              <Typography
                variant="caption"
                sx={{ color: theme.app.dashboard.textMuted, fontSize: 12, lineHeight: 1.4 }}
              >
                Pick a website and agent to supervise chats
              </Typography>
            ) : (
              <>
                {websiteSelected && websiteLabel ? (
                  <Chip
                    size="small"
                    icon={<LanguageOutlined sx={{ fontSize: "14px !important" }} />}
                    label={websiteLabel}
                    sx={chatOpsHubSummaryChipSx}
                  />
                ) : null}
                {teamAgentName ? (
                  <Chip
                    size="small"
                    icon={<PersonOutline sx={{ fontSize: "14px !important" }} />}
                    label={teamAgentName}
                    onDelete={onClearAgent}
                    sx={chatOpsHubSummaryChipSx}
                  />
                ) : agentCount != null && websiteSelected ? (
                  <Chip
                    size="small"
                    icon={<GroupsOutlined sx={{ fontSize: "14px !important" }} />}
                    label={`${agentCount} agents`}
                    sx={chatOpsHubSummaryChipSx}
                  />
                ) : null}
              </>
            )}
          </Box>
        ) : (
          <Typography
            variant="caption"
            sx={{
              color: theme.app.dashboard.textMuted,
              fontSize: 12,
              display: { xs: "none", md: "block" },
            }}
          >
            Scope and roster — inbox stays full height when hidden
          </Typography>
        )}
      </Box>

      <Collapse in={open} timeout={220} unmountOnExit>
        <Box id="chat-ops-team-hub-panel" sx={chatOpsHubPanelBodySx}>
          {children}
        </Box>
      </Collapse>

      {!open ? (
        <Box
          sx={{
            height: 1,
            mx: { xs: 1.5, sm: 2 },
            bgcolor: alpha(theme.app.dashboard.cardBorder, 0.14),
            flexShrink: 0,
          }}
        />
      ) : null}
    </Box>
  );
}
