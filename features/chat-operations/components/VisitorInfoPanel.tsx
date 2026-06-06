"use client";

import { useEffect, useState, type ReactNode } from "react";
import AccessTimeOutlined from "@mui/icons-material/AccessTimeOutlined";
import BusinessOutlined from "@mui/icons-material/BusinessOutlined";
import ComputerOutlined from "@mui/icons-material/ComputerOutlined";
import EmailOutlined from "@mui/icons-material/EmailOutlined";
import ExpandMore from "@mui/icons-material/ExpandMore";
import InfoOutlined from "@mui/icons-material/InfoOutlined";
import LanguageOutlined from "@mui/icons-material/LanguageOutlined";
import LinkOutlined from "@mui/icons-material/LinkOutlined";
import LocationOnOutlined from "@mui/icons-material/LocationOnOutlined";
import PersonOutline from "@mui/icons-material/PersonOutline";
import PhoneOutlined from "@mui/icons-material/PhoneOutlined";
import PublicOutlined from "@mui/icons-material/PublicOutlined";
import RouteOutlined from "@mui/icons-material/RouteOutlined";
import ScheduleOutlined from "@mui/icons-material/ScheduleOutlined";
import SmartphoneOutlined from "@mui/icons-material/SmartphoneOutlined";
import SupportAgentOutlined from "@mui/icons-material/SupportAgentOutlined";
import TagOutlined from "@mui/icons-material/TagOutlined";
import TimerOutlined from "@mui/icons-material/TimerOutlined";
import Accordion from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import { alpha, useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { InputField, Typography } from "@/components/common";
import { chatOpsPaneTitleSx } from "../styles/chat-operations.styles";
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
import {
  ProfileMetaGridCell,
  ProfileMetaGridSection,
} from "./VisitorProfileBlocks";
import { useConversationSupervisor } from "../hooks/useConversationSupervisor";
import { canUseSupervisorTools } from "@/lib/permissions/chat-access";
import {
  EmptyState,
  PanelColumn,
  PanelHeader,
  ProfileAccordion,
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
  hideSupervisorTools?: boolean;
}

const iconSx = { fontSize: 18 };

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

function AccordionSectionTitle({
  icon,
  label,
}: {
  icon: ReactNode;
  label: string;
}) {
  const theme = useTheme() as AppTheme;
  return (
    <Box sx={{ display: "flex", alignItems: "center" }}>
      <Box
        component="span"
        sx={{ fontSize: 18, color: theme.palette.primary.main, mr: 1, display: "flex" }}
      >
        {icon}
      </Box>
      <Typography fontWeight={600} sx={{ fontSize: 14 }}>
        {label}
      </Typography>
    </Box>
  );
}

function sessionFieldIcon(label: string): ReactNode {
  const lower = label.toLowerCase();
  if (lower.includes("session")) return <TagOutlined sx={iconSx} />;
  if (lower.includes("start") || lower.includes("time")) return <ScheduleOutlined sx={iconSx} />;
  if (lower.includes("duration")) return <TimerOutlined sx={iconSx} />;
  if (lower.includes("agent")) return <SupportAgentOutlined sx={iconSx} />;
  if (lower.includes("referrer") || lower.includes("traffic")) return <PublicOutlined sx={iconSx} />;
  if (lower.includes("browser") || lower.includes("device") || lower.includes("os")) {
    return <ComputerOutlined sx={iconSx} />;
  }
  if (lower.includes("country") || lower.includes("region") || lower.includes("zip") || lower.includes("ip")) {
    return <LocationOnOutlined sx={iconSx} />;
  }
  return <InfoOutlined sx={iconSx} />;
}

function contactFieldIcon(label: string): ReactNode {
  const lower = label.toLowerCase();
  if (lower.includes("email")) return <EmailOutlined sx={iconSx} />;
  if (lower.includes("phone")) return <PhoneOutlined sx={iconSx} />;
  if (lower.includes("company")) return <BusinessOutlined sx={iconSx} />;
  return <PersonOutline sx={iconSx} />;
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
  const [expanded, setExpanded] = useState<string | false>(false);
  const supervisorEnabled =
    canUseSupervisorTools(hasOperational) && Boolean(conversationId) && !supervisorReadOnly;
  const supervisor = useConversationSupervisor(conversationId, supervisorEnabled);

  const startedAt = resolveChatStartedAt(conversationMeta, parsed.sessionStartedAt);
  const endedAt = resolveChatEndedAt(conversationMeta);
  const closed = isConversationClosed(conversationMeta);
  const [durationLabel, setDurationLabel] = useState(() =>
    startedAt
      ? formatProfileChatDurationMinutes(
          startedAt,
          endedAt ? new Date(endedAt).getTime() : undefined,
        )
      : "—",
  );

  useEffect(() => {
    if (!startedAt) {
      setDurationLabel("—");
      return;
    }
    const endMs = endedAt ? new Date(endedAt).getTime() : undefined;
    const tick = () =>
      setDurationLabel(formatProfileChatDurationMinutes(startedAt, endMs));
    tick();
    if (closed || endMs != null) return;
    const id = window.setInterval(tick, 30_000);
    return () => window.clearInterval(id);
  }, [startedAt, endedAt, closed]);

  const websiteUrl =
    visitorPresentation?.websiteUrl?.trim() ||
    parsed.currentPageUrl?.trim() ||
    (typeof conversationMeta?.websiteUrl === "string" ? conversationMeta.websiteUrl.trim() : "") ||
    "";
  const agentLabel =
    assignedAgentLabel?.trim() ||
    readAgentLabelFromMeta(conversationMeta) ||
    "Unassigned";
  const chatId = conversationId ? formatProfileChatId(conversationId) : "—";
  const chatTime = startedAt ? formatProfileChatTimeUtc(startedAt) : "—";
  const live = Boolean(startedAt && !closed);
  const deviceLabel = [parsed.browser, parsed.os].filter(Boolean).join(" · ") || null;
  const isMobile = parsed.os?.toLowerCase().includes("mobile");
  const sessionField = (label: string) =>
    parsed.sessionFields.find((f) => f.label === label)?.value ?? "—";
  const visitorTimezone = sessionField("Visitor timezone");
  const agentTimezoneLabel = sessionField("Agent timezone");

  const journey =
    parsed.journey.length > 0
      ? parsed.journey
      : parsed.currentPageUrl
        ? [{ url: parsed.currentPageUrl, at: undefined }]
        : [];

  const toggle = (key: string) => (_: unknown, isExp: boolean) =>
    setExpanded(isExp ? key : false);

  return (
    <PanelColumn sx={{ height: "100%" }}>
      {!conversationId ? (
        <EmptyState sx={{ flex: 1, py: 8 }}>
          <PersonOutline sx={{ fontSize: 36, opacity: 0.3, color: theme.palette.primary.main }} />
          <Typography sx={{ color: theme.app.dashboard.textMuted, fontSize: 13, maxWidth: 200 }}>
            Visitor context appears here when you select a chat
          </Typography>
        </EmptyState>
      ) : (
        <>
          <PanelHeader sx={{ py: 1.25, px: 2 }}>
            <Typography sx={chatOpsPaneTitleSx}>Visitor profile</Typography>
          </PanelHeader>

          <ProfileAccordion sx={{ px: 0 }}>
            <ProfileHeroCard
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "stretch",
                gap: 1.25,
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  textAlign: "center",
                  gap: 0.75,
                }}
              >
                <QueueAvatar sx={{ width: 56, height: 56, fontSize: 16 }}>{parsed.initials}</QueueAvatar>
                <Box sx={{ minWidth: 0, width: "100%" }}>
                  <Typography
                    fontWeight={700}
                    sx={{ fontSize: 16, color: theme.app.text.primary, lineHeight: 1.3 }}
                  >
                    {displayName}
                  </Typography>
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
            </ProfileHeroCard>

            <ProfileMetaGridSection>
              <ProfileMetaGridCell
                icon={<LanguageOutlined sx={{ fontSize: 16 }} />}
                label="Website"
                href={websiteUrl || null}
              >
                {websiteUrl || "—"}
              </ProfileMetaGridCell>
              <ProfileMetaGridCell
                icon={<ScheduleOutlined sx={{ fontSize: 16 }} />}
                label="Chat time"
              >
                {chatTime}
              </ProfileMetaGridCell>
              <ProfileMetaGridCell
                icon={<SupportAgentOutlined sx={{ fontSize: 16 }} />}
                label="Agent"
              >
                {agentLabel}
              </ProfileMetaGridCell>
              <ProfileMetaGridCell
                icon={<TimerOutlined sx={{ fontSize: 16 }} />}
                label="Chat duration"
              >
                {durationLabel}
              </ProfileMetaGridCell>
              <ProfileMetaGridCell
                icon={<TagOutlined sx={{ fontSize: 16 }} />}
                label="Chat ID"
              >
                {chatId}
              </ProfileMetaGridCell>
              <ProfileMetaGridCell
                icon={<AccessTimeOutlined sx={{ fontSize: 16 }} />}
                label="Visitor timezone"
              >
                {visitorTimezone}
              </ProfileMetaGridCell>
              <ProfileMetaGridCell
                icon={<ScheduleOutlined sx={{ fontSize: 16 }} />}
                label="Agent timezone"
              >
                {agentTimezoneLabel}
              </ProfileMetaGridCell>
            </ProfileMetaGridSection>

            <Accordion
              expanded={expanded === "visitor"}
              onChange={toggle("visitor")}
              disableGutters
              sx={accordionSx(theme)}
            >
              <AccordionSummary expandIcon={<ExpandMore sx={{ color: theme.app.dashboard.iconMuted }} />}>
                <AccordionSectionTitle icon={<PersonOutline />} label="Visitor info" />
              </AccordionSummary>
              <AccordionDetails sx={{ p: 0 }}>
                <ProfileMetaGridSection>
                  {locationLine ? (
                    <ProfileMetaGridCell icon={<LocationOnOutlined sx={iconSx} />} label="Location">
                      {locationLine}
                    </ProfileMetaGridCell>
                  ) : null}
                  {originLine ? (
                    <ProfileMetaGridCell icon={<PublicOutlined sx={iconSx} />} label="Origin">
                      {originLine}
                    </ProfileMetaGridCell>
                  ) : null}
                  {deviceLabel ? (
                    <ProfileMetaGridCell
                      icon={
                        isMobile ? (
                          <SmartphoneOutlined sx={iconSx} />
                        ) : (
                          <ComputerOutlined sx={iconSx} />
                        )
                      }
                      label="Device"
                      fullWidth={!locationLine && !originLine}
                    >
                      {deviceLabel}
                    </ProfileMetaGridCell>
                  ) : null}
                </ProfileMetaGridSection>
              </AccordionDetails>
            </Accordion>

            <Accordion
              expanded={expanded === "session"}
              onChange={toggle("session")}
              disableGutters
              sx={accordionSx(theme)}
            >
              <AccordionSummary expandIcon={<ExpandMore sx={{ color: theme.app.dashboard.iconMuted }} />}>
                <AccordionSectionTitle icon={<ScheduleOutlined />} label="Chat session" />
              </AccordionSummary>
              <AccordionDetails sx={{ p: 0 }}>
                <ProfileMetaGridSection>
                  {live ? (
                    <ProfileMetaGridCell
                      icon={<AccessTimeOutlined sx={{ ...iconSx, color: theme.palette.success.light }} />}
                      label="Status"
                      fullWidth
                    >
                      <Box component="span" sx={{ color: theme.palette.success.light, fontWeight: 600 }}>
                        Live session
                      </Box>
                    </ProfileMetaGridCell>
                  ) : null}
                  {parsed.sessionFields.map((f) => (
                    <ProfileMetaGridCell
                      key={f.label}
                      icon={sessionFieldIcon(f.label)}
                      label={f.label}
                      muted={f.value === "—"}
                    >
                      {f.value}
                    </ProfileMetaGridCell>
                  ))}
                </ProfileMetaGridSection>
              </AccordionDetails>
            </Accordion>

            <Accordion
              expanded={expanded === "contact"}
              onChange={toggle("contact")}
              disableGutters
              sx={accordionSx(theme)}
            >
              <AccordionSummary expandIcon={<ExpandMore sx={{ color: theme.app.dashboard.iconMuted }} />}>
                <AccordionSectionTitle icon={<EmailOutlined />} label="Contact info" />
              </AccordionSummary>
              <AccordionDetails sx={{ p: 0 }}>
                <ProfileMetaGridSection>
                  {parsed.contactFields.map((f) => (
                    <ProfileMetaGridCell
                      key={f.label}
                      icon={contactFieldIcon(f.label)}
                      label={f.label}
                      muted={f.value === "—"}
                    >
                      {f.value}
                    </ProfileMetaGridCell>
                  ))}
                </ProfileMetaGridSection>
              </AccordionDetails>
            </Accordion>

            {parsed.location ? (
              <Accordion
                expanded={expanded === "location"}
                onChange={toggle("location")}
                disableGutters
                sx={accordionSx(theme)}
              >
                <AccordionSummary expandIcon={<ExpandMore sx={{ color: theme.app.dashboard.iconMuted }} />}>
                  <AccordionSectionTitle icon={<LocationOnOutlined />} label="Location map" />
                </AccordionSummary>
                <AccordionDetails sx={{ px: 2, pb: 2, pt: 0 }}>
                  <VisitorLocationMap location={parsed.location} />
                </AccordionDetails>
              </Accordion>
            ) : null}

            {parsed.currentPageUrl ? (
              <Accordion
                expanded={expanded === "page"}
                onChange={toggle("page")}
                disableGutters
                sx={accordionSx(theme)}
              >
                <AccordionSummary expandIcon={<ExpandMore sx={{ color: theme.app.dashboard.iconMuted }} />}>
                  <AccordionSectionTitle icon={<LanguageOutlined />} label="Current page" />
                </AccordionSummary>
                <AccordionDetails sx={{ p: 0 }}>
                  <ProfileMetaGridSection>
                    <ProfileMetaGridCell
                      icon={<LinkOutlined sx={iconSx} />}
                      label="Page URL"
                      href={parsed.currentPageUrl}
                      fullWidth
                    >
                      {parsed.currentPageUrl}
                    </ProfileMetaGridCell>
                  </ProfileMetaGridSection>
                </AccordionDetails>
              </Accordion>
            ) : null}

            {journey.length > 0 ? (
              <Accordion
                expanded={expanded === "journey"}
                onChange={toggle("journey")}
                disableGutters
                sx={accordionSx(theme)}
              >
                <AccordionSummary expandIcon={<ExpandMore sx={{ color: theme.app.dashboard.iconMuted }} />}>
                  <AccordionSectionTitle icon={<RouteOutlined />} label="Visitor journey" />
                </AccordionSummary>
                <AccordionDetails sx={{ p: 0 }}>
                  <ProfileMetaGridSection>
                    {journey.map((step, i) => (
                      <ProfileMetaGridCell
                        key={`${step.url}-${i}`}
                        icon={<RouteOutlined sx={iconSx} />}
                        label={step.at ? `Visit · ${step.at}` : `Step ${i + 1}`}
                        href={step.url}
                        fullWidth={journey.length === 1}
                      >
                        {step.url}
                      </ProfileMetaGridCell>
                    ))}
                  </ProfileMetaGridSection>
                </AccordionDetails>
              </Accordion>
            ) : null}

            {supervisorEnabled && !hideSupervisorTools ? (
              <Box sx={{ px: 2, pb: 1, pt: 0.5 }}>
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
