import type { PickWebsitePreset } from "@/features/website-assignments/components/PickWebsiteModal";
import { SOCIAL_PLATFORMS, type SocialUiPlatform } from "./social-media.constants";

const WEBSITE_KEY = "social-media-wizard-website";
const PLATFORM_KEY = "social-media-wizard-platform";

function isSocialPlatform(raw: string): raw is SocialUiPlatform {
  return (SOCIAL_PLATFORMS as readonly string[]).includes(raw);
}

export function readSocialMediaWizardWebsite(): PickWebsitePreset | null {
  if (typeof sessionStorage === "undefined") return null;
  const raw = sessionStorage.getItem(WEBSITE_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as PickWebsitePreset;
    if (!parsed?.childCompanyId?.trim() || !parsed?.websiteId?.trim()) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function writeSocialMediaWizardWebsite(preset: PickWebsitePreset): void {
  sessionStorage.setItem(WEBSITE_KEY, JSON.stringify(preset));
}

export function readSocialMediaWizardPlatform(): SocialUiPlatform | null {
  if (typeof sessionStorage === "undefined") return null;
  const raw = sessionStorage.getItem(PLATFORM_KEY)?.trim().toLowerCase();
  if (raw && isSocialPlatform(raw)) return raw;
  return null;
}

export function writeSocialMediaWizardPlatform(platform: SocialUiPlatform | null): void {
  if (!platform) sessionStorage.removeItem(PLATFORM_KEY);
  else sessionStorage.setItem(PLATFORM_KEY, platform);
}

export function clearSocialMediaWizardDraft(): void {
  sessionStorage.removeItem(WEBSITE_KEY);
  sessionStorage.removeItem(PLATFORM_KEY);
}
