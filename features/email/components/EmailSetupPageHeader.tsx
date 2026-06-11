"use client";

import Box from "@mui/material/Box";
import { Typography } from "@/components/common";
import { useAuth } from "@/lib/auth";
import { useSmtpEmailAccess } from "../hooks/useSmtpEmailAccess";
import { EMAIL_ROUTES, EMAIL_SETUP_LABEL } from "../email.constants";
import { buildEmailTabHref } from "../email-reseller-storage";
import { useEmailResellerScope } from "../context/EmailResellerScopeContext";
import { EmailRouteSegmented } from "./EmailRouteSegmented";
import { pageHeaderRow } from "../styles/email-page.styles";

const SETUP_TABS = [
  { href: EMAIL_ROUTES.setupReseller, label: "Reseller mail", internalOnly: false },
  { href: EMAIL_ROUTES.setupPlatform, label: "Platform mail", internalOnly: true },
  { href: EMAIL_ROUTES.setupAssignment, label: "Use platform mail", internalOnly: true },
] as const;

export function EmailSetupPageHeader() {
  const { user } = useAuth();
  const { canView } = useSmtpEmailAccess();
  const { resellerId } = useEmailResellerScope();
  const isInternal = user?.userType === "Internal";

  if (!canView) return null;

  const tabs = SETUP_TABS.filter((t) => !t.internalOnly || isInternal).map((t) => ({
    href: buildEmailTabHref(t.href, resellerId),
    label: t.label,
  }));

  return (
    <Box sx={{ ...pageHeaderRow, alignItems: "center", mb: 1.5 }}>
      <Typography variant="mediumLarge" fontWeight={700} color="white" sx={{ flexShrink: 0 }}>
        {EMAIL_SETUP_LABEL}
      </Typography>
      <Box sx={{ display: "flex", justifyContent: "flex-end", ml: "auto", flex: "1 1 auto", minWidth: 0 }}>
        <EmailRouteSegmented
          tabs={tabs}
          ariaLabel="Email setup"
          sx={{ flexWrap: "wrap", justifyContent: "flex-end", maxWidth: "100%" }}
        />
      </Box>
    </Box>
  );
}
