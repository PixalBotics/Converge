"use client";

import { useState } from "react";
import { Button } from "@/components/common";
import { startCrmOAuth } from "@/api/crm/crm-oauth.api";
import { publishAppToast } from "@/lib/notify";
import { writeCrmWizardIntegrationId } from "../wizard-storage";
import { getCrmPlatformMeta } from "../crm-platform-meta";

export type CrmOAuthConnectButtonProps = {
  platformCode: string;
  companyId: string;
  websiteId?: string;
  integrationId?: string | null;
  disabled?: boolean;
  onSaveBeforeConnect?: () => Promise<string | null | undefined>;
};

export function CrmOAuthConnectButton({
  platformCode,
  companyId,
  websiteId,
  integrationId,
  disabled,
  onSaveBeforeConnect,
}: CrmOAuthConnectButtonProps) {
  const [loading, setLoading] = useState(false);
  const meta = getCrmPlatformMeta(platformCode);
  const label = meta ? `Connect with ${meta.name}` : "Connect with CRM";

  const handleConnect = async () => {
    setLoading(true);
    try {
      let activeIntegrationId = integrationId ?? undefined;
      if (onSaveBeforeConnect) {
        activeIntegrationId = (await onSaveBeforeConnect()) ?? activeIntegrationId;
      }
      const result = await startCrmOAuth(platformCode, {
        companyId,
        platformCode,
        connectionMethod: "oauth",
        websiteId,
        integrationId: activeIntegrationId,
      });
      writeCrmWizardIntegrationId(result.integrationId);
      window.location.href = result.authorizeUrl;
    } catch (e) {
      publishAppToast({
        variant: "error",
        message: e instanceof Error ? e.message : "Could not start OAuth.",
      });
      setLoading(false);
    }
  };

  return (
    <Button
      type="button"
      variant="primary"
      disabled={disabled || loading}
      onClick={() => void handleConnect()}
    >
      {loading ? "Redirecting…" : label}
    </Button>
  );
}
