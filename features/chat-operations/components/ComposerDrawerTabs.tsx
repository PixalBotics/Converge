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
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { Typography } from "@/components/common";
import type { AgentAiAction } from "@/api/ai/agent-suggest.api";
import type { CannedTabId } from "../constants/canned-messages";
import {
  CANNED_TAB_LABELS,
  getCannedMessagesForTab,
} from "../constants/canned-messages";
import type { AiChatMessage } from "../types/ai-chat";
import { AiAssistantDrawer } from "./AiAssistantDrawer";
import {
  CannedReplyGrid,
  CannedReplyRow,
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

const CANNED_TABS: CannedTabId[] = ["personal", "website", "all"];

interface ComposerDrawerTabsProps {
  children: ReactNode;
  onInsertCanned: (text: string) => void;
  aiMessages: AiChatMessage[];
  aiPrompt: string;
  onAiPromptChange: (value: string) => void;
  onSendAiPrompt: (prompt: string, action?: AgentAiAction) => void;
  onApplyAiToComposer: (text: string) => void;
  aiBusy: boolean;
  aiDisabled?: boolean;
  websiteRequiredDisabled?: boolean;
  hasConversation: boolean;
}

export function ComposerDrawerTabs({
  children,
  onInsertCanned,
  aiMessages,
  aiPrompt,
  onAiPromptChange,
  onSendAiPrompt,
  onApplyAiToComposer,
  aiBusy,
  aiDisabled = false,
  websiteRequiredDisabled = false,
  hasConversation,
}: ComposerDrawerTabsProps) {
  const theme = useTheme() as AppTheme;
  const [openDrawer, setOpenDrawer] = useState<DrawerId | null>(null);
  const [cannedTab, setCannedTab] = useState<CannedTabId>("personal");
  const [cannedFilter, setCannedFilter] = useState("");

  const toggleDrawer = (id: DrawerId) => {
    setOpenDrawer((prev) => (prev === id ? null : id));
  };

  const closeDrawer = () => setOpenDrawer(null);

  const filteredCanned = useMemo(() => {
    const base = getCannedMessagesForTab(cannedTab);
    const q = cannedFilter.trim().toLowerCase();
    if (!q) return base;
    return base.filter((line) => line.toLowerCase().includes(q));
  }, [cannedTab, cannedFilter]);

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
                  <SubTabRow sx={{ px: 1.5, pt: 1.25, mb: 0 }}>
                    {CANNED_TABS.map((tab) => (
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
                      <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted, px: 0.5 }}>
                        No matching replies
                      </Typography>
                    ) : (
                      filteredCanned.map((line) => (
                        <CannedReplyRow
                          key={line}
                          type="button"
                          onClick={() => {
                            onInsertCanned(line);
                            closeDrawer();
                          }}
                        >
                          {line}
                        </CannedReplyRow>
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
