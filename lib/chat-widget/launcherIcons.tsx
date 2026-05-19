"use client";

import {
  PiChatCircleDuotone,
  PiChatDotsDuotone,
  PiChatTeardropDuotone,
  PiChatsCircleDuotone,
} from "react-icons/pi";

import type { LauncherIconPresetId } from "@/lib/chat-widget/widgetDraft";

export const LAUNCHER_ICON_PRESETS: Array<{
  id: Exclude<LauncherIconPresetId, "">;
  label: string;
  Icon: typeof PiChatCircleDuotone;
}> = [
  { id: "phosphor-chat-circle", label: "Chat circle", Icon: PiChatCircleDuotone },
  { id: "phosphor-chats-circle", label: "Chats circle", Icon: PiChatsCircleDuotone },
  { id: "phosphor-chat-dots", label: "Chat dots", Icon: PiChatDotsDuotone },
  { id: "phosphor-chat-teardrop", label: "Chat teardrop", Icon: PiChatTeardropDuotone },
];

export function LauncherPresetIcon({
  presetId,
  color,
  fontSizePx,
}: {
  presetId: LauncherIconPresetId;
  color: string;
  fontSizePx: number;
}) {
  if (!presetId) return null;
  const entry = LAUNCHER_ICON_PRESETS.find((p) => p.id === presetId);
  if (!entry) return null;
  const IconComponent = entry.Icon;
  return <IconComponent color={color} size={fontSizePx} />;
}
