import { describe, expect, it } from "vitest";
import { normalizeServerMessage } from "./normalize-message";

describe("normalizeServerMessage", () => {
  it("maps Prisma-like visitor message", () => {
    const m = normalizeServerMessage({
      id: "m1",
      conversationId: "c1",
      message: "Hello",
      userType: "visitor",
      createdAt: "2026-01-01T00:00:00.000Z",
    });
    expect(m).toMatchObject({
      id: "m1",
      conversationId: "c1",
      content: "Hello",
      role: "visitor",
    });
  });

  it("maps content field and agent role", () => {
    const m = normalizeServerMessage({
      id: "m2",
      conversationId: "c1",
      content: "Hi",
      role: "agent",
    });
    expect(m).toMatchObject({ content: "Hi", role: "agent" });
  });

  it("maps senderType AI to ai role (not system)", () => {
    const m = normalizeServerMessage({
      id: "m3",
      conversationId: "c1",
      content: "Hello from assistant",
      senderType: "AI",
    });
    expect(m).toMatchObject({ content: "Hello from assistant", role: "ai" });
  });

  it("maps policy distribution_link to system role", () => {
    const m = normalizeServerMessage({
      id: "m4",
      conversationId: "c1",
      content: "Open form",
      senderType: "AI",
      messageType: "distribution_link",
    });
    expect(m?.role).toBe("system");
  });

  it("preserves sentBySupervisor from attachmentMetadata", () => {
    const m = normalizeServerMessage({
      id: "m5",
      conversationId: "c1",
      content: "Supervisor reply",
      senderType: "agent",
      attachmentMetadata: { sentBySupervisor: true },
    });
    expect(m?.metadata?.sentBySupervisor).toBe(true);
    expect(m?.role).toBe("agent");
  });
});
