"use client";

import { useAuth } from "@/lib/auth";
import { OP } from "@/lib/permissions/operational-keys";

const PAGE_SMTP_EMAIL = "page:smtp-email";

/** Page + operational checks for SMTP / reseller mail screens (aligned with backend implications). */
export function useSmtpEmailAccess() {
  const { hasOperational, hasPage, isPlatformAdmin } = useAuth();

  const canView =
    isPlatformAdmin ||
    hasOperational(OP.smtpEmail.view) ||
    hasPage(PAGE_SMTP_EMAIL);

  const canUpdate =
    isPlatformAdmin ||
    hasOperational(OP.smtpEmail.update) ||
    hasOperational(OP.smtpEmail.create);

  const canDelete =
    isPlatformAdmin || hasOperational(OP.smtpEmail.delete);

  const canTest =
    isPlatformAdmin || hasOperational(OP.smtpEmail.test);

  return { canView, canUpdate, canDelete, canTest };
}
