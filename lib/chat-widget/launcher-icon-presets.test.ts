import { describe, expect, it } from "vitest";
import {
  LAUNCHER_ICON_PRESETS,
  normalizeLauncherIconPreset,
} from "./launcher-icon-presets";

describe("launcher-icon-presets", () => {
  it("exposes 20+ SVG presets", () => {
    expect(LAUNCHER_ICON_PRESETS.length).toBeGreaterThanOrEqual(20);
  });

  it("normalizes known ids and falls back for unknown", () => {
    expect(normalizeLauncherIconPreset("phosphor-chat-dots")).toBe("phosphor-chat-dots");
    expect(normalizeLauncherIconPreset("not-real")).toBe("phosphor-chat-circle");
    expect(normalizeLauncherIconPreset("")).toBe("");
  });
});
