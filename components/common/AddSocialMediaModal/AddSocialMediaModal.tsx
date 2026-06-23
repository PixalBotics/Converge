"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import { FormModal, Typography } from "@/components/common";
import { SocialMediaPlatformPicker } from "@/features/social-media/components/SocialMediaPlatformPicker";
import type { SocialUiPlatform } from "@/features/social-media/social-media.constants";
import { socialChannelCardSx } from "@/features/social-media/styles/social-wizard-ui.styles";

/** Storybook / design-system demo only. Production flow uses `/dashboard/integrations/add`. */
export interface AddSocialMediaModalProps {
  open: boolean;
  onClose: () => void;
  onSave?: () => void;
}

export function AddSocialMediaModal({ open, onClose, onSave }: AddSocialMediaModalProps) {
  const [platform, setPlatform] = useState<SocialUiPlatform | "">("facebook");

  return (
    <FormModal
      open={open}
      title="Add Social Media Integration"
      description="Demo preview — the live product uses the multi-step wizard at Integrations → Add."
      maxWidth={720}
      fitContent
      onClose={onClose}
      onSave={() => {
        onSave?.();
        onClose();
      }}
      cancelButtonLabel="Cancel"
      primaryButtonLabel="Save (demo)"
    >
      <Box sx={socialChannelCardSx}>
        <Typography
          variant="caption"
          sx={(t) => ({
            color: t.app.dashboard.textMuted,
            textTransform: "uppercase",
            letterSpacing: 0.5,
            fontWeight: 700,
            fontSize: 10,
            mb: 1.5,
            display: "block",
          })}
        >
          Select platform
        </Typography>
        <SocialMediaPlatformPicker
          value={platform}
          onChange={(p) => setPlatform(p)}
        />
      </Box>
    </FormModal>
  );
}
