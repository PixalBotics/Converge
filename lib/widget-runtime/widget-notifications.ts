import type { RuntimeChatAppearance } from "./widget-runtime-appearance";

export type WidgetSoundId = "soft" | "chime" | "ping" | "none";

export type WidgetLauncherBadgeMode = "count" | "dot" | "none";

const SOUND_PROFILES: Record<
  Exclude<WidgetSoundId, "none">,
  { frequency: number; durationMs: number; gain: number }
> = {
  soft: { frequency: 520, durationMs: 160, gain: 0.12 },
  chime: { frequency: 880, durationMs: 140, gain: 0.14 },
  ping: { frequency: 1240, durationMs: 110, gain: 0.13 },
};

let sharedAudioContext: AudioContext | null = null;

function getSharedAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const Ctx =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;
  if (!Ctx) return null;
  if (!sharedAudioContext || sharedAudioContext.state === "closed") {
    sharedAudioContext = new Ctx();
  }
  return sharedAudioContext;
}

/** Call on first user gesture (launcher click) so autoplay policies allow beeps. */
export function unlockWidgetAudio(): void {
  const ctx = getSharedAudioContext();
  if (!ctx) return;
  if (ctx.state === "suspended") {
    void ctx.resume().catch(() => undefined);
  }
  try {
    const buffer = ctx.createBuffer(1, 1, ctx.sampleRate);
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);
    source.start(0);
    source.stop(0);
  } catch {
    /* ignore */
  }
}

export function normalizeWidgetSoundId(raw: unknown): WidgetSoundId {
  const id = String(raw ?? "")
    .trim()
    .toLowerCase();
  if (id === "soft" || id === "chime" || id === "ping" || id === "none") return id;
  return "chime";
}

export function normalizeLauncherBadgeMode(raw: unknown): WidgetLauncherBadgeMode {
  const id = String(raw ?? "")
    .trim()
    .toLowerCase();
  if (id === "count" || id === "dot" || id === "none") return id;
  return "count";
}

export function resolveSoundIdFromAppearance(
  appearance: Pick<
    RuntimeChatAppearance,
    "soundNotification" | "notificationSoundId"
  >,
): WidgetSoundId {
  if (!appearance.soundNotification) return "none";
  const id = appearance.notificationSoundId;
  if (id && id !== "none") return id;
  return "chime";
}

/** Short browser beep (no asset files). */
export function playWidgetSound(soundId: WidgetSoundId): void {
  if (soundId === "none" || typeof window === "undefined") return;
  try {
    const ctx = getSharedAudioContext();
    if (!ctx) return;
    const run = () => {
      const profile = SOUND_PROFILES[soundId];
      const t0 = ctx.currentTime;
      const durationSec = profile.durationMs / 1000;
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = "sine";
      o.connect(g);
      g.connect(ctx.destination);
      o.frequency.value = profile.frequency;
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.exponentialRampToValueAtTime(profile.gain, t0 + 0.012);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + durationSec);
      o.start(t0);
      o.stop(t0 + durationSec + 0.03);
    };
    if (ctx.state === "suspended") {
      void ctx.resume().then(run).catch(() => undefined);
      return;
    }
    run();
  } catch {
    /* ignore */
  }
}

export function truncateNotificationPreview(text: string, max = 72): string {
  const t = text.replace(/\s+/g, " ").trim();
  if (!t) return "";
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1)}…`;
}

/** ~Half of the last message for the closed-widget invitation preview bubble. */
export function truncateClosedMessagePreviewHalf(text: string): string {
  const t = text.replace(/\s+/g, " ").trim();
  if (!t) return "";
  if (t.length <= 28) return t;
  const target = Math.max(28, Math.ceil(t.length / 2));
  if (t.length <= target) return t;
  const slice = t.slice(0, target);
  const lastSpace = slice.lastIndexOf(" ");
  const cut =
    lastSpace > target * 0.5 ? slice.slice(0, lastSpace) : slice.trimEnd();
  return `${cut.trim()}…`;
}

export function resolveNotificationTitle(
  appearance: Pick<RuntimeChatAppearance, "fallbackNotificationText">,
  preview: string,
): string {
  const fallback = appearance.fallbackNotificationText.trim();
  if (preview) return preview;
  return fallback || "New message";
}

export function shouldPlayWidgetIncomingSound(options?: {
  panelOpen?: boolean;
  tabHidden?: boolean;
}): boolean {
  const panelOpen = options?.panelOpen === true;
  const tabHidden = options?.tabHidden === true;
  return !panelOpen || tabHidden;
}

export function notifyWidgetIncoming(
  appearance: RuntimeChatAppearance,
  preview: string,
  options?: { launcherOpen?: boolean; playSound?: boolean },
): void {
  const title = resolveNotificationTitle(appearance, truncateNotificationPreview(preview));
  const launcherOpen = options?.launcherOpen === true;
  const playSound =
    options?.playSound ??
    shouldPlayWidgetIncomingSound({
      panelOpen: launcherOpen,
      tabHidden: typeof document !== "undefined" && document.hidden,
    });

  if (playSound) {
    unlockWidgetAudio();
    playWidgetSound(resolveSoundIdFromAppearance(appearance));
  }

  if (
    launcherOpen ||
    !appearance.notificationEnabled ||
    typeof window === "undefined" ||
    !window.Notification ||
    Notification.permission !== "granted"
  ) {
    return;
  }

  try {
    new Notification(title, {
      tag: `converge-widget-${appearance.launcher.buttonLabel}`,
    });
  } catch {
    /* ignore */
  }
}

export function requestWidgetNotificationPermission(): void {
  if (typeof window === "undefined" || !window.Notification) return;
  if (Notification.permission === "default") {
    void Notification.requestPermission().catch(() => undefined);
  }
}
