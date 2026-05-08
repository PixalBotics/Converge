"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Add from "@mui/icons-material/Add";
import ChatRounded from "@mui/icons-material/ChatRounded";
import TextsmsRounded from "@mui/icons-material/TextsmsRounded";
import SendRounded from "@mui/icons-material/SendRounded";
import CloseRounded from "@mui/icons-material/CloseRounded";
import MoreVert from "@mui/icons-material/MoreVert";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import { alpha } from "@mui/material/styles";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import {
  Button,
  DashboardCard,
  DataTable,
  FilterButton,
  SearchBar,
  TablePagination,
  Typography,
} from "@/components/common";
import type { DataTableColumn } from "@/components/common";
import { gradientPrimaryButtonSx } from "@/components/common/Button/Button.styles";
import {
  integrationsCardTitleRow,
  integrationsCardToolbar,
  integrationsFooterRow,
  integrationsHeaderActions,
  integrationsMainCardSx,
  integrationsPageHeader,
  integrationsPageWrapper,
  integrationsPaginationWrapper,
  integrationsSearchFieldWrapper,
  integrationsSearchRow,
  integrationsSectionIconBox,
} from "../integrations/integrations.styles";
import { LauncherPresetIcon } from "@/lib/chat-widget/launcherIcons";
import { readWidgetDraft, type WidgetDraft } from "@/lib/chat-widget/widgetDraft";

interface WidgetRow extends Record<string, unknown> {
  id: string;
  clientOf: string;
  parentCompany: string;
  childCompany: string;
  website: string;
  widgetType: string;
  department: string;
  status: "Active" | "Inactive";
  scriptStatus: "Installed" | "Pending";
}

const TOTAL_ENTRIES = 256_000;
const PAGE_COUNT = 2;

