import { describe, expect, it } from "vitest";
import { normalizeLauncherStyle, normalizePanelSurfaceStyle } from "./launcher-style";

describe("normalizeLauncherStyle", () => {
  it("defaults to solid", () => {
    expect(normalizeLauncherStyle(undefined)).toBe("solid");
    expect(normalizeLauncherStyle("")).toBe("solid");
  });

  it("accepts known styles", () => {
    expect(normalizeLauncherStyle("gradient")).toBe("gradient");
    expect(normalizeLauncherStyle("GLASS")).toBe("glass");
    expect(normalizeLauncherStyle("glow")).toBe("glow");
  });
});

describe("normalizePanelSurfaceStyle", () => {
  it("maps glow to solid for panel shell", () => {
    expect(normalizePanelSurfaceStyle("glow")).toBe("solid");
    expect(normalizePanelSurfaceStyle("glass")).toBe("glass");
  });
});
