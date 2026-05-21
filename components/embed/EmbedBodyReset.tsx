"use client";

import { useEffect } from "react";

/** Transparent embed document — no app dashboard gradient behind the widget. */
export function EmbedBodyReset({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    const nextRoot = document.getElementById("__next");

    const prev = {
      htmlBg: html.style.background,
      bodyBg: body.style.background,
      bodyMinH: body.style.minHeight,
      bodyMargin: body.style.margin,
      bodyPad: body.style.padding,
      bodyOverflow: body.style.overflow,
      nextBg: nextRoot?.style.background ?? "",
      nextMinH: nextRoot?.style.minHeight ?? "",
    };

    html.style.background = "transparent";
    body.style.background = "transparent";
    body.style.minHeight = "0";
    body.style.margin = "0";
    body.style.padding = "0";
    body.style.overflow = "hidden";

    if (nextRoot) {
      nextRoot.style.background = "transparent";
      nextRoot.style.minHeight = "0";
    }

    const devStyle = document.createElement("style");
    devStyle.setAttribute("data-embed-chrome", "1");
    devStyle.textContent = `
      [data-nextjs-dev-tools-button],
      [data-nextjs-dev-tools-menu],
      [data-next-badge],
      [data-next-mark],
      #vercel-live-feedback-button,
      nextjs-portal,
      #__next-build-watcher {
        display: none !important;
        pointer-events: none !important;
      }
    `;
    document.head.appendChild(devStyle);

    return () => {
      devStyle.remove();
      html.style.background = prev.htmlBg;
      body.style.background = prev.bodyBg;
      body.style.minHeight = prev.bodyMinH;
      body.style.margin = prev.bodyMargin;
      body.style.padding = prev.bodyPad;
      body.style.overflow = prev.bodyOverflow;
      if (nextRoot) {
        nextRoot.style.background = prev.nextBg;
        nextRoot.style.minHeight = prev.nextMinH;
      }
    };
  }, []);

  return <>{children}</>;
}
