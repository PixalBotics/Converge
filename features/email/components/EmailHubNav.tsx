"use client";

import Box from "@mui/material/Box";
import { Typography } from "@/components/common";
import { useAuth } from "@/lib/auth";
import { OP } from "@/lib/permissions/operational-keys";
import { EMAIL_BASE_PATH, EMAIL_HUB_LABEL, EMAIL_ROUTES } from "../email.constants";
import { EmailRouteSegmented } from "./EmailRouteSegmented";
import { pageHeaderRow } from "../styles/email-page.styles";

type HubTab = {
  href: string;
  label: string;
  show: boolean;
  isActive?: (pathname: string) => boolean;
};

/**
 * Email area only: SMTP setup, transcript design, website forms.
 * Distribution lives under `/dashboard/distribution-setup` (separate sidebar).
 */
export function EmailHubNav() {
  const { hasOperational } = useAuth();

  const tabs: HubTab[] = [
    {
      href: EMAIL_ROUTES.setupReseller,
      label: "SMTP & mail",
      show: hasOperational(OP.smtpEmail.view),
      isActive: (p: string) =>
        p.startsWith(`${EMAIL_ROUTES.setup}/`) ||
        p.startsWith(`${EMAIL_BASE_PATH}/connection/`),
    },
    {
      href: EMAIL_ROUTES.design,
      label: "Email design",
      show: hasOperational(OP.emailTemplate.view),
      isActive: (p: string) =>
        p.startsWith(`${EMAIL_ROUTES.design}/`) || p === EMAIL_ROUTES.design,
    },
    {
      href: EMAIL_ROUTES.forms,
      label: "Email forms",
      show: hasOperational(OP.emailTemplate.view),
      isActive: (p: string) =>
        p.startsWith(`${EMAIL_ROUTES.forms}/`) || p === EMAIL_ROUTES.forms,
    },
  ].filter((t) => t.show);

  if (tabs.length === 0) return null;

  return (
    <Box sx={{ ...pageHeaderRow, alignItems: "center", mb: 2 }}>
      <Typography variant="regularLarge" fontWeight={700} color="white" sx={{ flexShrink: 0 }}>
        {EMAIL_HUB_LABEL}
      </Typography>
      <Box
        sx={{
          display: "flex",
          justifyContent: "flex-end",
          ml: "auto",
          flex: "1 1 auto",
          minWidth: 0,
        }}
      >
        <EmailRouteSegmented
          tabs={tabs}
          ariaLabel="Email sections"
          sx={{ flexWrap: "wrap", justifyContent: "flex-end", maxWidth: "100%" }}
        />
      </Box>
    </Box>
  );
}
