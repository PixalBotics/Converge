"use client";

import { useMemo, useState, type ReactNode } from "react";
import AutoAwesome from "@mui/icons-material/AutoAwesome";
import CloseRounded from "@mui/icons-material/CloseRounded";
import QuickreplyOutlined from "@mui/icons-material/QuickreplyOutlined";
import Search from "@mui/icons-material/Search";
import Box from "@mui/material/Box";
import Collapse from "@mui/material/Collapse";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import { alpha, useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { Button, Typography } from "@/components/common";
import { extractApiErrorMessageForToast } from "@/lib/notify/extract-api-message";
import Link from "next/link";
import type { AgentAiAction } from "@/api/ai/agent-suggest.api";
import type { CannedResponseRow } from "@/services/chat/chat-settings.types";
import { CANNED_PERSONAL } from "../constants/canned-messages";
import type { AiChatMessage } from "../types/ai-chat";
import { useAgentCannedResponses } from "../hooks/useAgentCannedResponses";
import { AiAssistantDrawer } from "./AiAssistantDrawer";
import {
  CannedReplyCard,
  CannedReplyGrid,
  ComposerFooterInner,
  ComposerFooterShell,
  ComposerTextField,
  ComposerToolsBody,
  ComposerToolsHeader,
  ComposerToolsPanel,
  DrawerTabBar,
  DrawerTabButton,
  SubTabButton,
  SubTabRow,
} from "../styles/chat-operations.styled";

type DrawerId = "canned" | "ai";
type CannedTabId = "website" | "shortcuts";

const CANNED_TAB_LABELS: Record<CannedTabId, string> = {
  website: "Website",
  shortcuts: "Shortcuts",
};

interface ComposerDrawerTabsProps {
  children: ReactNode;
  onInsertCanned: (text: string) => void;
  websiteId?: string | null;
  departmentId?: string | null;
  aiMessages: AiChatMessage[];
  aiPrompt: string;
  onAiPromptChange: (value: string) => void;
  onSendAiPrompt: (prompt: string, action?: AgentAiAction) => void;
  onApplyAiToComposer: (text: string) => void;
  aiBusy: boolean;
  aiDisabled?: boolean;
  websiteRequiredDisabled?: boolean;
  hasConversation: boolean;
  /** When false, skips GET /chat/canned-responses/agent */
  agentInboxEnabled?: boolean;
}

export function ComposerDrawerTabs({
  children,
  onInsertCanned,
  websiteId = null,
  departmentId = null,
  aiMessages,
  aiPrompt,
  onAiPromptChange,
  onSendAiPrompt,
  onApplyAiToComposer,
  aiBusy,
  aiDisabled = false,
  websiteRequiredDisabled = false,
  hasConversation,
  agentInboxEnabled = true,
}: ComposerDrawerTabsProps) {
  const theme = useTheme() as AppTheme;
  const [openDrawer, setOpenDrawer] = useState<DrawerId | null>(null);
  const [cannedTab, setCannedTab] = useState<CannedTabId>("website");
  const [cannedFilter, setCannedFilter] = useState("");

  const cannedQuery = useAgentCannedResponses(websiteId, agentInboxEnabled);
  const websiteReady = Boolean(websiteId?.trim());

  const toggleDrawer = (id: DrawerId) => {
    setOpenDrawer((prev) => (prev === id ? null : id));
  };

  const closeDrawer = () => setOpenDrawer(null);

  const filteredCanned = useMemo(() => {
    const q = cannedFilter.trim().toLowerCase();
    if (cannedTab === "shortcuts") {
      const lines = CANNED_PERSONAL;
      if (!q) return lines.map((body) => ({ id: body, title: body, body }));
      return lines
        .filter((line) => line.toLowerCase().includes(q))
        .map((body) => ({ id: body, title: body, body }));
    }
    const rows: CannedResponseRow[] = cannedQuery.data ?? [];
    if (!q) return rows;
    return rows.filter(
      (r) =>
        r.title.toLowerCase().includes(q) ||
        r.body.toLowerCase().includes(q),
    );
  }, [cannedTab, cannedFilter, cannedQuery.data]);

  return (
    <ComposerFooterShell>
      <ComposerFooterInner>
        <Collapse in={openDrawer !== null} timeout={200} unmountOnExit>
          <ComposerToolsPanel>
            {openDrawer === "canned" ? (
              <>
                <ComposerToolsHeader>
                  <QuickreplyOutlined sx={{ fontSize: 18, color: theme.app.dashboard.accentBlue }} />
                  <Typography fontWeight={700} sx={{ fontSize: 14, flex: 1, color: theme.app.text.primary }}>
                    Canned replies
                  </Typography>
                  <IconButton size="small" aria-label="Close canned replies" onClick={closeDrawer}>
                    <CloseRounded sx={{ fontSize: 18 }} />
                  </IconButton>
                </ComposerToolsHeader>
                <ComposerToolsBody>
                  <SubTabRow sx={{ px: 1.5, pt: 1.5, pb: 0.25 }}>
                    {(["website", "shortcuts"] as CannedTabId[]).map((tab) => (
                      <SubTabButton
                        key={tab}
                        type="button"
                        active={cannedTab === tab}
                        onClick={() => setCannedTab(tab)}
                      >
                        {CANNED_TAB_LABELS[tab]}
                      </SubTabButton>
                    ))}
                  </SubTabRow>
                  {cannedTab === "website" && !websiteReady ? (
                    <Box sx={{ px: 1.5, py: 1 }}>
                      <Typography
                        variant="caption"
                        sx={{ color: theme.app.dashboard.textMuted, display: "block" }}
                      >
                        Open a conversation to load canned replies for that website (manage under
                        Canned in the live chat nav).
                      </Typography>
                    </Box>
                  ) : null}
                  {cannedTab === "website" && websiteReady && cannedQuery.isLoading ? (
                    <Typography variant="caption" sx={{ px: 1.5, py: 1, color: theme.app.dashboard.textMuted }}>
                      Loading website replies…
                    </Typography>
                  ) : null}
                  {cannedTab === "website" && websiteReady && cannedQuery.isError ? (
                    <Typography variant="caption" sx={{ px: 1.5, py: 1, color: theme.palette.error.main }}>
                      {extractApiErrorMessageForToast(
                        cannedQuery.error,
                        "Could not load canned replies.",
                      )}{" "}
                      Ensure your role has chat:access, you are assigned to this website
                      (Primary/Secondary/Backup), and canned messages exist under Canned.
                    </Typography>
                  ) : null}
                  <Box sx={{ px: 1.5, pb: 1 }}>
                    <ComposerTextField
                      fullWidth
                      size="small"
                      placeholder="Search replies…"
                      value={cannedFilter}
                      onChange={(e) => setCannedFilter(e.target.value)}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Search sx={{ fontSize: 18, color: theme.app.dashboard.textMuted }} />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Box>
                  <CannedReplyGrid>
                    {filteredCanned.length === 0 ? (
                      <Box sx={{ px: 0.5, py: 1 }}>
                        <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted, display: "block", mb: 1 }}>
                          {cannedTab === "website" && websiteReady
                            ? "No canned messages for this website yet."
                            : "No matching replies"}
                        </Typography>
                        {cannedTab === "website" && websiteReady ? (
                          <Button
                            type="button"
                            variant="outlined"
                            size="small"
                            component={Link}
                            href="/dashboard/chat-settings"
                          >
                            Manage canned messages
                          </Button>
                        ) : null}
                      </Box>
                    ) : (
                      filteredCanned.map((item) => (
                        <CannedReplyCard key={item.id}>
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            {item.title && item.title !== item.body ? (
                              <Typography
                                component="span"
                                sx={{
                                  display: "block",
                                  fontWeight: 700,
                                  fontSize: 12,
                                  mb: 0.35,
                                  color: theme.app.dashboard.accentBlue,
                                }}
                              >
                                {item.title}
                              </Typography>
                            ) : null}
                            <Typography
                              component="span"
                              sx={{
                                fontSize: 13,
                                lineHeight: 1.45,
                                display: "block",
                                whiteSpace: "pre-wrap",
                                color: theme.app.text.primary,
                              }}
                            >
                              {item.body}
                            </Typography>
                          </Box>
                          <Button
                            type="button"
                            variant="outlined"
                            size="small"
                            sx={{
                              flexShrink: 0,
                              minWidth: 72,
                              fontSize: 12,
                              fontWeight: 600,
                              py: 0.5,
                              borderColor: alpha(theme.app.dashboard.accentBlue, 0.5),
                              color: theme.app.dashboard.accentBlue,
                              "&:hover": {
                                borderColor: theme.app.dashboard.accentBlue,
                                bgcolor: alpha(theme.app.dashboard.accentBlue, 0.12),
                              },
                            }}
                            onClick={() => onInsertCanned(item.body)}
                          >
                            Insert
                          </Button>
                        </CannedReplyCard>
                      ))
                    )}
                  </CannedReplyGrid>
                </ComposerToolsBody>
              </>
            ) : null}

            {openDrawer === "ai" ? (
              <>
                <ComposerToolsHeader>
                  <AutoAwesome sx={{ fontSize: 18, color: theme.app.dashboard.accentViolet }} />
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography fontWeight={700} sx={{ fontSize: 14, color: theme.app.text.primary }}>
                      AI assistant
                    </Typography>
                    <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted, fontSize: 11 }}>
                      {aiBusy ? "Thinking…" : "Powered by conversation context"}
                    </Typography>
                  </Box>
                  <IconButton size="small" aria-label="Close AI assistant" onClick={closeDrawer}>
                    <CloseRounded sx={{ fontSize: 18 }} />
                  </IconButton>
                </ComposerToolsHeader>
                <ComposerToolsBody sx={{ display: "flex", flexDirection: "column", p: 0 }}>
                  <AiAssistantDrawer
                    messages={aiMessages}
                    prompt={aiPrompt}
                    onPromptChange={onAiPromptChange}
                    onSendPrompt={onSendAiPrompt}
                    onApplyToComposer={onApplyAiToComposer}
                    busy={aiBusy}
                    disabled={aiDisabled}
                    websiteRequiredDisabled={websiteRequiredDisabled}
                    hasConversation={hasConversation}
                  />
                </ComposerToolsBody>
              </>
            ) : null}
          </ComposerToolsPanel>
        </Collapse>

        {children}

        <DrawerTabBar>
          <DrawerTabButton
            type="button"
            variant="canned"
            active={openDrawer === "canned"}
            onClick={() => toggleDrawer("canned")}
          >
            <QuickreplyOutlined sx={{ fontSize: 17 }} />
            Canned
          </DrawerTabButton>
          <DrawerTabButton
            type="button"
            variant="ai"
            active={openDrawer === "ai"}
            onClick={() => toggleDrawer("ai")}
          >
            <AutoAwesome sx={{ fontSize: 17 }} />
            AI assist
          </DrawerTabButton>
        </DrawerTabBar>
      </ComposerFooterInner>
    </ComposerFooterShell>
  );
}
