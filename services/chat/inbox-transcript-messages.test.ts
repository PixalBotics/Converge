import { describe, expect, it } from "vitest";
import type { ChatMessage } from "@/services/chat/chat.types";
import {
  inboxTranscriptDisplayForClosed,
  prepareInboxTranscriptMessages,
} from "@/features/chat-operations/utils/inbox-transcript-messages";

function formLinkMessage(
  messageType: "close_form_link" | "distribution_link",
  href: string,
): ChatMessage {
  return {
    id: `msg-${messageType}`,
    conversationId: "conv-1",
    content: "Chat closed — open the form.",
    role: "system",
    createdAt: "2026-06-02T12:00:00.000Z",
    metadata: {
      messageType,
      href,
      attachmentMetadata: {
        href,
        path: href,
        formKind: messageType === "distribution_link" ? "distribution" : "close",
      },
    },
  };
}

describe("inboxTranscriptDisplayForClosed", () => {
  it("returns undefined when only legacy close_form_link is present", () => {
    const messages = [
      formLinkMessage(
        "close_form_link",
        "/dashboard/chat-operations/wrap-up?conversationId=conv-1",
      ),
    ];
    expect(inboxTranscriptDisplayForClosed(messages)).toBeUndefined();
  });

  it("returns distribution options when distribution_link is present", () => {
    const href = "/dashboard/chat-operations/distribution?conversationId=conv-1";
    const messages = [formLinkMessage("distribution_link", href)];
    expect(inboxTranscriptDisplayForClosed(messages)).toEqual({
      requiresDistributionForm: true,
      distributionFormHref: href,
    });
  });
});

describe("prepareInboxTranscriptMessages", () => {
  it("remaps legacy close_form_link to distribution when opts request it", () => {
    const distributionHref =
      "/dashboard/chat-operations/distribution?conversationId=conv-1";
    const messages = [
      {
        id: "1",
        conversationId: "conv-1",
        content: "Hi",
        role: "visitor",
        createdAt: "2026-06-02T11:00:00.000Z",
      },
      formLinkMessage(
        "close_form_link",
        "/dashboard/chat-operations/wrap-up?conversationId=conv-1",
      ),
    ];
    const prepared = prepareInboxTranscriptMessages(messages, {
      requiresDistributionForm: true,
      distributionFormHref: distributionHref,
    });
    const link = prepared.find((m) => m.metadata?.messageType === "distribution_link");
    expect(link).toBeDefined();
    expect(link?.metadata?.href).toBe(distributionHref);
    expect(prepared.some((m) => m.metadata?.messageType === "close_form_link")).toBe(false);
  });
});
