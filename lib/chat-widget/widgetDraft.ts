"use client";

export type WidgetKind = "chat" | "text";

/** Phosphor-style chat icons (`react-icons/pi` duotone), see https://phosphoricons.com/?q=chat */
export type LauncherIconPresetId =
  | ""
  | "phosphor-chat-circle"
  | "phosphor-chats-circle"
  | "phosphor-chat-dots"
  | "phosphor-chat-teardrop";

export interface WidgetDraft {
  type: WidgetKind;
  widgetId: string;
  completed: boolean;
  buttonShape: "circle" | "rounded" | "square";
  buttonPosition: "left" | "center" | "right";
  /** Launcher FAB distance from viewport bottom (px); larger moves the button upward. */
  launcherInsetBottomPx: number;
  /** Distance from left/right screen edge matching `buttonPosition`; from bottom center when `center` (horizontal shift, px). */
  launcherInsetSidePx: number;
  buttonColor: string;
  buttonHoverColor: string;
  iconColor: string;
  iconDataUrl: string;
  /** When set and `iconDataUrl` is empty, FAB uses preset Phosphor-style icon */
  launcherIconPreset: LauncherIconPresetId;
  headerTitleAlign: "Center" | "Left";
  headerTitle: string;
  textColor: string;
  greetingMessage: string;
  sendPlaceholder: string;
  bannerOn: boolean;
  bannerTitle: string;
  bannerDescription: string;
  bannerDataUrl: string;
  bannerMediaType: "image" | "video";
  boxWidth: number;
  boxHeight: number;
}

const STORAGE_KEY = "chat_widget_draft_v1";

export const defaultWidgetDraft: WidgetDraft = {
  type: "chat",
  widgetId: "12345",
  completed: false,
  buttonShape: "circle",
  buttonPosition: "right",
  launcherInsetBottomPx: 28,
  launcherInsetSidePx: 28,
  buttonColor: "#1E63D5",
  buttonHoverColor: "#164EB0",
  iconColor: "#FFFFFF",
  iconDataUrl: "",
  launcherIconPreset: "phosphor-chat-circle",
  headerTitleAlign: "Center",
  headerTitle: "AI Sales Assistant",
  textColor: "#FFFFFF",
  greetingMessage: "Welcome to Florida Luxurious. Tell me your budget, location, and property type preference.",
  sendPlaceholder: "Ask about location, budget, or options...",
  bannerOn: true,
  bannerTitle: "Special Offer",
  bannerDescription: "Get 20% off all premium plans today.",
  bannerDataUrl: "",
  bannerMediaType: "image",
  boxWidth: 350,
  boxHeight: 430,
};

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

const LAUNCHER_PRESET_IDS = new Set<string>([
  "",
  "phosphor-chat-circle",
  "phosphor-chats-circle",
  "phosphor-chat-dots",
  "phosphor-chat-teardrop",
]);

function normalizeLauncherIconPreset(value: unknown): LauncherIconPresetId {
  if (value === "") return "";
  if (typeof value === "string" && LAUNCHER_PRESET_IDS.has(value)) {
    return value as LauncherIconPresetId;
  }
  return defaultWidgetDraft.launcherIconPreset;
}

function clampLauncherInsetPx(value: unknown, fallback: number): number {
  const n = typeof value === "number" ? value : typeof value === "string" ? Number.parseInt(value, 10) : Number.NaN;
  if (!Number.isFinite(n)) return fallback;
  return Math.min(240, Math.max(0, Math.round(n)));
}

export function readWidgetDraft(): WidgetDraft {
  if (!canUseStorage()) return defaultWidgetDraft;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultWidgetDraft;
    const parsed = JSON.parse(raw) as Partial<WidgetDraft>;
    return {
      ...defaultWidgetDraft,
      ...parsed,
      launcherIconPreset: normalizeLauncherIconPreset(parsed.launcherIconPreset),
      launcherInsetBottomPx: clampLauncherInsetPx(
        parsed.launcherInsetBottomPx,
        defaultWidgetDraft.launcherInsetBottomPx
      ),
      launcherInsetSidePx: clampLauncherInsetPx(
        parsed.launcherInsetSidePx,
        defaultWidgetDraft.launcherInsetSidePx
      ),
    };
  } catch {
    return defaultWidgetDraft;
  }
}

export function saveWidgetDraft(update: Partial<WidgetDraft>) {
  if (!canUseStorage()) return;
  const current = readWidgetDraft();
  const next: WidgetDraft = { ...current, ...update };
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    return;
  } catch {
    // Fallback for large base64 uploads (especially videos) that exceed localStorage quota.
    const withoutBannerMedia: WidgetDraft = {
      ...next,
      bannerDataUrl: "",
      bannerMediaType: "image",
    };
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(withoutBannerMedia));
      return;
    } catch {
      const withoutAnyMedia: WidgetDraft = {
        ...withoutBannerMedia,
        iconDataUrl: "",
      };
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(withoutAnyMedia));
      } catch {
        // Ignore persistence failure to avoid runtime crash.
      }
    }
  }
}

export function buildWidgetScript(draft: WidgetDraft) {
  const scriptName = draft.type === "chat" ? "chat-widget.js" : "text-widget.js";
  return `<script src="https://widget.company.com/${scriptName}" data-id="${draft.widgetId}" defer></script>`;
}