function formatEntries(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(0)}M`;
  if (n >= 1_000) return `${Math.round(n / 1_000)}K`;
  return String(n);
}

const TABLE_ROWS: WidgetRow[] = Array.from({ length: 18 }, (_, i) => ({
  id: String(i + 1),
  clientOf: "Raja Saif",
  parentCompany: "Global Industries",
  childCompany: "Acme Tech",
  website: "actech.com",
  widgetType: "Chat",
  department: "Sales",
  status: "Active",
  scriptStatus: "Installed",
}));

const WIDGET_LAUNCHER_SIZE_PX = 58;
const WIDGET_PANEL_ABOVE_LAUNCHER_PX = 70;
const WIDGET_WELCOME_ABOVE_LAUNCHER_PX = 76;
const TEXT_WIDGET_ENABLED_KEY = "text_widget_enabled_v1";

export default function ChatWidgetPage() {
  const router = useRouter();
  const theme = useTheme() as AppTheme;
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [widgetDraft, setWidgetDraft] = useState<WidgetDraft | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [welcomePopupOpen, setWelcomePopupOpen] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState<Array<{ id: string; role: "assistant" | "user"; text: string }>>([]);
  const [textWidgetEnabled, setTextWidgetEnabled] = useState(false);
  const [textPreviewOpen, setTextPreviewOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const previewPanelRef = useRef<HTMLDivElement | null>(null);
  const previewToggleRef = useRef<HTMLDivElement | null>(null);
  const textPreviewPanelRef = useRef<HTMLDivElement | null>(null);
  const textPreviewToggleRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const draft = readWidgetDraft();
    setWidgetDraft(draft);
    setMessages([
      { id: "welcome", role: "assistant", text: draft.greetingMessage },
      { id: "seed-user", role: "user", text: "I can help with buying and investment options." },
    ]);
    if (typeof window !== "undefined") {
      setTextWidgetEnabled(window.localStorage.getItem(TEXT_WIDGET_ENABLED_KEY) === "1");
    }
  }, []);

  useEffect(() => {
    if (!previewOpen) return;
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, previewOpen]);

  useEffect(() => {
    if (!widgetDraft?.completed) return;
    if (previewOpen) {
      setWelcomePopupOpen(false);
      return;
    }
    setWelcomePopupOpen(true);
  }, [widgetDraft?.completed, previewOpen]);

  useEffect(() => {
    if (!previewOpen && !textPreviewOpen) return;

    const handleOutsideClick = (event: MouseEvent | TouchEvent) => {
      const targetNode = event.target as Node | null;
      if (!targetNode) return;

      const clickedInsidePreview = previewPanelRef.current?.contains(targetNode) ?? false;
      const clickedOnToggle = previewToggleRef.current?.contains(targetNode) ?? false;
      const clickedInsideTextPreview = textPreviewPanelRef.current?.contains(targetNode) ?? false;
      const clickedOnTextToggle = textPreviewToggleRef.current?.contains(targetNode) ?? false;

      if (!clickedInsidePreview && !clickedOnToggle && !clickedInsideTextPreview && !clickedOnTextToggle) {
        setPreviewOpen(false);
        setTextPreviewOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("touchstart", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("touchstart", handleOutsideClick);
    };
  }, [previewOpen, textPreviewOpen]);

  const handleSendMessage = () => {
    const value = chatInput.trim();
    if (!value) return;
    const nextUserMessage = { id: `u-${Date.now()}`, role: "user" as const, text: value };
    const nextAssistantMessage = {
      id: `a-${Date.now() + 1}`,
      role: "assistant" as const,
      text: "Thanks! Please also share your preferred location and budget range.",
    };
    setMessages((prev) => [...prev, nextUserMessage, nextAssistantMessage]);
    setChatInput("");
  };

  const getButtonRadius = (shape: WidgetDraft["buttonShape"]) => {
    if (shape === "circle") return "50%";
    if (shape === "rounded") return "16px";
    return "8px";
  };

  const renderAgentAvatar = (size = 30) =>
    widgetDraft?.iconDataUrl ? (
      <Box
        component="img"
        src={widgetDraft.iconDataUrl}
        alt="Widget icon"
        sx={{ width: size, height: size, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }}
      />
    ) : (
      <Box
        sx={{
          width: size,
          height: size,
          borderRadius: "50%",
          bgcolor: "#E5E7EB",
          border: "1px solid #CBD5E1",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <ChatRounded sx={{ color: "#64748B", fontSize: Math.max(14, size - 12) }} />
      </Box>
    );

  const renderWidgetLauncherGraphic = (sizePx: number) => {
    if (!widgetDraft) return null;
    if (widgetDraft.iconDataUrl) {
      return <Box component="img" src={widgetDraft.iconDataUrl} alt="Widget icon" sx={{ width: sizePx, height: sizePx, objectFit: "contain" }} />;
    }
    if (widgetDraft.launcherIconPreset) {
      return <LauncherPresetIcon presetId={widgetDraft.launcherIconPreset} color={widgetDraft.iconColor} fontSizePx={sizePx} />;
    }
    return <ChatRounded sx={{ color: "inherit", fontSize: sizePx }} />;
  };

  const isVideoBanner =
    widgetDraft?.bannerMediaType === "video" ||
    (widgetDraft?.bannerDataUrl?.startsWith("data:video/") ?? false);

  const launcherLayout = useMemo(() => {
    if (!widgetDraft?.completed) return null;
    const bottom = widgetDraft.launcherInsetBottomPx;
    const side = widgetDraft.launcherInsetSidePx;
    const pos = widgetDraft.buttonPosition;

    const stackBottomPx = bottom + WIDGET_PANEL_ABOVE_LAUNCHER_PX;
    const welcomeBottomPx = bottom + WIDGET_WELCOME_ABOVE_LAUNCHER_PX;

    const horizontalFab =
      pos === "left"
        ? { left: side, right: "auto", transform: "none" }
        : pos === "right"
          ? { right: side, left: "auto", transform: "none" }
          : {
              left: "50%",
              right: "auto",
              transform: `translateX(calc(-50% + ${side}px))`,
            };

    const welcomeHorizontal =
      pos === "left"
        ? { left: Math.max(12, side - 8), right: "auto", transform: "none" }
        : pos === "right"
          ? { right: Math.max(12, side - 8), left: "auto", transform: "none" }
          : {
              left: "50%",
              right: "auto",
              transform: `translateX(calc(-50% + ${side}px))`,
            };

    return { bottom, horizontalFab, stackBottomPx, welcomeBottomPx, welcomeHorizontal, pos, side };
  }, [
    widgetDraft?.completed,
    widgetDraft?.launcherInsetBottomPx,
    widgetDraft?.launcherInsetSidePx,
    widgetDraft?.buttonPosition,
  ]);

  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return TABLE_ROWS;
    return TABLE_ROWS.filter((row) =>
      [
        row.clientOf,
        row.parentCompany,
        row.childCompany,
        row.website,
        row.widgetType,
        row.department,
        row.status,
        row.scriptStatus,
      ].some((field) => String(field).toLowerCase().includes(q))
    );
  }, [search]);

  const columns = useMemo<DataTableColumn<WidgetRow>[]>(
    () => [
      { id: "clientOf", label: "Client Of" },
      { id: "parentCompany", label: "Parent Company", cellVariant: "muted" },
      { id: "childCompany", label: "Child Company", cellVariant: "muted" },
      { id: "website", label: "Website", cellVariant: "muted" },
      { id: "widgetType", label: "Widget Type", cellVariant: "muted" },
      { id: "department", label: "Department", cellVariant: "muted" },
      {
        id: "status",
        label: "Status",
        render: (_v, row) => (
          <Box
            component="span"
            sx={{
              display: "inline-flex",
              alignItems: "center",
              gap: 0.5,
              px: 1.1,
              py: 0.45,
              borderRadius: "9999px",
              bgcolor: alpha(theme.palette.success.main, theme.palette.mode === "light" ? 0.16 : 0.12),
              border: `1px solid ${alpha(theme.palette.success.main, theme.palette.mode === "light" ? 0.3 : 0.28)}`,
              lineHeight: 1,
            }}
          >
            <Box
              component="span"
              sx={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                bgcolor: theme.app.dashboard.accentGreen,
                flexShrink: 0,
              }}
            />
            <Typography
              component="span"
              variant="body2"
              sx={{
                color: theme.palette.mode === "light" ? "#166534" : theme.palette.success.light,
                fontWeight: 600,
                fontSize: "0.75rem",
              }}
            >
              {row.status}
            </Typography>
          </Box>
        ),
      },
      {
        id: "scriptStatus",
        label: "Script Status",
        render: (_v, row) => (
          <Typography component="span" variant="body2" sx={{ color: theme.app.dashboard.accentGreen, fontWeight: 600 }}>
            {row.scriptStatus}
          </Typography>
        ),
      },
    ],
    [theme]
  );

  return (
    <Box sx={integrationsPageWrapper}>
      <Box sx={integrationsPageHeader}>
        <Box>
          <Typography variant="regularLarge" fontWeight={700} color="white" sx={{ mb: 0.5 }}>
            Widget Management
          </Typography>
          <Typography variant="medium" sx={{ color: theme.app.dashboard.textMuted, maxWidth: 640 }}>
            Connect your Meta Business assets to streamline your workflow and data sync.
          </Typography>
        </Box>
        <Box sx={integrationsHeaderActions}>
          <Button
            type="button"
            variant="primary"
            sx={gradientPrimaryButtonSx}
            startIcon={<Add sx={{ fontSize: 20 }} />}
            onClick={() => router.push("/dashboard/chat-widget/add")}
          >
            Add Widget
          </Button>
        </Box>
      </Box>

      <DashboardCard sx={integrationsMainCardSx}>
        <Box sx={integrationsCardToolbar}>
          <Box sx={integrationsCardTitleRow}>
            <Box sx={integrationsSectionIconBox} aria-hidden>
              <Typography
                sx={{
                  color: theme.app.dashboard.white95,
                  fontWeight: 700,
                  fontSize: "1.1rem",
                  lineHeight: 1,
                }}
              >
                $
              </Typography>
            </Box>
            <Typography variant="mediumLarge" color="white" fontWeight={600} sx={{ textAlign: "left" }}>
              All Widgets
            </Typography>
          </Box>
          <Box sx={integrationsSearchRow}>
            <Box sx={integrationsSearchFieldWrapper}>
              <SearchBar value={search} onChange={setSearch} placeholder="Search anything..." sx={{ minWidth: "100%" }} />
            </Box>
            <FilterButton sx={{ whiteSpace: "nowrap", alignSelf: { xs: "stretch", sm: "center" } }} />
          </Box>
        </Box>

        <DataTable<WidgetRow>
          columns={columns}
          rows={filteredRows}
          getRowId={(row) => row.id}
          minWidth={1380}
          size="medium"
          actionColumn={{
            label: "Actions",
            render: () => (
              <IconButton
                type="button"
                size="small"
                aria-label="Widget row actions"
                sx={{ color: theme.app.dashboard.iconMuted, "&:hover": { color: theme.app.text.primary } }}
              >
                <MoreVert fontSize="small" />
              </IconButton>
            ),
          }}
        />

        <Box sx={integrationsFooterRow}>
          <Typography variant="medium" sx={{ color: theme.app.dashboard.textMuted }}>
            Showing data 1 to {filteredRows.length} of {formatEntries(TOTAL_ENTRIES)} entries
          </Typography>
          <Box sx={integrationsPaginationWrapper}>
            <TablePagination page={page} pageCount={PAGE_COUNT} onPageChange={setPage} />
          </Box>
        </Box>
      </DashboardCard>

      {widgetDraft?.completed ? (
        <>
          {welcomePopupOpen && !previewOpen && launcherLayout ? (
            <Box
              sx={{
                ...launcherLayout.welcomeHorizontal,
                position: "fixed",
                bottom: launcherLayout.welcomeBottomPx,
                width: { xs: "calc(100vw - 24px)", sm: 280 },
                maxWidth: 280,
                bgcolor: "#FFFFFF",
                color: "#1E1E1E",
                borderRadius: "12px",
                px: 2,
                py: 2.25,
                zIndex: 1201,
                boxShadow: "0 8px 24px rgba(15, 23, 42, 0.2)",
                border: "1px solid #E5E7EB",
                cursor: "pointer",
              }}
              onClick={() => {
                setPreviewOpen(true);
                setWelcomePopupOpen(false);
              }}
            >
              <IconButton
                type="button"
                size="small"
                aria-label="Close welcome popup"
                onClick={(event) => {
                  event.stopPropagation();
                  setWelcomePopupOpen(false);
                }}
                sx={{
                  position: "absolute",
                  top: 6,
                  right: 6,
                  color: "#111827",
                }}
              >
                <CloseRounded sx={{ fontSize: 18 }} />
              </IconButton>

              <Typography
                variant="medium"
                sx={{
                  color: "#1F2937",
                  pr: 2.5,
                  lineHeight: 1.6,
                  fontWeight: 500,
                }}
              >
                Have a question? We are here to help. Just answer a few quick questions and we will route you to an expert.
              </Typography>
            </Box>
          ) : null}

          {previewOpen && launcherLayout ? (
            <Box
              ref={previewPanelRef}
              sx={{
                ...launcherLayout.horizontalFab,
                position: "fixed",
                bottom: launcherLayout.stackBottomPx,
                width: `${Math.max(280, Math.min(520, widgetDraft.boxWidth))}px`,
                height: `${Math.max(320, Math.min(640, widgetDraft.boxHeight))}px`,
                zIndex: 1200,
                borderRadius: 2.5,
                overflow: "hidden",
                border: `1px solid ${theme.app.dashboard.cardBorder}`,
                bgcolor: "#EEF1F7",
                boxShadow: "0 16px 38px rgba(3, 12, 37, 0.45)",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <Box sx={{ px: 2, py: 1.5, bgcolor: widgetDraft.buttonColor, color: widgetDraft.textColor }}>
                <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 1 }}>
                  <Box sx={{ flex: 1, minWidth: 0, display: "flex", alignItems: "center", gap: 1 }}>
                    {renderAgentAvatar(32)}
                    <Box sx={{ minWidth: 0 }}>
                      <Typography variant="mediumLarge" sx={{ color: "inherit", textAlign: widgetDraft.headerTitleAlign === "Left" ? "left" : "center" }}>
                        {widgetDraft.headerTitle}
                      </Typography>
                      <Typography variant="body2" sx={{ color: "inherit", opacity: 0.9, textAlign: widgetDraft.headerTitleAlign === "Left" ? "left" : "center" }}>
                        Online now
                      </Typography>
                    </Box>
                  </Box>
                  <IconButton
                    type="button"
                    size="small"
                    aria-label="Close chat preview"
                    onClick={() => setPreviewOpen(false)}
                    sx={{
                      color: "inherit",
                      mt: -0.4,
                      mr: -0.6,
                      opacity: 0.92,
                      "&:hover": { opacity: 1, bgcolor: "rgba(0,0,0,0.12)" },
                    }}
                  >
                    <CloseRounded sx={{ fontSize: 22 }} />
                  </IconButton>
                </Box>
              </Box>
              <Box sx={{ p: 1.5, display: "flex", flexDirection: "column", gap: 1, flex: 1, minHeight: 0 }}>
                <Box
                  sx={{
                    flex: 1,
                    minHeight: 0,
                    overflowY: "auto",
                    pr: 0.5,
                    display: "flex",
                    flexDirection: "column",
                    gap: 1,
                    scrollbarWidth: "none",
                    msOverflowStyle: "none",
                    "&::-webkit-scrollbar": {
                      display: "none",
                    },
                  }}
                >
                  {widgetDraft.bannerOn && widgetDraft.bannerDataUrl ? (
                    isVideoBanner ? (
                      <Box
                        component="video"
                        src={widgetDraft.bannerDataUrl}
                        muted
                        autoPlay
                        loop
                        playsInline
                        controls
                        sx={{ width: "100%", height: 120, objectFit: "cover", borderRadius: 2, bgcolor: "#000000" }}
                      />
                    ) : (
                      <Box
                        component="img"
                        src={widgetDraft.bannerDataUrl}
                        alt="Widget banner"
                        sx={{ width: "100%", height: 120, objectFit: "cover", borderRadius: 2 }}
                      />
                    )
                  ) : null}

                  {messages.map((message) =>
                    message.role === "assistant" ? (
                      <Box key={message.id} sx={{ alignSelf: "flex-start", display: "flex", alignItems: "flex-start", gap: 1, maxWidth: "86%" }}>
                        {renderAgentAvatar(28)}
                        <Box
                          sx={{
                            bgcolor: "#DDE3EC",
                            borderRadius: 2,
                            p: 1.1,
                          }}
                        >
                          <Typography variant="body2" sx={{ color: "#1B2A3D" }}>
                            {message.text}
                          </Typography>
                        </Box>
                      </Box>
                    ) : (
                      <Box
                        key={message.id}
                        sx={{
                          alignSelf: "flex-end",
                          bgcolor: "#0E60D5",
                          borderRadius: 2,
                          p: 1.1,
                          maxWidth: "82%",
                        }}
                      >
                        <Typography variant="body2" sx={{ color: "#FFFFFF" }}>
                          {message.text}
                        </Typography>
                      </Box>
                    )
                  )}
                  <Box ref={messagesEndRef} />
                </Box>

                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    bgcolor: "#FFFFFF",
                    border: "1px solid #C8D3E5",
                    borderRadius: "14px",
                    px: 1.25,
                    py: 0.75,
                    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.7), 0 2px 8px rgba(15, 23, 42, 0.06)",
                    transition: "border-color 0.2s ease, box-shadow 0.2s ease",
                    "&:focus-within": {
                      borderColor: widgetDraft.buttonColor,
                      boxShadow: `0 0 0 3px ${widgetDraft.buttonColor}22, 0 6px 14px rgba(15, 23, 42, 0.12)`,
                    },
                  }}
                >
                  <Box sx={{ color: widgetDraft.iconColor, display: "flex", alignItems: "center" }}>{renderWidgetLauncherGraphic(20)}</Box>
                  <Box
                    component="input"
                    value={chatInput}
                    onChange={(event) => setChatInput(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    placeholder={widgetDraft.sendPlaceholder}
                    sx={{
                      flex: 1,
                      border: "none",
                      outline: "none",
                      bgcolor: "transparent",
                      color: "#334155",
                      fontSize: "0.95rem",
                      lineHeight: 1.35,
                      "::placeholder": {
                        color: "#8A97AB",
                        opacity: 1,
                      },
                    }}
                  />
                  <IconButton
                    type="button"
                    aria-label="Send message"
                    onClick={handleSendMessage}
                    size="small"
                    sx={{
                      bgcolor: widgetDraft.buttonColor,
                      color: "#FFFFFF",
                      width: 42,
                      height: 42,
                      flexShrink: 0,
                      transition: "transform 0.2s ease, filter 0.2s ease",
                      "&:hover": {
                        bgcolor: widgetDraft.buttonHoverColor || widgetDraft.buttonColor,
                        transform: "translateY(-1px)",
                        filter: "brightness(1.06)",
                      },
                    }}
                  >
                    <SendRounded sx={{ fontSize: 22 }} />
                  </IconButton>
                </Box>
              </Box>
            </Box>
          ) : null}

          {launcherLayout ? (
          <Box
            ref={previewToggleRef}
            role="button"
            aria-label={previewOpen ? "Close widget preview" : "Open widget preview"}
            onClick={() => setPreviewOpen((prev) => !prev)}
            sx={{
              ...launcherLayout.horizontalFab,
              position: "fixed",
              bottom: launcherLayout.bottom,
              zIndex: 1201,
              width: WIDGET_LAUNCHER_SIZE_PX,
              height: WIDGET_LAUNCHER_SIZE_PX,
              borderRadius: getButtonRadius(widgetDraft.buttonShape),
              bgcolor: widgetDraft.buttonColor,
              color: widgetDraft.iconColor,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              boxShadow: "0 10px 28px rgba(2, 12, 43, 0.45)",
              transition: "transform 0.2s ease, box-shadow 0.2s ease, filter 0.2s ease",
              "&:hover": {
                bgcolor: widgetDraft.buttonHoverColor || widgetDraft.buttonColor,
                ...(launcherLayout.pos === "center"
                  ? {
                      transform:
                        launcherLayout.side !== 0
                          ? `translate(calc(-50% + ${launcherLayout.side}px), -2px) scale(1.05)`
                          : "translate(-50%, -2px) scale(1.05)",
                    }
                  : { transform: "translateY(-2px) scale(1.05)" }),
                boxShadow: "0 20px 42px rgba(2, 12, 43, 0.62), 0 0 0 4px rgba(255, 255, 255, 0.14)",
                filter: "brightness(1.05)",
              },
            }}
          >
            {previewOpen ? (
              <CloseRounded sx={{ color: "inherit", fontSize: 30 }} />
            ) : (
              renderWidgetLauncherGraphic(28)
            )}
          </Box>
          ) : null}

          {textWidgetEnabled ? (
            <>
              {textPreviewOpen ? (
                <Box
                  ref={textPreviewPanelRef}
                  sx={{
                    position: "fixed",
                    right: 12,
                    bottom: 112,
                    width: "320px",
                    height: "360px",
                    zIndex: 1200,
                    borderRadius: 2.5,
                    overflow: "hidden",
                    border: `1px solid ${theme.app.dashboard.cardBorder}`,
                    bgcolor: "#EEF1F7",
                    boxShadow: "0 16px 38px rgba(3, 12, 37, 0.45)",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <Box sx={{ px: 2, py: 1.5, bgcolor: "#da9b2f", color: "#FFFFFF", display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 1 }}>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography variant="mediumLarge" sx={{ color: "inherit" }}>
                        Special Offer
                      </Typography>
                      <Typography variant="body2" sx={{ color: "inherit", opacity: 0.92 }}>
                        Get 20% off all premium plans today.
                      </Typography>
                    </Box>
                    <IconButton
                      type="button"
                      size="small"
                      aria-label="Close text widget preview"
                      onClick={() => setTextPreviewOpen(false)}
                      sx={{
                        color: "inherit",
                        mt: -0.4,
                        mr: -0.6,
                        opacity: 0.92,
                        "&:hover": { opacity: 1, bgcolor: "rgba(0,0,0,0.12)" },
                      }}
                    >
                      <CloseRounded sx={{ fontSize: 22 }} />
                    </IconButton>
                  </Box>
                  <Box sx={{ p: 1.5, display: "flex", flexDirection: "column", gap: 1, flex: 1, minHeight: 0, overflow: "hidden" }}>
                    <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1 }}>
                      <Box sx={{ bgcolor: "#FFFFFF", border: "1px solid #CCD6E6", borderRadius: 1.25, px: 1.2, py: 0.9 }}>
                        <Typography variant="body2" sx={{ color: "#5B6B82" }}>Name</Typography>
                      </Box>
                      <Box sx={{ bgcolor: "#FFFFFF", border: "1px solid #CCD6E6", borderRadius: 1.25, px: 1.2, py: 0.9 }}>
                        <Typography variant="body2" sx={{ color: "#5B6B82" }}>Email</Typography>
                      </Box>
                    </Box>
                    <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1 }}>
                      <Box sx={{ bgcolor: "#FFFFFF", border: "1px solid #CCD6E6", borderRadius: 1.25, px: 1.2, py: 0.9 }}>
                        <Typography variant="body2" sx={{ color: "#5B6B82" }}>Message</Typography>
                      </Box>
                      <Box sx={{ bgcolor: "#FFFFFF", border: "1px solid #CCD6E6", borderRadius: 1.25, px: 1.2, py: 0.9 }}>
                        <Typography variant="body2" sx={{ color: "#5B6B82" }}>Phone Number</Typography>
                      </Box>
                    </Box>
                    <Box sx={{ mt: "auto", display: "flex", alignItems: "center", gap: 1, bgcolor: "#FFFFFF", border: "1px solid #CCD6E6", borderRadius: "22px", px: 1.2, py: 0.75 }}>
                      <TextsmsRounded sx={{ color: "#da9b2f", fontSize: 20 }} />
                      <Typography variant="body2" sx={{ color: "#5B6B82", flex: 1 }}>
                        Enter message...
                      </Typography>
                      <IconButton
                        type="button"
                        aria-label="Send text message"
                        size="small"
                        tabIndex={-1}
                        disableRipple
                        sx={{
                          bgcolor: "#da9b2f",
                          color: "#FFFFFF",
                          width: 42,
                          height: 42,
                          flexShrink: 0,
                          "&:hover": { bgcolor: "#da9b2f", filter: "brightness(1.06)" },
                        }}
                      >
                        <SendRounded sx={{ fontSize: 22 }} />
                      </IconButton>
                    </Box>
                  </Box>
                </Box>
              ) : null}

              <Box
                ref={textPreviewToggleRef}
                role="button"
                aria-label={textPreviewOpen ? "Close text widget preview" : "Open text widget preview"}
                onClick={() => setTextPreviewOpen((prev) => !prev)}
                sx={{
                  position: "fixed",
                  right: 0,
                  top: "50%",
                  transform: "translateY(-50%)",
                  zIndex: 1201,
                  minWidth: 88,
                  height: 46,
                  px: 1.6,
                  borderRadius: "10px 0 0 10px",
                  bgcolor: "#da9b2f",
                  color: "#FFFFFF",
                  display: textPreviewOpen || previewOpen ? "none" : "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  boxShadow: "0 10px 28px rgba(2, 12, 43, 0.45)",
                  transition: "transform 0.2s ease, box-shadow 0.2s ease, filter 0.2s ease",
                  "&:hover": {
                    transform: "translate(-2px, -50%)",
                    boxShadow: "0 20px 42px rgba(2, 12, 43, 0.62), 0 0 0 4px rgba(255, 255, 255, 0.14)",
                    filter: "brightness(1.05)",
                  },
                }}
              >
                <Typography variant="medium" sx={{ color: "inherit", fontWeight: 700, letterSpacing: 0.2 }}>
                  Text Us
                </Typography>
              </Box>
            </>
          ) : null}
        </>
      ) : null}
    </Box>
  );
}
