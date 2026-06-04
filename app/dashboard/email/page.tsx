"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { LoadingScreen } from "@/components/common";
import { useAuth } from "@/lib/auth";
import { EMAIL_ROUTES } from "@/features/email/email.constants";
import { useEmailTemplateAccess } from "@/features/email/hooks/useEmailTemplateAccess";
import { useSmtpEmailAccess } from "@/features/email/hooks/useSmtpEmailAccess";

/** Email hub landing — first sidebar section the user can access. */
export default function EmailHubHomePage() {
  const router = useRouter();
  const { user } = useAuth();
  const { canView: canViewSmtp } = useSmtpEmailAccess();
  const { canView: canViewDesign } = useEmailTemplateAccess();
  const isInternal = user?.userType === "Internal";
  const scopedResellerId = user?.resellerId?.trim();

  useEffect(() => {
    if (canViewSmtp) {
      router.replace(EMAIL_ROUTES.setupReseller);
      return;
    }
    if (canViewDesign) {
      if (scopedResellerId && !isInternal) {
        router.replace(EMAIL_ROUTES.designResellerEdit(scopedResellerId));
        return;
      }
      router.replace(EMAIL_ROUTES.design);
      return;
    }
    if (isInternal) {
      router.replace(EMAIL_ROUTES.setupPlatform);
      return;
    }
    router.replace(EMAIL_ROUTES.setupReseller);
  }, [router, canViewSmtp, canViewDesign, isInternal, scopedResellerId]);

  return <LoadingScreen message="Opening email configuration…" />;
}
