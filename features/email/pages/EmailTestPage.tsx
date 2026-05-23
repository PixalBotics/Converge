"use client";

import { useCallback, useState } from "react";
import Box from "@mui/material/Box";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { Button, Typography } from "@/components/common";
import { useAuth } from "@/lib/auth";
import { OP } from "@/lib/permissions/operational-keys";
import { EmailSectionLayout } from "../components/EmailSectionLayout";
import { EmailConnectionTestSection } from "../components/EmailConnectionTestSection";
import {
  usePlatformEmailSettingsQuery,
  useResellerOwnMailSettingsQuery,
  useTestPlatformEmailSettingsMutation,
  useTestResellerOwnMailMutation,
} from "../hooks/useEmailSettings";
import { useEmailResellerScope } from "../context/EmailResellerScopeContext";
import { EmailResellerScopeGate } from "../components/EmailResellerScopeGate";

type TestTier = "platform" | "reseller" | "website";

export function EmailTestPage() {
  const theme = useTheme() as AppTheme;
  const { hasOperational, user } = useAuth();
  const isInternal = user?.userType === "Internal";
  const { resellerId, ready } = useEmailResellerScope();
  const [tier, setTier] = useState<TestTier>(isInternal ? "platform" : "reseller");

  const platformQuery = usePlatformEmailSettingsQuery({
    enabled: tier === "platform" && isInternal,
  });
  const resellerQuery = useResellerOwnMailSettingsQuery(ready ? resellerId : null, {
    enabled: tier === "reseller" && Boolean(resellerId),
  });
  const testPlatformMutation = useTestPlatformEmailSettingsMutation();
  const testResellerMutation = useTestResellerOwnMailMutation(ready ? resellerId ?? "" : "");

  const platformTest = useCallback(
    async (toEmail?: string) => {
      const result = await testPlatformMutation.mutateAsync({ toEmail });
      return { success: result.success, message: result.message ?? "" };
    },
    [testPlatformMutation],
  );

  const resellerTest = useCallback(
    async (toEmail?: string) => {
      const result = await testResellerMutation.mutateAsync({ toEmail });
      return { success: result.success, message: result.message ?? "" };
    },
    [testResellerMutation],
  );

  return (
    <EmailSectionLayout
      title="Email test"
      description="Send a test message using platform mail, reseller mail, or website-level settings."
    >
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}>
        {isInternal ? (
          <Button
            type="button"
            variant={tier === "platform" ? "primary" : "secondary"}
            onClick={() => setTier("platform")}
          >
            Platform
          </Button>
        ) : null}
        <Button
          type="button"
          variant={tier === "reseller" ? "primary" : "secondary"}
          onClick={() => setTier("reseller")}
        >
          Reseller
        </Button>
        <Button
          type="button"
          variant={tier === "website" ? "primary" : "secondary"}
          onClick={() => setTier("website")}
        >
          Website
        </Button>
      </Box>

      {tier === "platform" && isInternal ? (
        <EmailConnectionTestSection
          onTest={platformTest}
          testing={testPlatformMutation.isPending}
          ready={Boolean(platformQuery.data?.emailProviderId)}
          lastTestStatus={platformQuery.data?.lastTestStatus}
          lastTestMessage={platformQuery.data?.lastTestMessage}
        />
      ) : null}

      {tier === "reseller" ? (
        <EmailResellerScopeGate>
          <EmailConnectionTestSection
            onTest={resellerTest}
            testing={testResellerMutation.isPending}
            ready={Boolean(resellerQuery.data?.emailProviderId)}
            lastTestStatus={resellerQuery.data?.lastTestStatus}
            lastTestMessage={resellerQuery.data?.lastTestMessage}
          />
        </EmailResellerScopeGate>
      ) : null}

      {tier === "website" ? (
        <Typography variant="medium" sx={{ color: theme.app.dashboard.textMuted }}>
          Website-level test uses mail assigned per website. Configure distribution and SMTP under
          Email setup, then send from the website billing profile (next iteration).
        </Typography>
      ) : null}
    </EmailSectionLayout>
  );
}
