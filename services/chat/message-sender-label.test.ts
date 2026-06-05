import { describe, expect, it } from "vitest";
import type { ChatMessage } from "@/services/chat/chat.types";
import {
  isSupervisorSentMessage,
  resolveMessageSenderLabel,
} from "@/features/chat-operations/utils/message-sender-label";

describe("message-sender-label", () => {
  it("labels supervisor-sent agent messages", () => {
    const message: ChatMessage = {
      conversationId: "c1",
      content: "Hello",
      role: "agent",
      metadata: { sentBySupervisor: true },
    };
    expect(isSupervisorSentMessage(message)).toBe(true);
    expect(resolveMessageSenderLabel(message, { agentDisplayName: "Alex" })).toBe(
      "Supervisor",
    );
  });

  it("labels distribution form messages", () => {
    const message: ChatMessage = {
      conversationId: "c1",
      content: "Form",
      role: "system",
      metadata: { messageType: "distribution_link" },
    };
    expect(resolveMessageSenderLabel(message)).toBe("Distribution close chat");
  });
});
