import { CHAT_BUNDLE_OPTIONS } from "./chat-bundles";

/**
 * Suggested company cap for External clients (backend subset-matches bundles).
 * UI shows bundles first so admins are not confused by granular codes alone.
 */
export const CHAT_CLIENT_CAP_PRESET_NAMES: readonly string[] = [
  ...CHAT_BUNDLE_OPTIONS.map((b) => b.code),
  "chat:access",
  "page:chat",
  "page:chat-widget",
  "chat-widget:view",
  "chat-widget:update",
  "chat:settings:manage",
  "chat-widget:create",
  "chat-widget:delete",
] as const;

export const CHAT_CLIENT_CAP_PRESET_LABELS: Record<string, string> = {
  "chat:access": "Chat API access (expanded from bundles)",
  "page:chat": "Live chat module",
  "page:chat-widget": "Widget / website chat settings",
  "chat-widget:view": "View widget settings",
  "chat-widget:update": "Edit widget settings",
  "chat:settings:manage": "Full operations JSON",
  ...Object.fromEntries(CHAT_BUNDLE_OPTIONS.map((b) => [b.code, b.label])),
};
