import type { ReactNode } from "react";
import { mainBackgroundGradient } from "@/theme/theme";
import { AppRootProviders } from "./AppRootProviders";
import {
  GOOGLE_FONTS_STYLESHEET_HREF,
  rootFontFamilyCss,
  shouldLoadGoogleFontsStylesheet,
} from "./root-fonts";

/** Server component: `<html>` / `<body>` + global shell styles; providers live in `AppRootProviders`. */
export function RootLayoutShell({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      style={{ maxWidth: "100vw", overflowX: "hidden" }}
    >
      {/* App Router root layout: font preconnect/stylesheet belong in <head>. */}
      {/* eslint-disable-next-line @next/next/no-head-element */}
      <head>
        {shouldLoadGoogleFontsStylesheet() ? (
          <>
            <link rel="preconnect" href="https://fonts.googleapis.com" />
            <link
              rel="preconnect"
              href="https://fonts.gstatic.com"
              crossOrigin="anonymous"
            />
            <link rel="stylesheet" href={GOOGLE_FONTS_STYLESHEET_HREF} />
          </>
        ) : null}
      </head>
      <body
        suppressHydrationWarning
        style={{
          fontFamily: rootFontFamilyCss(),
          background: mainBackgroundGradient,
          minHeight: "100vh",
          margin: 0,
          maxWidth: "100vw",
          overflowX: "hidden",
        }}
      >
        <AppRootProviders>{children}</AppRootProviders>
      </body>
    </html>
  );
}
