import { describe, expect, it } from "vitest";
import {
  computeEmbedHostFrameSize,
  computeEmbedOpenPanelMaxHeightPx,
  EMBED_LAUNCHER_SIZE_PX,
} from "./embed-host-messaging";
import type { RuntimeChatAppearance } from "./widget-runtime-appearance";

function mockAppearance(
  overrides?: Partial<RuntimeChatAppearance["chatBox"]>,
): RuntimeChatAppearance {
  return {
    chatBox: {
      boxWidth: 360,
      boxHeight: 480,
      headerTitle: "Chat",
      headerBg: "#1e63d5",
      headerTextColor: "#fff",
      backgroundColor: "#fff",
      sendPlaceholder: "Message",
      ...overrides,
    },
    launcher: {
      position: "right",
      insetBottomPx: 16,
      insetSidePx: 16,
      buttonColor: "#1e63d5",
      buttonHoverColor: "#1550b0",
      iconColor: "#fff",
      shape: "circle",
      style: "solid",
      proactiveTeaserActive: false,
      proactiveTeaser: "",
      proactiveTeaserAvatarUrl: "",
      buttonLabel: "Chat",
      iconPreset: "phosphor-chat-circle",
      iconUrl: "",
      iconEnabled: true,
      proactiveSecondaryCta: { enabled: false, label: "", href: "", kind: "" },
    },
    panelSurfaceStyle: "solid",
    bubbleSurfaceStyle: "solid",
    avatars: {
      agent: { enabled: true, url: "", preset: "phosphor-headset" },
      visitor: { enabled: false, url: "", preset: "phosphor-user-circle" },
    },
    borderRadiusPx: 12,
    bodyTextColor: "#0f172a",
    motionEnabled: true,
    densityTokens: { panelPaddingPx: 16, stackGapMultiplier: 1, inputPaddingPx: 8 },
    colors: {} as RuntimeChatAppearance["colors"],
    launcherBadgeMode: "none",
    autoOpenEnabled: false,
    autoOpenDelaySeconds: 0,
    autoOpenOnReturnVisit: false,
    welcomeMessage: "",
    firstMessage: "",
    form: { enabled: false, fields: [] },
  } as unknown as RuntimeChatAppearance;
}

describe("computeEmbedHostFrameSize", () => {
  it("uses launcher-only size when closed without invitation", () => {
    const size = computeEmbedHostFrameSize(false, mockAppearance());
    expect(size.width).toBeGreaterThan(EMBED_LAUNCHER_SIZE_PX);
    expect(size.height).toBeGreaterThan(EMBED_LAUNCHER_SIZE_PX);
  });

  it("sizes chat pill launcher wider than the circular FAB", () => {
    const appearance = mockAppearance();
    appearance.launcher.buttonLabel = "Chat with us";
    const size = computeEmbedHostFrameSize(false, appearance, undefined, "chat");
    expect(size.width).toBeGreaterThan(160);
    expect(size.height).toBeGreaterThan(56);
  });

  it("sizes Text Us pill launcher wider than the chat FAB", () => {
    const appearance = mockAppearance();
    appearance.launcher.buttonLabel = "Text us";
    const size = computeEmbedHostFrameSize(false, appearance, undefined, "textUs");
    expect(size.width).toBeGreaterThan(EMBED_LAUNCHER_SIZE_PX);
    expect(size.height).toBeGreaterThan(56);
  });

  it("adds badge overflow room when launcher badge is visible", () => {
    const appearance = mockAppearance();
    appearance.launcher.buttonLabel = "Chat with us";
    appearance.launcherBadgeMode = "count";
    const withoutBadge = computeEmbedHostFrameSize(false, appearance, undefined, "chat");
    const withBadge = computeEmbedHostFrameSize(
      false,
      appearance,
      { hasLauncherBadge: true },
      "chat",
    );
    expect(withBadge.width).toBeGreaterThan(withoutBadge.width);
    expect(withBadge.height).toBeGreaterThanOrEqual(withoutBadge.height);
  });

  it("expands closed frame when invitation bubble is visible", () => {
    const size = computeEmbedHostFrameSize(false, mockAppearance(), {
      hasInvitationBubble: true,
    });
    expect(size.width).toBeGreaterThan(EMBED_LAUNCHER_SIZE_PX);
    expect(size.height).toBeGreaterThan(EMBED_LAUNCHER_SIZE_PX);
  });

  it("uses configured panel size when open", () => {
    const size = computeEmbedHostFrameSize(true, mockAppearance());
    expect(size.width).toBeGreaterThanOrEqual(360);
    expect(size.height).toBeGreaterThan(480);
  });

  it("caps Text Us open panel height to parent viewport minus page inset", () => {
    const appearance = mockAppearance();
    appearance.launcher.verticalAnchor = "top";
    appearance.launcher.insetTopPx = 28;
    appearance.chatBox.boxHeight = 720;
    const panelH = computeEmbedOpenPanelMaxHeightPx(appearance, "textUs", 420);
    expect(panelH).toBeLessThan(720);
    expect(panelH).toBeGreaterThanOrEqual(280);
  });

  it("sizes Text Us open iframe to panel only (launcher hidden)", () => {
    const appearance = mockAppearance();
    appearance.launcher.buttonLabel = "Text us";
    const panelH = computeEmbedOpenPanelMaxHeightPx(appearance, "textUs", 900);
    const size = computeEmbedHostFrameSize(true, appearance, undefined, "textUs");
    expect(size.height).toBeLessThan(panelH + 80);
    expect(size.height).toBeGreaterThan(panelH);
  });
});
