"use client";

import Box from "@mui/material/Box";
import { usePathname } from "next/navigation";
import { Typography } from "@/components/common";
import { useAuth } from "@/lib/auth";
import { EMAIL_ROUTES } from "../email.constants";
import { useEmailTemplateAccess } from "../hooks/useEmailTemplateAccess";
import { useSmtpEmailAccess } from "../hooks/useSmtpEmailAccess";
import { buildEmailTabHref } from "../email-reseller-storage";
import { useEmailResellerScope } from "../context/EmailResellerScopeContext";
import { EmailRouteSegmented } from "./EmailRouteSegmented";
import { pageHeaderRow } from "../styles/email-page.styles";

const CONNECTION_TABS = [
  { href: EMAIL_ROUTES.setupReseller, label: "Reseller mail", internalOnly: false },
  { href: EMAIL_ROUTES.setupPlatform, label: "Platform mail", internalOnly: true },
  { href: EMAIL_ROUTES.setupAssignment, label: "Use platform mail", internalOnly: true },
] as const;

function resolvePageTitle(pathname: string): string {
  if (pathname === EMAIL_ROUTES.design || pathname.startsWith(`${EMAIL_ROUTES.design}/`)) {
    return "Email design";
  }
  return "SMTP & mail";
}

/** Page title (left) + route tabs (right) for all `/dashboard/email/*` pages. */
export function EmailPageHeader() {
  const pathname = usePathname();
  const { user } = useAuth();
  const { resellerId } = useEmailResellerScope();
  const isInternal = user?.userType === "Internal";

  const { canView: canViewDesign } = useEmailTemplateAccess();
  const { canView: canViewMail } = useSmtpEmailAccess();

  const connectionTabs = CONNECTION_TABS.filter((t) => !t.internalOnly || isInternal).map((t) => ({
    href: t.href,
    label: t.label,
  }));

  const navTabs = [
    ...(canViewMail ? connectionTabs : []),
    ...(canViewDesign
      ? [{ href: buildEmailTabHref(EMAIL_ROUTES.design, resellerId), label: "Email design" }]
      : []),
  ];

  if (navTabs.length === 0) return null;

  return (
    <Box sx={{ ...pageHeaderRow, alignItems: "center", mb: 1.5 }}>
      <Typography variant="regularLarge" fontWeight={700} color="white" sx={{ flexShrink: 0 }}>
        {resolvePageTitle(pathname)}
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
          tabs={navTabs}
          ariaLabel="Email sections"
          sx={{ flexWrap: "wrap", justifyContent: "flex-end", maxWidth: "100%" }}
        />
      </Box>
    </Box>
  );
}
