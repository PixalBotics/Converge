"use client";

import { useEffect, useMemo, useState } from "react";
import ComputerOutlined from "@mui/icons-material/ComputerOutlined";
import EmailOutlined from "@mui/icons-material/EmailOutlined";
import ExpandMore from "@mui/icons-material/ExpandMore";
import LanguageOutlined from "@mui/icons-material/LanguageOutlined";
import LocationOnOutlined from "@mui/icons-material/LocationOnOutlined";
import PersonOutline from "@mui/icons-material/PersonOutline";
import PhoneOutlined from "@mui/icons-material/PhoneOutlined";
import SmartphoneOutlined from "@mui/icons-material/SmartphoneOutlined";
import Accordion from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Link from "@mui/material/Link";
import { alpha, useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { InputField, Typography } from "@/components/common";
import {
  chatOpsDetailLabelSx,
  chatOpsDetailValueSx,
  chatOpsProfileMetaGridSx,
  chatOpsProfileMetaLabelSx,
  chatOpsProfileMetaValueSx,
} from "../styles/chat-operations.styles";
import { mergeSx } from "@/lib/mui/merge-sx";
import {
  formatProfileChatDurationMinutes,
  formatProfileChatId,
  formatProfileChatTimeUtc,
  isConversationClosed,
  readAgentLabelFromMeta,
  resolveChatEndedAt,
  resolveChatStartedAt,
} from "../utils/visitor-profile-meta";
import type { AgentVisitorPresentation } from "@/services/chat/chat.types";
import { parseVisitorInfo } from "../utils/visitor-info";
import { VisitorLocationMap } from "./VisitorLocationMap";
import { SupervisorToolsPanel } from "./SupervisorToolsPanel";
import { GuestLinkPanel } from "./GuestLinkPanel";
import { useConversationSupervisor } from "../hooks/useConversationSupervisor";
import { canUseSupervisorTools } from "@/lib/permissions/chat-access";
import {
  chatOpsPaneTitleSx,
} from "../styles/chat-operations.styles";
import {
  EmptyState,
  JourneyStep,
  JourneyTimeline,
  PanelColumn,
  PanelHeader,
  ProfileAccordion,
  ProfileDetailRow,
  ProfileHeroCard,
  QueueAvatar,
} from "../styles/chat-operations.styled";

interface VisitorInfoPanelProps {
  visitor: Record<string, unknown> | null;
  conversationId: string | null;
  websiteId?: string | null;
  conversationMeta?: Record<string, unknown> | null;
  visitorPresentation?: AgentVisitorPresentation | null;
  assignedAgentLabel?: string | null;
  assignedAgentId?: string | null;
  currentUserId?: string;
  hasOperational: (p: string) => boolean;
  supervisorRefreshToken?: number;
  onSupervisorActivity?: (payload?: unknown) => void;
  supervisorReadOnly?: boolean;
  showWebsiteFallback?: boolean;
  fallbackWebsiteId?: string;
  onFallbackWebsiteIdChange?: (value: string) => void;
  onCloseChat?: () => void | Promise<void>;
  closeDisabled?: boolean;
  /** Monitor workstation renders supervisor tools in a separate column strip. */
  hideSupervisorTools?: boolean;
}

function DetailField({ label, value }: { label: string; value: string }) {
  return (
    <Box>
      <Typography component="div" sx={chatOpsDetailLabelSx}>{label}</Typography>
      <Typography component="div" sx={chatOpsDetailValueSx}>
        {value}
      </Typography>
    </Box>
  );
}

function ProfileMetaField({
  label,
  value,
  href,
}: {
  label: string;
  value: string;
  href?: string | null;
}) {
  const theme = useTheme() as AppTheme;
  return (
    <Box>
      <Typography component="div" sx={chatOpsProfileMetaLabelSx}>
        {label}
      </Typography>
      {href ? (
        <Link
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          sx={mergeSx(chatOpsProfileMetaValueSx, {
            color: theme.app.dashboard.accentBlue,
            textDecoration: "underline",
            display: "inline-block",
          })}
        >
          {value}
        </Link>
      ) : (
        <Typography component="div" sx={chatOpsProfileMetaValueSx}>
          {value}
        </Typography>
      )}
    </Box>
  );
}

function VisitorProfileMetaGrid({
  conversationId,
  conversationMeta,
  visitorPresentation,
  assignedAgentLabel,
  sessionStartedAt,
  currentPageUrl,
}: {
  conversationId: string;
  conversationMeta?: Record<string, unknown> | null;
  visitorPresentation?: AgentVisitorPresentation | null;
  assignedAgentLabel?: string | null;
  sessionStartedAt?: string;
  currentPageUrl?: string;
}) {
  const websiteUrl =
    visitorPresentation?.websiteUrl?.trim() ||
    currentPageUrl?.trim() ||
    (typeof conversationMeta?.websiteUrl === "string" ? conversationMeta.websiteUrl.trim() : "") ||
    "";
  const websiteDisplay = websiteUrl || "—";
  const agentLabel =
    assignedAgentLabel?.trim() ||
    readAgentLabelFromMeta(conversationMeta) ||
    "Unassigned";
  const chatId = formatProfileChatId(conversationId);
  const startedAt = resolveChatStartedAt(conversationMeta, sessionStartedAt);
  const endedAt = resolveChatEndedAt(conversationMeta);
  const closed = isConversationClosed(conversationMeta);

  const [durationLabel, setDurationLabel] = useState(() =>
    startedAt ? formatProfileChatDurationMinutes(startedAt, endedAt ? new Date(endedAt).getTime() : undefined) : "—",
  );

  useEffect(() => {
    if (!startedAt) {
      setDurationLabel("—");
      return;
    }
    const endMs = endedAt ? new Date(endedAt).getTime() : undefined;
    const tick = () => setDurationLabel(formatProfileChatDurationMinutes(startedAt, endMs));
    tick();
    if (closed || endMs != null) return;
    const id = window.setInterval(tick, 30_000);
    return () => window.clearInterval(id);
  }, [startedAt, endedAt, closed]);

  const chatTime = useMemo(
    () => (startedAt ? formatProfileChatTimeUtc(startedAt) : "—"),
    [startedAt],
  );

  return (
    <Box sx={{ ...chatOpsProfileMetaGridSx, px: 2, pt: 2, pb: 2 }}>
      <ProfileMetaField label="Website" value={websiteDisplay} href={websiteUrl || null} />
      <ProfileMetaField label="Chat time" value={chatTime} />
      <ProfileMetaField label="Agent" value={agentLabel} />
      <ProfileMetaField label="Chat duration" value={durationLabel} />
      <ProfileMetaField label="Chat ID" value={chatId} />
    </Box>
  );
}

function accordionSx(theme: AppTheme): object {
  const d = theme.app.dashboard;
  return {
    background: "transparent",
    boxShadow: "none",
    "&:before": { display: "none" },
    borderBottom: `1px solid ${alpha(d.cardBorder, 0.35)}`,
    "&.Mui-expanded": { margin: 0 },
  };
}

export function VisitorInfoPanel({
  visitor,
  conversationId,
  websiteId = null,
  conversationMeta,
  visitorPresentation = null,
  assignedAgentLabel = null,
  assignedAgentId = null,
  currentUserId,
  hasOperational,
  supervisorRefreshToken = 0,
  onSupervisorActivity,
  supervisorReadOnly = false,
  showWebsiteFallback = false,
  fallbackWebsiteId = "",
  onFallbackWebsiteIdChange,
  onCloseChat,
  closeDisabled = false,
  hideSupervisorTools = false,
}: VisitorInfoPanelProps) {
  const theme = useTheme() as AppTheme;
  const parsed = parseVisitorInfo(visitor, conversationMeta ?? undefined);
  const displayName = visitorPresentation?.displayName?.trim() || parsed.displayName;
  const originLine = visitorPresentation?.originLabel?.trim() || null;
  const locationLine = visitorPresentation?.locationLabel?.trim() || parsed.location?.label || null;
  const [expanded, setExpanded] = useState<string | false>("contact");
  const supervisorEnabled =
    canUseSupervisorTools(hasOperational) && Boolean(conversationId) && !supervisorReadOnly;
  const supervisor = useConversationSupervisor(conversationId, supervisorEnabled);

  useEffect(() => {
    if (!supervisorEnabled || supervisorRefreshToken === 0) return;
    void supervisor.refresh();
  }, [supervisorRefreshToken, supervisorEnabled, supervisor.refresh]);

  const journey =
    parsed.journey.length > 0
      ? parsed.journey
      : parsed.currentPageUrl
        ? [{ url: parsed.currentPageUrl, at: undefined }]
        : [];

  return (
    <PanelColumn sx={{ height: "100%" }}>
      {!conversationId ? (
        <EmptyState sx={{ flex: 1, py: 8 }}>
          <PersonOutline sx={{ fontSize: 36, opacity: 0.3, color: theme.app.dashboard.accentViolet }} />
          <Typography sx={{ color: theme.app.dashboard.textMuted, fontSize: 13, maxWidth: 200 }}>
            Visitor context appears here when you select a chat
          </Typography>
        </EmptyState>
      ) : (
        <>
          <PanelHeader sx={{ py: 1.25, px: 2 }}>
            <Typography sx={chatOpsPaneTitleSx}>Visitor profile</Typography>
          </PanelHeader>
          <VisitorProfileMetaGrid
            conversationId={conversationId}
            conversationMeta={conversationMeta}
            visitorPresentation={visitorPresentation}
            assignedAgentLabel={assignedAgentLabel}
            sessionStartedAt={parsed.sessionStartedAt}
            currentPageUrl={parsed.currentPageUrl}
          />
          <ProfileAccordion sx={{ px: 0 }}>
          <ProfileHeroCard>
            <Box sx={{ display: "flex", gap: 1.5, alignItems: "flex-start" }}>
              <QueueAvatar sx={{ width: 52, height: 52, fontSize: 15 }}>{parsed.initials}</QueueAvatar>
              <Box sx={{ minWidth: 0 }}>
                <Typography fontWeight={700} sx={{ fontSize: 15, color: theme.app.text.primary }}>
                  {displayName}
                </Typography>
                {originLine ? (
                  <Typography sx={{ fontSize: 11, color: theme.app.dashboard.textMuted, mt: 0.5 }}>
                    {originLine}
                  </Typography>
                ) : null}
                {locationLine ? (
                  <Typography sx={{ fontSize: 11, color: theme.app.dashboard.textMuted, mt: 0.25 }}>
                    {locationLine}
                  </Typography>
                ) : null}
                <Chip
                  label={visitorPresentation?.visitorProfileComplete ? "Profile complete" : "Active user"}
                  size="small"
                  sx={{
                    mt: 0.75,
                    height: 22,
                    fontSize: 11,
                    fontWeight: 600,
                    bgcolor: alpha(theme.palette.primary.main, 0.2),
                    color: theme.app.text.primary,
                  }}
                />
              </Box>
            </Box>
            {(parsed.browser || parsed.os) && (
              <Box sx={{ display: "flex", gap: 1, mt: 1.5, color: theme.app.dashboard.textMuted }}>
                {parsed.os?.toLowerCase().includes("mobile") ? (
                  <SmartphoneOutlined sx={{ fontSize: 16 }} />
                ) : (
                  <ComputerOutlined sx={{ fontSize: 16 }} />
                )}
                <Typography sx={{ fontSize: 12 }}>
                  {[parsed.browser, parsed.os].filter(Boolean).join(" · ")}
                </Typography>
              </Box>
            )}
            {parsed.location?.label ? (
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mt: 1 }}>
                <LocationOnOutlined sx={{ fontSize: 18, color: theme.app.dashboard.accentViolet }} />
                <Typography sx={{ fontSize: 13 }}>{parsed.location.label}</Typography>
              </Box>
            ) : null}
          </ProfileHeroCard>

          <Box sx={{ px: 2, pb: 1 }}>
            <GuestLinkPanel
              conversationId={conversationId}
              hasOperational={hasOperational}
              disabled={supervisorReadOnly || closeDisabled}
            />
          </Box>

          <Accordion
            expanded={expanded === "contact"}
            onChange={(_, isExp) => setExpanded(isExp ? "contact" : false)}
            disableGutters
            sx={accordionSx(theme)}
          >
            <AccordionSummary expandIcon={<ExpandMore sx={{ color: theme.app.dashboard.iconMuted }} />}>
              <Typography fontWeight={600} sx={{ fontSize: 14 }}>
                Contact info
              </Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ pt: 0, pb: 2 }}>
              <ProfileDetailRow>
                {parsed.email ? (
                  <Box sx={{ display: "flex", gap: 1, alignItems: "flex-start" }}>
                    <EmailOutlined sx={{ fontSize: 18, color: theme.app.dashboard.iconMuted }} />
                    <Typography sx={{ fontSize: 13, wordBreak: "break-all" }}>{parsed.email}</Typography>
                  </Box>
                ) : null}
                {parsed.phone ? (
                  <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                    <PhoneOutlined sx={{ fontSize: 18, color: theme.app.dashboard.iconMuted }} />
                    <Typography sx={{ fontSize: 13 }}>{parsed.phone}</Typography>
                  </Box>
                ) : null}
                {!parsed.email && !parsed.phone ? (
                  <Typography sx={{ fontSize: 13, color: theme.app.dashboard.textMuted }}>
                    No contact details captured
                  </Typography>
                ) : null}
              </ProfileDetailRow>
            </AccordionDetails>
          </Accordion>

          <Accordion
            expanded={expanded === "session"}
            onChange={(_, isExp) => setExpanded(isExp ? "session" : false)}
            disableGutters
            sx={accordionSx(theme)}
          >
            <AccordionSummary expandIcon={<ExpandMore sx={{ color: theme.app.dashboard.iconMuted }} />}>
              <Typography fontWeight={600} sx={{ fontSize: 14 }}>
                Session
              </Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ pt: 0, pb: 2 }}>
              <ProfileDetailRow>
                {parsed.sessionFields.slice(0, 3).map((f) => (
                  <DetailField key={f.label} label={f.label} value={f.value} />
                ))}
              </ProfileDetailRow>
            </AccordionDetails>
          </Accordion>

          {parsed.location ? (
            <Accordion
              expanded={expanded === "location"}
              onChange={(_, isExp) => setExpanded(isExp ? "location" : false)}
              disableGutters
              sx={accordionSx(theme)}
            >
              <AccordionSummary expandIcon={<ExpandMore sx={{ color: theme.app.dashboard.iconMuted }} />}>
                <Typography fontWeight={600} sx={{ fontSize: 14 }}>
                  Location
                </Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ pt: 0, pb: 2 }}>
                <VisitorLocationMap location={parsed.location} />
              </AccordionDetails>
            </Accordion>
          ) : null}

          {parsed.currentPageUrl ? (
            <Accordion
              expanded={expanded === "page"}
              onChange={(_, isExp) => setExpanded(isExp ? "page" : false)}
              disableGutters
              sx={accordionSx(theme)}
            >
              <AccordionSummary expandIcon={<ExpandMore sx={{ color: theme.app.dashboard.iconMuted }} />}>
                <Typography fontWeight={600} sx={{ fontSize: 14 }}>
                  Current page
                </Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ pt: 0, pb: 2 }}>
                <Box sx={{ display: "flex", gap: 0.75, alignItems: "flex-start" }}>
                  <LanguageOutlined sx={{ fontSize: 18, color: theme.app.dashboard.iconMuted }} />
                  <Link
                    href={parsed.currentPageUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{ fontSize: 12, wordBreak: "break-all", color: theme.app.dashboard.accentBlue }}
                  >
                    {parsed.currentPageUrl}
                  </Link>
                </Box>
              </AccordionDetails>
            </Accordion>
          ) : null}

          {journey.length > 0 ? (
            <Accordion
              expanded={expanded === "journey"}
              onChange={(_, isExp) => setExpanded(isExp ? "journey" : false)}
              disableGutters
              sx={accordionSx(theme)}
            >
              <AccordionSummary expandIcon={<ExpandMore sx={{ color: theme.app.dashboard.iconMuted }} />}>
                <Typography fontWeight={600} sx={{ fontSize: 14 }}>
                  Visitor journey
                </Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ pt: 0, pb: 2 }}>
                <JourneyTimeline>
                  {journey.map((step, i) => (
                    <JourneyStep key={`${step.url}-${i}`}>
                      {step.at ? (
                        <Typography sx={{ fontSize: 11, color: theme.app.dashboard.textMuted, mb: 0.25 }}>
                          {step.at}
                        </Typography>
                      ) : null}
                      <Typography sx={{ fontSize: 12, wordBreak: "break-all" }}>{step.url}</Typography>
                    </JourneyStep>
                  ))}
                </JourneyTimeline>
              </AccordionDetails>
            </Accordion>
          ) : null}

          {supervisorEnabled && !hideSupervisorTools ? (
            <Box sx={{ px: 2, pb: 1 }}>
              <SupervisorToolsPanel
                conversationId={conversationId}
                assignedAgentId={assignedAgentId}
                currentUserId={currentUserId}
                hasOperational={hasOperational}
                supervisor={supervisor}
              />
            </Box>
          ) : null}

          {showWebsiteFallback && onFallbackWebsiteIdChange ? (
            <Box sx={{ p: 2 }}>
              <InputField
                label="Website UUID"
                placeholder="For AI when websiteId is missing"
                value={fallbackWebsiteId}
                onChange={(e) => onFallbackWebsiteIdChange(e.target.value)}
              />
            </Box>
          ) : null}
        </ProfileAccordion>
        </>
      )}
    </PanelColumn>
  );
}
