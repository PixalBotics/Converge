"use client";

import { useState } from "react";
import SyncAlt from "@mui/icons-material/SyncAlt";
import { Button } from "@/components/common";
import { gradientPrimaryButtonSx } from "@/components/common/Button/Button.styles";
import { uiPlatformToApi } from "@/api/social-media/social-media.api";
import { useStartMetaOAuthMutation } from "@/features/social-media/hooks/useSocialMediaQueries";
import type { SocialUiPlatform } from "../social-media.constants";
import { getSocialPlatformMeta } from "../social-platform-meta";
import { publishAppToast } from "@/lib/notify";
import { extractApiErrorMessageForToast } from "@/lib/notify/extract-api-message";

export type SocialMetaOAuthConnectButtonProps = {
  websiteId: string;
  platform: SocialUiPlatform;
  disabled?: boolean;
};

export function SocialMetaOAuthConnectButton({
  websiteId,
  platform,
  disabled,
}: SocialMetaOAuthConnectButtonProps) {
  const oauthMutation = useStartMetaOAuthMutation();
  const [loading, setLoading] = useState(false);
  const meta = getSocialPlatformMeta(platform);
  const label = meta?.connectLabel ?? "Connect with Meta";

  const handleConnect = async () => {
    if (!websiteId.trim()) {
      publishAppToast({ variant: "error", message: "Select a website first." });
      return;
    }
    setLoading(true);
    try {
      const { authorizeUrl } = await oauthMutation.mutateAsync({
        websiteId: websiteId.trim(),
        platform: uiPlatformToApi(platform),
      });
      if (!authorizeUrl) {
        publishAppToast({ variant: "error", message: "Meta OAuth is not configured." });
        return;
      }
      window.location.href = authorizeUrl;
    } catch (e) {
      publishAppToast({
        variant: "error",
        message: extractApiErrorMessageForToast(e, "Could not start Meta OAuth."),
      });
      setLoading(false);
    }
  };

  return (
    <Button
      type="button"
      variant="primary"
      sx={gradientPrimaryButtonSx}
      startIcon={<SyncAlt sx={{ fontSize: 18 }} />}
      disabled={disabled || loading}
      onClick={() => void handleConnect()}
    >
      {loading ? "Redirecting…" : label}
    </Button>
  );
}
