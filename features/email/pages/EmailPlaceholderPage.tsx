"use client";

import { DashboardCard, Typography } from "@/components/common";
import { emailCard } from "../styles/email-page.styles";
import { EmailSectionLayout } from "../components/EmailSectionLayout";
import { EmailResellerScopeGate } from "../components/EmailResellerScopeGate";

export function EmailPlaceholderPage({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <EmailSectionLayout title={title} description={description}>
      <EmailResellerScopeGate>
      <DashboardCard sx={emailCard}>
        <Typography variant="mediumLarge" fontWeight={600} sx={{ mb: 1 }}>
          Coming soon
        </Typography>
        <Typography variant="medium" sx={{ color: "rgba(255,255,255,0.65)" }}>
          Wrap-up form customization is not available in this release. Distribution settings remain under
          Distribution setup.
        </Typography>
      </DashboardCard>
      </EmailResellerScopeGate>
    </EmailSectionLayout>
  );
}
