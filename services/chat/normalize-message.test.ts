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
});
