import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  markWidgetTrackSent,
  shouldSkipWidgetTrack,
} from "@/lib/widget-runtime/widget-track-dedupe";

function createSessionStorageMock() {
  const store = new Map<string, string>();
  return {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => {
      store.set(key, value);
    },
    removeItem: (key: string) => {
      store.delete(key);
    },
    clear: () => {
      store.clear();
    },
  };
}

describe("widget-track-dedupe", () => {
  beforeEach(() => {
    vi.stubGlobal("sessionStorage", createSessionStorageMock());
  });

  afterEach(() => {
    sessionStorage.clear();
    vi.unstubAllGlobals();
  });

  it("does not skip before mark", () => {
    expect(
      shouldSkipWidgetTrack({
        eventType: "page_view",
        sessionId: "sess-1",
        pageUrl: "https://example.com/a",
      }),
    ).toBe(false);
  });

  it("skips duplicate page_view for same session and page", () => {
    const params = {
      eventType: "page_view" as const,
      sessionId: "sess-1",
      pageUrl: "https://example.com/a",
    };
    markWidgetTrackSent(params);
    expect(shouldSkipWidgetTrack(params)).toBe(true);
  });

  it("tracks widget_open once per session", () => {
    const params = { eventType: "widget_open" as const, sessionId: "sess-2" };
    markWidgetTrackSent(params);
    expect(shouldSkipWidgetTrack(params)).toBe(true);
  });
});
