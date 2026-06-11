"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Box from "@mui/material/Box";

const HEIGHT_REPORTER = `<script>(function(){function r(){try{var b=document.body,d=document.documentElement,h=Math.max(b.scrollHeight,b.offsetHeight,d.scrollHeight,d.offsetHeight);window.parent.postMessage({type:"email-preview-height",height:h}, "*");}catch(e){}}window.addEventListener("load",r);if(typeof ResizeObserver!=="undefined"){new ResizeObserver(r).observe(document.body);}r();[50,150,400,800].forEach(function(ms){setTimeout(r,ms);});})();</script>`;

function withHeightReporter(html: string): string {
  if (/<\/body>/i.test(html)) {
    return html.replace(/<\/body>/i, `${HEIGHT_REPORTER}</body>`);
  }
  return `${html}${HEIGHT_REPORTER}`;
}

export function EmailPreviewFrame({
  html,
  title,
  fitToContent = false,
}: {
  html: string;
  title?: string;
  /** Expand iframe to full email height — no inner scrollbar. */
  fitToContent?: boolean;
}) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [contentHeight, setContentHeight] = useState(600);

  const srcDoc = useMemo(
    () => (fitToContent ? withHeightReporter(html) : html),
    [html, fitToContent],
  );

  useEffect(() => {
    if (!fitToContent) return;

    const iframe = iframeRef.current;
    if (!iframe) return;

    const applyHeight = (raw: number) => {
      const next = Math.max(Math.ceil(raw), 120);
      setContentHeight((prev) => (Math.abs(prev - next) > 2 ? next : prev));
    };

    const measureDom = () => {
      try {
        const doc = iframe.contentDocument;
        if (!doc?.body) return;
        const body = doc.body;
        const root = doc.documentElement;
        applyHeight(
          Math.max(
            body.scrollHeight,
            body.offsetHeight,
            root.scrollHeight,
            root.offsetHeight,
          ),
        );
      } catch {
        /* allow-same-origin required */
      }
    };

    const onMessage = (event: MessageEvent) => {
      if (event.source !== iframe.contentWindow) return;
      const data = event.data as { type?: string; height?: number };
      if (data?.type === "email-preview-height" && typeof data.height === "number") {
        applyHeight(data.height);
      }
    };

    window.addEventListener("message", onMessage);
    iframe.addEventListener("load", measureDom);

    const timers = [0, 80, 200, 500, 1000, 1800].map((ms) =>
      window.setTimeout(measureDom, ms),
    );

    return () => {
      window.removeEventListener("message", onMessage);
      iframe.removeEventListener("load", measureDom);
      timers.forEach(window.clearTimeout);
    };
  }, [srcDoc, fitToContent]);

  useEffect(() => {
    if (fitToContent) setContentHeight(600);
  }, [html, fitToContent]);

  return (
    <Box
      sx={{
        bgcolor: "#fff",
        lineHeight: 0,
        overflow: fitToContent ? "visible" : "hidden",
        ...(fitToContent
          ? {}
          : {
              borderRadius: 2,
              border: "1px solid rgba(255,255,255,0.12)",
              minHeight: 360,
            }),
      }}
    >
      <iframe
        ref={iframeRef}
        title={title ?? "Email preview"}
        srcDoc={srcDoc}
        sandbox="allow-same-origin"
        scrolling={fitToContent ? "no" : "auto"}
        style={{
          width: "100%",
          height: fitToContent ? contentHeight : undefined,
          minHeight: fitToContent ? undefined : 360,
          border: 0,
          display: "block",
          overflow: "hidden",
        }}
      />
    </Box>
  );
}
