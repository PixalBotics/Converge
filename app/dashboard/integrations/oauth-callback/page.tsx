"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Box from "@mui/material/Box";
import { Typography } from "@/components/common";
import { clearSocialMediaWizardDraft } from "@/features/social-media";

export default function SocialMediaOAuthCallbackPage() {
  const router = useRouter();
  const params = useSearchParams();

  useEffect(() => {
    const status = params.get("status");
    const platform = params.get("platform");
    const message = params.get("message");

    if (status === "success") {
      clearSocialMediaWizardDraft();
      publishSuccess(platform);
      router.replace("/dashboard/integrations");
      return;
    }

    if (status === "error") {
      publishError(message ?? "Meta OAuth connection failed.");
      router.replace("/dashboard/integrations");
      return;
    }

    router.replace("/dashboard/integrations");
  }, [params, router]);

  return (
    <Box sx={{ p: 4, textAlign: "center" }}>
      <Typography variant="medium">Completing social media connection…</Typography>
    </Box>
  );
}

function publishSuccess(platform: string | null) {
  if (typeof window === "undefined") return;
  void import("@/lib/notify").then(({ publishAppToast }) => {
    const label =
      platform === "instagram_dm"
        ? "Instagram"
        : platform === "whatsapp"
          ? "WhatsApp"
          : platform === "facebook_messenger"
            ? "Facebook"
            : "Social account";
    publishAppToast({ variant: "success", message: `${label} connected successfully.` });
  });
}

function publishError(message: string) {
  if (typeof window === "undefined") return;
  void import("@/lib/notify").then(({ publishAppToast }) => {
    publishAppToast({ variant: "error", message });
  });
}
