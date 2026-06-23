export const SOCIAL_MEDIA_ROUTES = {
  list: "/dashboard/integrations",
  addOrg: "/dashboard/integrations/add",
  addPlatform: "/dashboard/integrations/add/platform",
  addConnect: "/dashboard/integrations/add/connect",
  oauthCallback: "/dashboard/integrations/oauth-callback",
} as const;

export const SOCIAL_PLATFORMS = ["facebook", "instagram", "whatsapp"] as const;
export type SocialUiPlatform = (typeof SOCIAL_PLATFORMS)[number];
