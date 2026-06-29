import { CHAT_BUNDLE_OPTIONS } from "./chat-bundles";

/**
 * Suggested company cap for External clients (backend subset-matches bundles).
 * UI shows bundles first so admins are not confused by granular codes alone.
 */
export const CHAT_CLIENT_CAP_PRESET_NAMES: readonly string[] = [
  ...CHAT_BUNDLE_OPTIONS.map((b) => b.code),
  "chat:access",
  "page:chat",
  "page:chat-inbox",
  "page:chat-monitor",
  "page:chat-qa",
  "page:chat-reports",
  "page:chat-widget",
  "page:chat-close-policy",
  "page:chat-canned",
  "page:chat-involvement",
  "page:chat-internal-supervisors",
  "page:chat-qa-roster",
  "page:ai-assistant",
  "page:ai-chatbot",
  "chat-widget:view",
  "chat-widget:update",
  "chat:settings:manage",
  "chat-widget:create",
  "chat-widget:delete",
] as const;

export const CHAT_CLIENT_CAP_PRESET_LABELS: Record<string, string> = {
  "chat:access": "Chat API access (expanded from bundles)",
  "page:chat": "Live chat module (legacy — expands to all chat pages)",
  "page:chat-inbox": "Agent inbox",
  "page:chat-monitor": "Live chat monitor",
  "page:chat-qa": "QA inbox",
  "page:chat-reports": "Chat reports",
  "page:chat-widget": "Widget embed (legacy umbrella)",
  "page:chat-close-policy": "Close policy / chat settings",
  "page:chat-canned": "Canned messages",
  "page:chat-involvement": "Chat involvement",
  "page:chat-internal-supervisors": "Internal supervisors",
  "page:chat-qa-roster": "QA roster",
  "page:ai-assistant": "AI assistant training",
  "page:ai-chatbot": "AI chatbot training",
  "chat-widget:view": "View widget settings",
  "chat-widget:update": "Edit widget settings",
  "chat:settings:manage": "Full operations JSON",
  ...Object.fromEntries(CHAT_BUNDLE_OPTIONS.map((b) => [b.code, b.label])),
};
