import { describe, expect, it } from "vitest";
import {
  draftUsesCustomLauncherIcon,
  resolveLauncherIconDataUrlForDraft,
} from "./launcher-icon-draft.util";

describe("launcher-icon-draft.util", () => {
  it("treats preset + stale http url as not custom", () => {
    expect(
      draftUsesCustomLauncherIcon({
        launcherIconPreset: "phosphor-headset",
        iconDataUrl: "https://cdn.example/old-icon.png",
      }),
    ).toBe(false);
  });

  it("treats data url as custom even with preset", () => {
    expect(
      draftUsesCustomLauncherIcon({
        launcherIconPreset: "phosphor-headset",
        iconDataUrl: "data:image/png;base64,abc",
      }),
    ).toBe(true);
  });

  it("hydrates empty iconDataUrl when preset is set", () => {
    expect(
      resolveLauncherIconDataUrlForDraft({
        launcherIconPreset: "phosphor-headset",
        buttonIconUrl: "https://cdn.example/old-icon.png",
      }),
    ).toBe("");
  });

  it("keeps http url when no preset", () => {
    expect(
      resolveLauncherIconDataUrlForDraft({
        launcherIconPreset: "",
        buttonIconUrl: "https://cdn.example/icon.png",
      }),
    ).toBe("https://cdn.example/icon.png");
  });
});
