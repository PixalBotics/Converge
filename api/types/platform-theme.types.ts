import type { ApiEnvelope } from "./auth.types";

export interface PlatformThemeMeData {
  backgroundColor: string | null;
}

export type PlatformThemeMeEnvelope = ApiEnvelope<PlatformThemeMeData>;

/** PATCH body: omit `backgroundColor` to leave unchanged; `null` or `""` clears (per API). */
export interface PlatformThemePatchBody {
  backgroundColor?: string | null;
}
