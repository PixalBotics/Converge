import type { Metadata } from "next";
import { Inter, Manrope } from "next/font/google";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";
import { ThemeRegistry } from "@/components/theme-registry";
import { QueryProvider } from "@/lib/hooks";
import { AuthProvider } from "@/lib/auth";
import { mainBackgroundGradient } from "@/theme/theme";

const inter = Inter({ subsets: ["latin"], display: "swap" });
const manrope = Manrope({ subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  title: "Interchanges",
  description: "Built with Next.js App Router and TypeScript",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        style={{
          fontFamily: `${inter.style.fontFamily}, ${manrope.style.fontFamily}, sans-serif`,
          background: mainBackgroundGradient,
          minHeight: "100vh",
        }}
      >
        <AppRouterCacheProvider options={{ key: "mui" }}>
          <ThemeRegistry>
            <QueryProvider>
              <AuthProvider>{children}</AuthProvider>
            </QueryProvider>
          </ThemeRegistry>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
