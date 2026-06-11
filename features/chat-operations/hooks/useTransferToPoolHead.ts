"use client";

import { useCallback, useState } from "react";
import { getAccessToken } from "@/api";
import { publishAgentInboxDelta } from "@/lib/hooks/chat/agent-inbox-delta-bus";
import { extractApiErrorMessageForToast, publishAppToast } from "@/lib/notify";
import { transferConversationToPoolHead } from "@/services/chat/agent-inbox.api";

export function useTransferToPoolHead(conversationId: string | null) {
  const token = getAccessToken() ?? "";
  const [busy, setBusy] = useState(false);

  const transfer = useCallback(async () => {
    if (!conversationId || !token || busy) return false;
    setBusy(true);
    try {
      const res = await transferConversationToPoolHead(conversationId, token);
      publishAgentInboxDelta({
        kind: "conversation_reassigned_away",
        conversationId,
      });
      publishAppToast({
        variant: "success",
        message: `Chat transferred to pool head${res.toAgent?.label ? ` (${res.toAgent.label})` : ""}.`,
      });
      return true;
    } catch (err) {
      publishAppToast({
        variant: "error",
        message:
          extractApiErrorMessageForToast(err) ??
          "Could not transfer chat to pool head.",
      });
      return false;
    } finally {
      setBusy(false);
    }
  }, [busy, conversationId, token]);

  return {
    enabled: Boolean(conversationId && token),
    busy,
    transfer,
  };
}
