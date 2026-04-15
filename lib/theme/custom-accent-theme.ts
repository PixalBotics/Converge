const HEX_RE = /^#?([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

export function normalizeHex(hex: string): string {
  let h = hex.trim();
  if (!h.startsWith("#")) h = `#${h}`;
  const m = h.match(HEX_RE);
  if (!m) return "#ec4899";
  let body = m[1];
  if (body.length === 3) {
    body = body
      .split("")
      .map((c) => c + c)
      .join("");
  }
  return `#${body.toLowerCase()}`;
}

function parseHex(hex: string): { r: number; g: number; b: number } {
  const h = normalizeHex(hex).slice(1);
  const n = parseInt(h, 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function mixChannel(c: number, target: number, t: number) {
  return clamp(c + (target - c) * t, 0, 255);
}

function rgb(r: number, g: number, b: number) {
  return `rgb(${Math.round(r)},${Math.round(g)},${Math.round(b)})`;
}

function rgba(r: number, g: number, b: number, a: number) {
  return `rgba(${Math.round(r)},${Math.round(g)},${Math.round(b)},${a})`;
}

export const DEFAULT_CUSTOM_ACCENT_HEX = "#ec4899";

export function getCustomAccentTheme(hex: string) {
  const { r, g, b } = parseHex(hex);
  const sidebar = rgb(mixChannel(r, 0, 0.62), mixChannel(g, 0, 0.62), mixChannel(b, 0, 0.62));
  const header = rgb(mixChannel(r, 0, 0.42), mixChannel(g, 0, 0.42), mixChannel(b, 0, 0.42));
  const top = rgb(mixChannel(r, 40, 0.38), mixChannel(g, 40, 0.38), mixChannel(b, 50, 0.38));
  const bot = rgb(mixChannel(r, 0, 0.88), mixChannel(g, 0, 0.88), mixChannel(b, 0, 0.88));
  const previewTab = rgb(mixChannel(r, 0, 0.28), mixChannel(g, 0, 0.28), mixChannel(b, 0, 0.28));
  const previewBar = rgb(mixChannel(r, 100, 0.22), mixChannel(g, 100, 0.22), mixChannel(b, 120, 0.22));
  const accent = normalizeHex(hex);
  const card = rgba(mixChannel(r, 25, 0.5), mixChannel(g, 25, 0.5), mixChannel(b, 45, 0.5), 0.45);
  const appBackground = `linear-gradient(135deg, ${top} 0%, ${bot} 100%)`;
  const border = `linear-gradient(90deg, ${accent} 0%, ${previewTab} 100%)`;

  return {
    appBackground,
    paletteMode: "dark" as const,
    previewBar,
    previewTab,
    patch: {
      dashboard: {
        headerBorderGradient: border,
        sidebarBg: sidebar,
        headerBg: header,
        contentBg: `linear-gradient(180deg, ${top} 0%, ${bot} 100%)`,
        cardBg: card,
        cardBorder: "rgba(255, 255, 255, 0.1)",
        navItemSelectedBg: rgba(r, g, b, 0.35),
        navActiveBg: rgba(r, g, b, 0.28),
        accentBlue: accent,
        accentPurple: previewTab,
        menuSurfaceBg: header,
        pillBg: sidebar,
        pillActive: header,
        liveChat: {
          cardBg: header,
          messageBg: sidebar,
          avatarBg: accent,
          messageText: "rgba(248, 250, 252, 0.9)",
          cardGlass: "rgba(244, 244, 244, 0.02)",
        },
      },
    },
  };
}
