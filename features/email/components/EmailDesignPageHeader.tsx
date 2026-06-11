"use client";

import Box from "@mui/material/Box";
import { Typography } from "@/components/common";
import { useAuth } from "@/lib/auth";
import { EMAIL_ROUTES } from "../email.constants";
import { useEmailTemplateAccess } from "../hooks/useEmailTemplateAccess";
import { buildEmailTabHref } from "../email-reseller-storage";
import { useEmailResellerScope } from "../context/EmailResellerScopeContext";
import { EmailRouteSegmented } from "./EmailRouteSegmented";
import { pageHeaderRow } from "../styles/email-page.styles";

const DESIGN_TABS = [
  { href: EMAIL_ROUTES.designReseller, label: "Reseller designs", internalOnly: false },
  { href: EMAIL_ROUTES.designPlatform, label: "Platform design", internalOnly: true },
] as const;

export function EmailDesignPageHeader() {
  const { user } = useAuth();
  const { canView } = useEmailTemplateAccess();
  const { resellerId } = useEmailResellerScope();
  const isInternal = user?.userType === "Internal";

  if (!canView) return null;

  const tabs = DESIGN_TABS.filter((t) => !t.internalOnly || isInternal).map((t) => ({
    href: buildEmailTabHref(t.href, resellerId),
    label: t.label,
  }));

  return (
    <Box sx={{ ...pageHeaderRow, alignItems: "center", mb: 1.5 }}>
      <Typography variant="mediumLarge" fontWeight={700} color="white" sx={{ flexShrink: 0 }}>
        Email design
      </Typography>
      <Box sx={{ display: "flex", justifyContent: "flex-end", ml: "auto", flex: "1 1 auto", minWidth: 0 }}>
        <EmailRouteSegmented
          tabs={tabs}
          ariaLabel="Email design"
          sx={{ flexWrap: "wrap", justifyContent: "flex-end", maxWidth: "100%" }}
        />
      </Box>
    </Box>
  );
}
