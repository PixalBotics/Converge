import { describe, expect, it } from "vitest";
import { normalizeChatMessageText } from "./text";

describe("normalizeChatMessageText", () => {
  it("normalizes line endings and trims", () => {
    expect(normalizeChatMessageText("  hello\r\nworld  ")).toBe("hello\nworld");
  });

  it("returns empty for non-string", () => {
    expect(normalizeChatMessageText(null)).toBe("");
  });
});

describe("chat markdown formatting expectations", () => {
  it("preserves paragraph breaks for markdown renderer", () => {
    const text = "First paragraph.\n\n- One\n- Two";
    expect(normalizeChatMessageText(text)).toBe(text);
  });
});
