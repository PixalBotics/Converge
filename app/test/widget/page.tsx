"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import ContentCopyRounded from "@mui/icons-material/ContentCopyRounded";
import LanguageRounded from "@mui/icons-material/LanguageRounded";
import ScienceRounded from "@mui/icons-material/ScienceRounded";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import { alpha } from "@mui/material/styles";
import { buildWidgetEmbedIframeUrl } from "@/lib/chat-widget/widget-sandbox-url";
import { resolveWidgetEmbedAppOrigin } from "@/lib/chat-widget/widget-embed-api-origin";
import { publishAppToast } from "@/lib/notify";
import {
  applyEmbedHostFrameLayout,
  TEXT_US_EMBED_LAUNCHER_HEIGHT_PX,
  WIDGET_EMBED_RESIZE_MESSAGE,
  type EmbedHostSurface,
  type WidgetEmbedResizePayload,
} from "@/lib/widget-runtime/embed-host-messaging";
import { postWidgetSession } from "@/lib/widget-runtime/widget-public-fetch";

function DemoWebsiteContent() {
  return (
    <Box
      component="main"
      sx={{
        flex: 1,
        bgcolor: "#ffffff",
        color: "#0f172a",
        fontFamily: '"Inter", "Segoe UI", system-ui, sans-serif',
      }}
    >
      <Box
        component="header"
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: { xs: 2.5, md: 5 },
          py: 2,
          borderBottom: "1px solid #e2e8f0",
          bgcolor: "#fff",
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1}>
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: 2,
              background: "linear-gradient(135deg, #3b82f6, #6366f1)",
            }}
          />
          <Box component="span" sx={{ fontWeight: 800, fontSize: "1.05rem", letterSpacing: "-0.02em" }}>
            Acme Digital
          </Box>
        </Stack>
        <Stack direction="row" spacing={3} sx={{ display: { xs: "none", sm: "flex" } }}>
          {["Home", "Products", "Pricing", "Contact"].map((item) => (
            <Box
              key={item}
              component="span"
              sx={{ fontSize: 14, fontWeight: 500, color: "#64748b", cursor: "default" }}
            >
              {item}
            </Box>
          ))}
        </Stack>
      </Box>

      <Box
        sx={{
          px: { xs: 2.5, md: 5 },
          py: { xs: 5, md: 8 },
          background: "linear-gradient(180deg, #f8fafc 0%, #ffffff 55%)",
        }}
      >
        <Box sx={{ maxWidth: 720 }}>
          <Box
            component="h1"
            sx={{
              m: 0,
              fontSize: { xs: "2rem", md: "2.75rem" },
              fontWeight: 800,
              letterSpacing: "-0.03em",
              lineHeight: 1.15,
              color: "#0f172a",
            }}
          >
            Build better customer experiences
          </Box>
          <Box
            component="p"
            sx={{
              mt: 2,
              mb: 3,
              fontSize: { xs: 16, md: 18 },
              lineHeight: 1.6,
              color: "#475569",
              maxWidth: 560,
            }}
          >
            This is a sample website — your chat widget appears exactly as visitors will see it on
            your live site. Try the launcher in the corner.
          </Box>
          <Stack direction="row" spacing={1.5}>
            <Box
              sx={{
                px: 2.5,
                py: 1.1,
                borderRadius: 2,
                bgcolor: "#2563eb",
                color: "#fff",
                fontWeight: 600,
                fontSize: 14,
              }}
            >
              Get started
            </Box>
            <Box
              sx={{
                px: 2.5,
                py: 1.1,
                borderRadius: 2,
                border: "1px solid #cbd5e1",
                color: "#334155",
                fontWeight: 600,
                fontSize: 14,
              }}
            >
              Learn more
            </Box>
          </Stack>
        </Box>
      </Box>

      <Box
        sx={{
          px: { xs: 2.5, md: 5 },
          py: { xs: 4, md: 6 },
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
          gap: 2.5,
        }}
      >
        {[
          { title: "Fast support", body: "Connect visitors to AI or your team in seconds." },
          { title: "Smart routing", body: "Route chats by topic, page, or business hours." },
          { title: "On-brand", body: "Colors, icons, and greetings match your website." },
        ].map((card) => (
          <Box
            key={card.title}
            sx={{
              p: 2.5,
              borderRadius: 3,
              border: "1px solid #e2e8f0",
              bgcolor: "#f8fafc",
            }}
          >
            <Box sx={{ fontWeight: 700, fontSize: 16, mb: 0.75 }}>{card.title}</Box>
            <Box sx={{ fontSize: 14, color: "#64748b", lineHeight: 1.55 }}>{card.body}</Box>
          </Box>
        ))}
      </Box>

      <Box
        sx={{
          mt: 4,
          px: { xs: 2.5, md: 5 },
          py: 4,
          borderTop: "1px solid #e2e8f0",
          color: "#94a3b8",
          fontSize: 13,
        }}
      >
        © Acme Digital — demo page for widget preview
      </Box>
    </Box>
  );
}

