/**
 * System stack at build time — avoids `next/font/google` network calls during `next dev` compile
 * (fixes "Request timed out after 3000ms" when Google Fonts is slow/blocked).
 * Inter/Manrope load at runtime via `<link>` in `RootLayoutShell` unless disabled.
 */
export const ROOT_FONT_FAMILY_CSS =
  'Inter, Manrope, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';

export function rootFontFamilyCss(): string {
  return ROOT_FONT_FAMILY_CSS;
}

export function shouldLoadGoogleFontsStylesheet(): boolean {
  if (process.env.NEXT_FONT_SYSTEM_ONLY === "1") return false;
  if (process.env.NEXT_FONT_DISABLE_GOOGLE === "1") return false;
  return true;
}

export const GOOGLE_FONTS_STYLESHEET_HREF =
  "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Manrope:wght@500;600;700&display=swap";
