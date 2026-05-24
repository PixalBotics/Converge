import type { ChatLiveNavItem } from "@/features/chat-shared";

export const QA_HUB_BASE = "/dashboard/qa";

export const QA_NAV_ITEMS: ChatLiveNavItem[] = [
  { href: `${QA_HUB_BASE}/inbox`, label: "Inbox" },
  { href: `${QA_HUB_BASE}/roster`, label: "Roster" },
];
