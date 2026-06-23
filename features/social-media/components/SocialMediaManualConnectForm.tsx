"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import Collapse from "@mui/material/Collapse";
import { Button, InputField, Typography } from "@/components/common";
import { gradientPrimaryButtonSx } from "@/components/common/Button/Button.styles";
import { uiPlatformToApi } from "@/api/social-media/social-media.api";
import { useCreateSocialMediaConnectionMutation } from "@/features/social-media/hooks/useSocialMediaQueries";
import type { SocialUiPlatform } from "../social-media.constants";
import { publishAppToast } from "@/lib/notify";
import { extractApiErrorMessageForToast } from "@/lib/notify/extract-api-message";

export type SocialMediaManualConnectFormProps = {
  websiteId: string;
  platform: SocialUiPlatform;
  onSuccess?: () => void;
  showAdvancedToggle?: boolean;
};

export function SocialMediaManualConnectForm({
  websiteId,
  platform,
  onSuccess,
  showAdvancedToggle = false,
}: SocialMediaManualConnectFormProps) {
  const createMutation = useCreateSocialMediaConnectionMutation();
  const [expanded, setExpanded] = useState(!showAdvancedToggle);
  const [accountName, setAccountName] = useState("");
  const [externalAccountId, setExternalAccountId] = useState("");
  const [pageId, setPageId] = useState("");
  const [instagramId, setInstagramId] = useState("");
  const [wabaId, setWabaId] = useState("");
  const [accessToken, setAccessToken] = useState("");

  const handleSave = async () => {
    if (!websiteId.trim()) {
      publishAppToast({ variant: "error", message: "Website is required." });
      return;
    }
    if (!externalAccountId.trim()) {
      publishAppToast({
        variant: "error",
        message: platform === "whatsapp" ? "Phone Number ID is required." : "Page ID is required.",
      });
      return;
    }
    if (!accessToken.trim()) {
      publishAppToast({ variant: "error", message: "Access token is required." });
      return;
    }
    try {
      await createMutation.mutateAsync({
        websiteId: websiteId.trim(),
        platform: uiPlatformToApi(platform),
        externalAccountId: externalAccountId.trim(),
        accountName: accountName.trim() || undefined,
        pageId: pageId.trim() || (platform !== "whatsapp" ? externalAccountId.trim() : undefined),
        instagramId: instagramId.trim() || undefined,
        wabaId: wabaId.trim() || undefined,
        accessToken: accessToken.trim(),
      });
      publishAppToast({ variant: "success", message: "Social account connected." });
      onSuccess?.();
    } catch (e) {
      publishAppToast({
        variant: "error",
        message: extractApiErrorMessageForToast(e, "Could not connect account."),
      });
    }
  };

  const fields = (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {platform === "facebook" ? (
        <>
          <InputField label="Page name" name="accountName" value={accountName} onChange={(e) => setAccountName(e.target.value)} />
          <InputField
            label="Page ID"
            name="pageId"
            value={externalAccountId || pageId}
            onChange={(e) => {
              setExternalAccountId(e.target.value);
              setPageId(e.target.value);
            }}
          />
        </>
      ) : null}
      {platform === "instagram" ? (
        <>
          <InputField label="Account name" name="accountName" value={accountName} onChange={(e) => setAccountName(e.target.value)} />
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
            <InputField label="Page ID" name="pageId" value={pageId} onChange={(e) => setPageId(e.target.value)} />
            <InputField label="Instagram ID" name="instagramId" value={instagramId} onChange={(e) => setInstagramId(e.target.value)} />
          </Box>
          <InputField
            label="External account ID (Page ID)"
            name="externalId"
            value={externalAccountId}
            onChange={(e) => setExternalAccountId(e.target.value)}
          />
        </>
      ) : null}
      {platform === "whatsapp" ? (
        <>
          <InputField label="Display name" name="accountName" value={accountName} onChange={(e) => setAccountName(e.target.value)} />
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
            <InputField
              label="Phone Number ID"
              name="phoneNumberId"
              value={externalAccountId}
              onChange={(e) => setExternalAccountId(e.target.value)}
            />
            <InputField label="WABA ID" name="wabaId" value={wabaId} onChange={(e) => setWabaId(e.target.value)} />
          </Box>
        </>
      ) : null}
      <InputField
        label="Access token"
        name="accessToken"
        type="password"
        value={accessToken}
        onChange={(e) => setAccessToken(e.target.value)}
        helperText="Long-lived Meta access token with messaging permissions."
      />
      <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
        <Button
          type="button"
          variant="primary"
          sx={gradientPrimaryButtonSx}
          disabled={createMutation.isPending}
          onClick={() => void handleSave()}
        >
          {createMutation.isPending ? "Saving…" : "Save connection"}
        </Button>
      </Box>
    </Box>
  );

  if (!showAdvancedToggle) return fields;

  return (
    <Box>
      <Button type="button" variant="secondary" onClick={() => setExpanded((v) => !v)} sx={{ mb: 1.5 }}>
        {expanded ? "Hide manual connection" : "Manual connection (advanced)"}
      </Button>
      <Collapse in={expanded}>
        <Typography variant="caption" sx={{ color: (t) => t.app.dashboard.textMuted, display: "block", mb: 2 }}>
          Use when OAuth is unavailable. Paste Page ID and a long-lived token from Meta Business Suite.
        </Typography>
        {fields}
      </Collapse>
    </Box>
  );
}