function WidgetEmbedHostFrame({
  src,
  surface = "chat",
}: {
  src: string;
  surface?: EmbedHostSurface;
}) {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  useEffect(() => {
    const frame = iframeRef.current;
    if (!frame) return;

    const initial =
      surface === "textUs"
        ? { width: 168, height: TEXT_US_EMBED_LAUNCHER_HEIGHT_PX + 32 }
        : { width: 220, height: 240 };

    applyEmbedHostFrameLayout(frame, {
      type: WIDGET_EMBED_RESIZE_MESSAGE,
      open: false,
      width: initial.width,
      height: initial.height,
      position: "right",
      insetBottomPx: 16,
      insetSidePx: 16,
      surface,
    });

    const onMessage = (event: MessageEvent) => {
      const data = event.data as Partial<WidgetEmbedResizePayload> | null;
      if (!data || data.type !== WIDGET_EMBED_RESIZE_MESSAGE) return;
      const msgSurface = data.surface === "textUs" ? "textUs" : "chat";
      if (msgSurface !== surface) return;
      try {
        const embedOrigin = new URL(src, window.location.href).origin;
        if (event.origin !== embedOrigin) return;
      } catch {
        return;
      }
      applyEmbedHostFrameLayout(frame, data);
    };

    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [src, surface]);

  return (
    <Box
      ref={iframeRef}
      component="iframe"
      title={surface === "textUs" ? "Text Us widget" : "Chat widget"}
      src={src}
      allow="clipboard-write"
      aria-label={surface === "textUs" ? "Text Us widget" : "Chat widget"}
      sx={{ border: "none", display: "block" }}
    />
  );
}

function PublicWidgetTestPageInner() {
  const sp = useSearchParams();
  const widgetKey = sp.get("widgetKey") || sp.get("widget-key") || "";
  const previewShareToken = sp.get("token") || sp.get("previewToken") || "";
  const [iframeSrcBySurface, setIframeSrcBySurface] = useState<
    Partial<Record<EmbedHostSurface, string>>
  >({});

  useEffect(() => {
    if (!widgetKey.trim()) {
      setIframeSrcBySurface({});
      return;
    }

    let cancelled = false;

    async function load() {
      const embedOrigin = resolveWidgetEmbedAppOrigin({
        browserOrigin: window.location.origin,
      });
      const shareToken = previewShareToken.trim() || undefined;

      const sess = await postWidgetSession({
        widgetKey,
        originHost: window.location.origin,
        ...(shareToken ? { previewShareToken: shareToken } : {}),
      });

      const widgetType = sess.ok
        ? String(sess.data.widgetType ?? "CHAT").toUpperCase()
        : "CHAT";
      const surfaces = sess.ok ? sess.data.surfaces : undefined;

      let hostSurfaces: EmbedHostSurface[] = ["chat"];
      if (
        widgetType === "BOTH" &&
        surfaces?.chatEnabled !== false &&
        surfaces?.textUsEnabled !== false
      ) {
        hostSurfaces = ["chat", "textUs"];
      } else if (widgetType === "TEXT_US") {
        hostSurfaces = ["textUs"];
      }

      const next: Partial<Record<EmbedHostSurface, string>> = {};
      for (const surface of hostSurfaces) {
        const url = buildWidgetEmbedIframeUrl({
          widgetKey,
          mode: shareToken ? "draft" : undefined,
          previewShareToken: shareToken,
          parentPage: window.location.href,
          appOrigin: embedOrigin,
          surface,
        });
        if (url) next[surface] = url;
      }

      if (!cancelled) setIframeSrcBySurface(next);
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [widgetKey, previewShareToken]);

  const copyPageLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      publishAppToast({ variant: "success", message: "Link copied" });
    } catch {
      publishAppToast({ variant: "error", message: "Could not copy link" });
    }
  };

  if (!widgetKey.trim()) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "#f8fafc",
          color: "#64748b",
          fontFamily: "system-ui, sans-serif",
          p: 3,
        }}
      >
        Missing widgetKey in URL.
      </Box>
    );
  }

  const isDraft = Boolean(previewShareToken);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        bgcolor: "#f8fafc",
      }}
    >
      <Box
        component="header"
        sx={{
          position: "sticky",
          top: 0,
          zIndex: 1400,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 1.5,
          flexWrap: "wrap",
          px: { xs: 2, md: 3 },
          py: 1.25,
          bgcolor: alpha("#0f172a", 0.94),
          backdropFilter: "blur(12px)",
          borderBottom: `1px solid ${alpha("#fff", 0.08)}`,
          color: "#f1f5f9",
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1.25} sx={{ minWidth: 0 }}>
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: 1.5,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
              flexShrink: 0,
            }}
          >
            <ScienceRounded sx={{ fontSize: 18, color: "#fff" }} />
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Box sx={{ fontWeight: 800, fontSize: 14, letterSpacing: "-0.02em", lineHeight: 1.2 }}>
              Converge Widget Preview
            </Box>
            <Box
              sx={{
                fontSize: 11,
                color: alpha("#e2e8f0", 0.65),
                display: "flex",
                alignItems: "center",
                gap: 0.5,
              }}
            >
              <LanguageRounded sx={{ fontSize: 12 }} />
              Full-page demo — same placement as your live site
            </Box>
          </Box>
        </Stack>

        <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap">
          <Chip
            size="small"
            label={isDraft ? "Draft" : "Live"}
            sx={{
              height: 26,
              fontWeight: 700,
              bgcolor: alpha(isDraft ? "#f59e0b" : "#22c55e", 0.18),
              color: isDraft ? "#fcd34d" : "#86efac",
              border: `1px solid ${alpha(isDraft ? "#f59e0b" : "#22c55e", 0.35)}`,
            }}
          />
          <Box
            component="code"
            sx={{
              fontSize: 11,
              px: 1,
              py: 0.35,
              borderRadius: 1,
              bgcolor: alpha("#fff", 0.06),
              color: alpha("#e2e8f0", 0.8),
              maxWidth: { xs: 140, sm: 220 },
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              display: { xs: "none", sm: "block" },
            }}
          >
            {widgetKey}
          </Box>
          <Button
            size="small"
            variant="outlined"
            startIcon={<ContentCopyRounded sx={{ fontSize: 16 }} />}
            onClick={() => void copyPageLink()}
            sx={{
              borderColor: alpha("#818cf8", 0.45),
              color: "#c7d2fe",
              textTransform: "none",
              fontWeight: 600,
              fontSize: 13,
              py: 0.5,
              "&:hover": { borderColor: "#a5b4fc", bgcolor: alpha("#6366f1", 0.12) },
            }}
          >
            Copy link
          </Button>
        </Stack>
      </Box>

      <DemoWebsiteContent />

      {(["chat", "textUs"] as const).map((surface) => {
        const src = iframeSrcBySurface[surface];
        if (!src) return null;
        return <WidgetEmbedHostFrame key={surface} src={src} surface={surface} />;
      })}
    </Box>
  );
}

export default function PublicWidgetTestPage() {
  return (
    <Suspense
      fallback={
        <Box
          sx={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: "#f8fafc",
            color: "#64748b",
          }}
        >
          Loading preview…
        </Box>
      }
    >
      <PublicWidgetTestPageInner />
    </Suspense>
  );
}
