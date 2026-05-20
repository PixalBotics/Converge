import type { LauncherIconPresetId } from "@/lib/chat-widget/widgetDraft";
import type { WidgetConfigEnvelope } from "./widget-types";

export interface RuntimeLauncherAppearance {
  position: "left" | "center" | "right";
  shape: string;
  insetBottomPx: number;
  insetSidePx: number;
  iconPreset: LauncherIconPresetId;
  buttonColor: string;
  buttonHoverColor: string;
  iconColor: string;
}

export interface RuntimeChatBoxAppearance {
  headerTitle: string;
  headerAlign: "left" | "center";
  headerBg: string;
  headerTextColor: string;
  greetingMessage: string;
  sendPlaceholder: string;
  backgroundColor: string;
  boxWidth: number;
  boxHeight: number;
  fontFamily: string;
}

export interface RuntimeChatAppearance {
  launcher: RuntimeLauncherAppearance;
  chatBox: RuntimeChatBoxAppearance;
  welcomeMessage: string;
}

const LAUNCHER_PRESETS = new Set<string>([
  "",
  "phosphor-chat-circle",
  "phosphor-chats-circle",
  "phosphor-chat-dots",
  "phosphor-chat-teardrop",
]);

function isObj(v: unknown): v is Record<string, unknown> {
  return v !== null && typeof v === "object" && !Array.isArray(v);
}

function str(v: unknown, fallback = ""): string {
  return typeof v === "string" && v.trim() ? v.trim() : fallback;
}

function num(v: unknown, fallback: number): number {
  const n = typeof v === "number" ? v : typeof v === "string" ? Number.parseFloat(v) : NaN;
  return Number.isFinite(n) ? n : fallback;
}

function normalizePosition(raw: string): RuntimeLauncherAppearance["position"] {
  const s = raw.toLowerCase();
  if (s === "left") return "left";
  if (s === "center") return "center";
  return "right";
}

function normalizeHeaderAlign(raw: string): RuntimeChatBoxAppearance["headerAlign"] {
  return raw.toLowerCase() === "left" ? "left" : "center";
}

function normalizeIconPreset(raw: string): LauncherIconPresetId {
  if (LAUNCHER_PRESETS.has(raw)) return raw as LauncherIconPresetId;
  return "phosphor-chat-circle";
}

/** Merge config from public config / snapshot-like shapes into one record for appearance + prechat. */
export function resolveRuntimeConfigRecord(envelope: WidgetConfigEnvelope): Record<string, unknown> {
  const root: Record<string, unknown> = {
    widgetKey: envelope.widgetKey,
    websiteId: envelope.websiteId,
    widgetType: envelope.widgetType,
    chatMode: envelope.chatMode,
    allowedDomains: envelope.allowedDomains,
  };

  const cfg =
    envelope.config !== undefined && isObj(envelope.config)
      ? ({ ...envelope.config } as Record<string, unknown>)
      : {};

  const settingsJson = cfg.settingsJson;
  if (isObj(settingsJson)) {
    Object.assign(cfg, settingsJson);
  }

  return { ...root, ...cfg };
}

/**
 * Read `theme.designJson.chat` (+ ui/theme fallbacks) for live embed styling.
 */
export function extractRuntimeChatAppearance(
  configRecord: Record<string, unknown>,
): RuntimeChatAppearance {
  const theme = isObj(configRecord.theme) ? configRecord.theme : null;
  const ui = isObj(configRecord.ui) ? configRecord.ui : null;
  const behavior = isObj(configRecord.behavior) ? configRecord.behavior : null;

  const dj = theme && isObj(theme.designJson) ? theme.designJson : null;
  const chat = dj && isObj(dj.chat) ? dj.chat : null;
  const launcher = chat && isObj(chat.launcher) ? chat.launcher : null;
  const chatBox = chat && isObj(chat.chatBox) ? chat.chatBox : null;
  const colors = chat && isObj(chat.colors) ? chat.colors : null;

  const primary = str(theme?.primaryColor, "#1E63D5");
  const buttonColor = str(colors?.button, primary);
  const buttonHover = str(colors?.buttonHover ?? colors?.button_hover, str(theme?.buttonHoverColor, buttonColor));
  const iconColor = str(colors?.icon, "#FFFFFF");
  const headerText = str(colors?.headerText ?? colors?.header_text, str(theme?.textColor, "#FFFFFF"));

  const welcomeMessage =
    str(configRecord.welcomeMessage) ||
    str(chatBox?.greetingMessage) ||
    str(ui?.greetingMessage) ||
    str(behavior?.welcomeMessage) ||
    "How can we help?";

  return {
    welcomeMessage,
    launcher: {
      position: normalizePosition(str(launcher?.position ?? ui?.buttonPosition, "right")),
      shape: str(launcher?.shape, "circle"),
      insetBottomPx: num(launcher?.insetBottomPx ?? ui?.launcherInsetBottomPx, 28),
      insetSidePx: num(launcher?.insetSidePx ?? ui?.launcherInsetSidePx, 28),
      iconPreset: normalizeIconPreset(str(launcher?.iconPreset ?? ui?.launcherIconPreset, "phosphor-chat-circle")),
      buttonColor,
      buttonHoverColor: buttonHover,
      iconColor,
    },
    chatBox: {
      headerTitle: str(chatBox?.headerTitle ?? ui?.headerTitle, "Live chat"),
      headerAlign: normalizeHeaderAlign(
        str(chatBox?.headerAlign ?? chatBox?.headerTitleAlign ?? ui?.headerTitleAlign, "center"),
      ),
      headerBg: buttonColor,
      headerTextColor: headerText,
      greetingMessage: welcomeMessage,
      sendPlaceholder: str(chatBox?.sendPlaceholder ?? ui?.sendPlaceholder ?? ui?.messagePlaceholder, "Write a message…"),
      backgroundColor: str(ui?.backgroundColor, "#f8fafc"),
      boxWidth: Math.min(520, Math.max(280, num(chatBox?.boxWidth ?? ui?.boxWidth, 360))),
      boxHeight: Math.min(640, Math.max(320, num(chatBox?.boxHeight ?? ui?.boxHeight, 480))),
      fontFamily: str(theme?.fontFamily, "inherit"),
    },
  };
}

export function launcherFabPositionSx(
  appearance: RuntimeLauncherAppearance,
): Record<string, string | number> {
  const { position, insetBottomPx, insetSidePx } = appearance;
  const base = { bottom: `${insetBottomPx}px` };
  if (position === "left") {
    return { ...base, left: `${insetSidePx}px`, right: "auto", transform: "none" };
  }
  if (position === "center") {
    return {
      ...base,
      left: "50%",
      right: "auto",
      transform: `translateX(calc(-50% + ${insetSidePx}px))`,
    };
  }
  return { ...base, right: `${insetSidePx}px`, left: "auto", transform: "none" };
}

export function launcherBorderRadius(shape: string): string {
  const s = shape.toLowerCase();
  if (s === "square") return "10px";
  if (s === "rounded") return "16px";
  return "50%";
}
