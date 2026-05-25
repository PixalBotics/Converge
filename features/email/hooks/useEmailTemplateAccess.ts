"use client";

import { useAuth } from "@/lib/auth";
import { OP } from "@/lib/permissions/operational-keys";

const PAGE_EMAIL_TEMPLATE = "page:email-template";

/** Page + operational checks for email template / design / forms screens. */
export function useEmailTemplateAccess() {
  const { hasOperational, hasPage, isPlatformAdmin } = useAuth();

  const canView =
    isPlatformAdmin ||
    hasOperational(OP.emailTemplate.view) ||
    hasPage(PAGE_EMAIL_TEMPLATE);

  const canUpdate =
    isPlatformAdmin ||
    hasOperational(OP.emailTemplate.update) ||
    hasOperational(OP.emailTemplate.create);

  const canPublish =
    isPlatformAdmin || hasOperational(OP.emailTemplate.publish);

  return { canView, canUpdate, canPublish };
}
