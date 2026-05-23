import type { ReactNode } from "react";
import { mainBackgroundGradient } from "@/theme/theme";
import { AppRootProviders } from "./AppRootProviders";
import { rootFontFamilyCss } from "./root-fonts";

/** Server component: `<html>` / `<body>` + global shell styles; providers live in `AppRootProviders`. */
export function RootLayoutShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        style={{
          fontFamily: rootFontFamilyCss(),
          background: mainBackgroundGradient,
          minHeight: "100vh",
        }}
      >
        <AppRootProviders>{children}</AppRootProviders>
      </body>
    </html>
  );
}
