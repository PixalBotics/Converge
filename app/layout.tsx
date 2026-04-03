import type { Metadata } from "next";
import { Inter, Manrope } from "next/font/google";
import { ThemeRegistry } from "@/components/theme-registry";
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
    <html lang="en">
      <body
        style={{
          fontFamily: `${inter.style.fontFamily}, ${manrope.style.fontFamily}, sans-serif`,
          background: mainBackgroundGradient,
          minHeight: "100vh",
        }}
        suppressHydrationWarning
      >
        <ThemeRegistry>
          <AuthProvider>{children}</AuthProvider>
        </ThemeRegistry>
      </body>
    </html>
  );
}
