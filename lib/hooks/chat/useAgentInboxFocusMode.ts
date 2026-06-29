"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { isDashboardAgentInboxPath } from "@/features/chat-shared/utils/chat-workstation-path";
import {
  isAgentChatSessionAccepting,
  subscribeAgentChatSession,
} from "./agent-chat-session-bus";

/** Agent inbox fullscreen — Chat Start active on `/dashboard/chat-operations`. */
export function useAgentInboxFocusMode(): boolean {
  const pathname = usePathname();
  const [acceptingChats, setAcceptingChats] = useState(isAgentChatSessionAccepting);

  useEffect(
    () =>
      subscribeAgentChatSession((session) => {
        setAcceptingChats(session.status === "active" && session.acceptingChats);
      }),
    [],
  );

  return isDashboardAgentInboxPath(pathname) && acceptingChats;
}
