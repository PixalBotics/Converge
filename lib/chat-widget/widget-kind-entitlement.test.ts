import { describe, expect, it } from "vitest";
import { PAGE } from "@/lib/permissions/permission-constants";
import {
  clampWidgetKind,
  pickDefaultWidgetKind,
  resolveAllowedWidgetKinds,
} from "./widget-kind-entitlement";

describe("widget-kind-entitlement", () => {
  it("allows both only when chat widget and text us modules are on", () => {
    const none = resolveAllowedWidgetKinds(() => false);
    expect(none).toEqual([]);

    const chatOnly = resolveAllowedWidgetKinds((p) => p === PAGE.CHAT_WIDGET);
    expect(chatOnly).toEqual(["chat"]);

    const textOnly = resolveAllowedWidgetKinds((p) => p === PAGE.PHONE_NUMBER_SETUP);
    expect(textOnly).toEqual(["text"]);

    const both = resolveAllowedWidgetKinds(
      (p) => p === PAGE.CHAT_WIDGET || p === PAGE.PHONE_NUMBER_SETUP,
    );
    expect(both).toEqual(["chat", "text", "both"]);
  });

  it("prefers both as default when available", () => {
    expect(pickDefaultWidgetKind(["chat", "text", "both"])).toBe("both");
    expect(pickDefaultWidgetKind(["chat"])).toBe("chat");
  });

  it("clamps unsupported kinds to an allowed default", () => {
    expect(clampWidgetKind("both", ["chat"])).toBe("chat");
    expect(clampWidgetKind("text", ["chat", "text", "both"])).toBe("text");
  });
});
