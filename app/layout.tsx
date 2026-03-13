import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import { ThemeRegistry } from "@/components/theme-registry";
import { AuthProvider } from "@/lib/auth";

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
        className={manrope.className}
        style={{ background: "radial-gradient(50% 50% at 50% 50%, #09013F 0%, #00011A 100%)", minHeight: "100vh" }}
      >
        <ThemeRegistry>
          <AuthProvider>{children}</AuthProvider>
        </ThemeRegistry>
      </body>
    </html>
  );
}
