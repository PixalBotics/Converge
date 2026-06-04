"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Add from "@mui/icons-material/Add";
import ChatRounded from "@mui/icons-material/ChatRounded";
import TextsmsRounded from "@mui/icons-material/TextsmsRounded";
import SendRounded from "@mui/icons-material/SendRounded";
import CloseRounded from "@mui/icons-material/CloseRounded";
import VisibilityOutlined from "@mui/icons-material/VisibilityOutlined";
import EditOutlined from "@mui/icons-material/EditOutlined";
import DeleteOutline from "@mui/icons-material/DeleteOutline";
import Box from "@mui/material/Box";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import IconButton from "@mui/material/IconButton";
import { alpha } from "@mui/material/styles";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import {
  Button,
  DashboardCard,
  DataTable,
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
import type { AdminWidgetTableRow } from "@/api/types/widgets.types";
import {
  deleteWidget,
  listAdminWidgets,
  widgetResponseData,
} from "@/api/widgets/widgets.api";
import { LauncherPresetIcon } from "@/lib/chat-widget/launcherIcons";
import {
  mapAdminWidgetToTableRow,
  parseWidgetListData,
} from "@/lib/chat-widget/admin-widget-list-mapper";
import { extractApiErrorMessageForToast } from "@/lib/notify/extract-api-message";
import { publishAppToast } from "@/lib/notify";
import { readWidgetDraft, type WidgetDraft } from "@/lib/chat-widget/widgetDraft";

function formatEntries(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(0)}M`;
  if (n >= 1_000) return `${Math.round(n / 1_000)}K`;
  return String(n);
}

const WIDGET_LIST_PAGE_LIMIT = 20;

const WIDGET_LAUNCHER_SIZE_PX = 58;
const WIDGET_PANEL_ABOVE_LAUNCHER_PX = 70;
const WIDGET_WELCOME_ABOVE_LAUNCHER_PX = 76;
const TEXT_WIDGET_ENABLED_KEY = "text_widget_enabled_v1";

export default function ChatWidgetPage() {
  const router = useRouter();
  const theme = useTheme() as AppTheme;
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [widgetsLoading, setWidgetsLoading] = useState(true);
  const [widgetsError, setWidgetsError] = useState<string | null>(null);
  const [tableRows, setTableRows] = useState<AdminWidgetTableRow[]>([]);
  const [listMeta, setListMeta] = useState({
    total: 0,
    totalPages: 1,
    limit: 20,
  });
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
  const [listRefreshKey, setListRefreshKey] = useState(0);
  const [deleteDialogKey, setDeleteDialogKey] = useState<string | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);

  useEffect(() => {
    const t = window.setTimeout(() => setDebouncedSearch(search.trim()), 400);
    return () => window.clearTimeout(t);
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  useEffect(() => {
    let cancelled = false;
    async function loadWidgets() {
      try {
        setWidgetsLoading(true);
        setWidgetsError(null);
        const envelope = await listAdminWidgets({
          page,
          limit: WIDGET_LIST_PAGE_LIMIT,
          search: debouncedSearch || undefined,
        });
        if (cancelled) return;

        const raw = widgetResponseData(envelope);
        const parsed = parseWidgetListData(raw);
        const rows = parsed.items.map(mapAdminWidgetToTableRow);
        setTableRows(rows);
        setListMeta({
          total: parsed.total,
          totalPages: parsed.totalPages,
          limit: parsed.limit,
        });
      } catch (e) {
        if (!cancelled) {
          setWidgetsError(extractApiErrorMessageForToast(e) ?? "Failed to load widgets");
          setTableRows([]);
        }
      } finally {
        if (!cancelled) setWidgetsLoading(false);
      }
    }
    void loadWidgets();
    return () => {
      cancelled = true;
    };
  }, [page, debouncedSearch, listRefreshKey]);

  const confirmDeleteWidget = async () => {
    const key = deleteDialogKey?.trim();
    if (!key) return;
    setDeleteBusy(true);
    try {
      await deleteWidget(key);
      publishAppToast({ variant: "success", message: "Widget removed." });
      setDeleteDialogKey(null);
      setListRefreshKey((n) => n + 1);
    } catch (e) {
      publishAppToast({
        variant: "error",
        message: extractApiErrorMessageForToast(e) ?? "Delete failed.",
      });
    } finally {
      setDeleteBusy(false);
    }
  };

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
    return "10px";
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

  const rowsForTable = tableRows;

  const rangeStart =
    listMeta.total === 0 ? 0 : (page - 1) * listMeta.limit + 1;
  const rangeEnd = Math.min(page * listMeta.limit, listMeta.total);

  const columns = useMemo<DataTableColumn<AdminWidgetTableRow>[]>(
    () => [
      { id: "resellerName", label: "Client / reseller" },
      { id: "parentCompany", label: "Parent Company", cellVariant: "muted" },
      { id: "childCompany", label: "Child Company", cellVariant: "muted" },
      { id: "websiteLabel", label: "Website", cellVariant: "muted" },
      { id: "widgetTypeLabel", label: "Widget Type", cellVariant: "muted" },
      {
        id: "surfaces",
        label: "Surfaces",
        cellVariant: "muted",
        render: (_v, row) => (
          <Typography variant="body2" sx={{ color: theme.app.dashboard.textMuted }}>
            {row.chatEnabled ? "Chat" : ""}
            {row.chatEnabled && row.textUsEnabled ? " · " : ""}
            {row.textUsEnabled ? "Text Us" : ""}
            {!row.chatEnabled && !row.textUsEnabled ? "—" : ""}
          </Typography>
        ),
      },
      {
        id: "statusLabel",
        label: "Status",
        render: (_v, row) => {
          const isPub = row.statusLabel.toLowerCase().includes("publish");
          const isDraftPending = row.hasUnpublishedDraft === true;
          const chipColor = isDraftPending
            ? theme.palette.warning.main
            : isPub
              ? theme.palette.success.main
              : theme.palette.warning.main;
          return (
            <Box
              component="span"
              sx={{
                display: "inline-flex",
                alignItems: "center",
                gap: 0.5,
                px: 1.1,
                py: 0.45,
                borderRadius: "9999px",
                bgcolor: alpha(chipColor, theme.palette.mode === "light" ? 0.16 : 0.12),
                border: `1px solid ${alpha(chipColor, theme.palette.mode === "light" ? 0.3 : 0.28)}`,
                lineHeight: 1,
              }}
            >
              <Typography
                component="span"
                variant="body2"
                sx={{
                  fontWeight: 600,
                  fontSize: "0.75rem",
                  color: isDraftPending
                    ? theme.palette.warning.light
                    : isPub
                      ? theme.palette.success.light
                      : theme.palette.warning.light,
                }}
              >
                {row.statusLabel}
              </Typography>
            </Box>
          );
        },
      },
    ],
    [theme],
  );

  return (
    <Box sx={integrationsPageWrapper}>
      <Box sx={integrationsPageHeader}>
        <Box>
          <Typography variant="regularLarge" fontWeight={700} color="white" sx={{ mb: 0.5 }}>
            Widget Management
          </Typography>
          <Typography variant="medium" sx={{ color: theme.app.dashboard.textMuted, maxWidth: 640 }}>
            List widgets from GET /widgets, add installs with POST /widgets/installations, paste the returned embed snippet.
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
          </Box>
        </Box>

        {widgetsError ? (
          <Box sx={{ px: 2, pb: 1 }}>
            <Typography variant="body2" sx={{ color: theme.palette.error.main }}>
              {widgetsError}
            </Typography>
          </Box>
        ) : null}
        {widgetsLoading ? (
          <Box sx={{ px: 2, py: 2 }}>
            <Typography variant="body2" sx={{ color: theme.app.dashboard.textMuted }}>
              Loading widgets…
            </Typography>
          </Box>
        ) : null}

        <DataTable<AdminWidgetTableRow>
          columns={columns}
          rows={rowsForTable}
          getRowId={(row) => row.widgetKey || row.id}
          minWidth={1200}
          size="medium"
          actionColumn={{
            label: "Actions",
            render: (row) => {
              const key = (row.widgetKey || row.id).trim();
              if (!key)
                return (
                  <Typography variant="body2" sx={{ color: theme.app.dashboard.textMuted }}>
                    —
                  </Typography>
                );
              const pathBase = `/dashboard/chat-widget/${encodeURIComponent(key)}`;
              return (
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75 }} onClick={(e) => e.stopPropagation()}>
                  <Button
                    type="button"
                    variant="outlined"
                    size="small"
                    startIcon={<VisibilityOutlined sx={{ fontSize: 16 }} />}
                    aria-label={`View widget ${key}`}
                    onClick={() => router.push(pathBase)}
                  >
                    View
                  </Button>
                  <Button
                    type="button"
                    variant="primary"
                    sx={gradientPrimaryButtonSx}
                    size="small"
                    startIcon={<EditOutlined sx={{ fontSize: 16 }} />}
                    aria-label={`Edit widget ${key}`}
                    onClick={() => router.push(`${pathBase}/edit`)}
                  >
                    Edit
                  </Button>
                  <Button
                    type="button"
                    variant="outlined"
                    size="small"
                    startIcon={<DeleteOutline sx={{ fontSize: 16 }} />}
                    aria-label={`Delete widget ${key}`}
                    onClick={() => setDeleteDialogKey(key)}
                    sx={{
                      borderColor: theme.palette.error.main,
                      color: theme.palette.error.light,
                    }}
                  >
                    Delete
                  </Button>
                </Box>
              );
            },
          }}
        />

        <Box sx={integrationsFooterRow}>
          <Typography variant="medium" sx={{ color: theme.app.dashboard.textMuted }}>
            Showing data {rangeStart} to {rangeEnd} of {formatEntries(listMeta.total)} entries
          </Typography>
          <Box sx={integrationsPaginationWrapper}>
            <TablePagination
              page={page}
              pageCount={Math.max(1, listMeta.totalPages)}
              onPageChange={setPage}
            />
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

      <Dialog
        open={Boolean(deleteDialogKey)}
        onClose={() => !deleteBusy && setDeleteDialogKey(null)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Delete this widget?</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: theme.app.dashboard.textMuted }}>
            Soft-deletes this widget on the server. The website assignment is not removed.
          </Typography>
          {deleteDialogKey ? (
            <Typography
              variant="body2"
              sx={{ mt: 1.5, fontFamily: "monospace", wordBreak: "break-all" }}
            >
              {deleteDialogKey}
            </Typography>
          ) : null}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            type="button"
            variant="secondary"
            disabled={deleteBusy}
            onClick={() => setDeleteDialogKey(null)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="primary"
            disabled={deleteBusy}
            onClick={() => void confirmDeleteWidget()}
            sx={{
              bgcolor: theme.palette.error.main,
              "&:hover": { bgcolor: theme.palette.error.dark },
            }}
          >
            {deleteBusy ? "Deleting…" : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
