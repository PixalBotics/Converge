import { describe, expect, it } from "vitest";
import {
  applyWidgetSurfaceProduct,
  widgetSurfaceFromModuleSelection,
} from "./live-chat-product-family";

describe("live-chat-product-family", () => {
  it("maps module toggles to widget surface product", () => {
    expect(widgetSurfaceFromModuleSelection({})).toBe("off");
    expect(widgetSurfaceFromModuleSelection({ chat_widget: true })).toBe("chat");
    expect(widgetSurfaceFromModuleSelection({ text_us: true })).toBe("text");
    expect(
      widgetSurfaceFromModuleSelection({ chat_widget: true, text_us: true }),
    ).toBe("both");
  });

  it("applies widget surface product to module toggles", () => {
    expect(applyWidgetSurfaceProduct({}, "both")).toEqual({
      chat_widget: true,
      text_us: true,
    });
    expect(applyWidgetSurfaceProduct({ live_chat: true }, "chat")).toEqual({
      live_chat: true,
      chat_widget: true,
      text_us: false,
    });
    expect(applyWidgetSurfaceProduct({ chat_widget: true, text_us: true }, "off")).toEqual({
      chat_widget: false,
      text_us: false,
    });
  });
});
