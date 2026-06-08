import { describe, expect, it } from "vitest";
import {
  resolveWidgetEmbedEnv,
  shouldSendSandboxConversationFlag,
  shouldSkipWidgetAnalytics,
} from "./widget-embed-env";

describe("widget-embed-env", () => {
  it("maps staging script attr to staging env", () => {
    expect(resolveWidgetEmbedEnv({ env: "staging" })).toBe("staging");
  });

  it("maps sandbox query to dashboard preview", () => {
    expect(resolveWidgetEmbedEnv({ sandbox: "1" })).toBe("dashboard_preview");
  });

  it("defaults to production", () => {
    expect(resolveWidgetEmbedEnv({})).toBe("production");
  });

  it("only skips analytics for dashboard preview", () => {
    expect(shouldSkipWidgetAnalytics("staging")).toBe(false);
    expect(shouldSkipWidgetAnalytics("production")).toBe(false);
    expect(shouldSkipWidgetAnalytics("dashboard_preview")).toBe(true);
  });

  it("only sends sandbox API flag for dashboard preview", () => {
    expect(shouldSendSandboxConversationFlag("staging")).toBe(false);
    expect(shouldSendSandboxConversationFlag("dashboard_preview")).toBe(true);
  });
});
