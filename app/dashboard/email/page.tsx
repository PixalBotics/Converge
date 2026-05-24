"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { LoadingScreen } from "@/components/common";
import { useAuth } from "@/lib/auth";
import { OP } from "@/lib/permissions/operational-keys";
import { EMAIL_ROUTES } from "@/features/email/email.constants";
import { useEmailTemplateAccess } from "@/features/email/hooks/useEmailTemplateAccess";

/** Email hub landing — first sidebar section the user can access. */
export default function EmailHubHomePage() {
  const router = useRouter();
  const { hasOperational, user } = useAuth();
  const { canView: canViewDesign } = useEmailTemplateAccess();
  const isInternal = user?.userType === "Internal";

  useEffect(() => {
    if (hasOperational(OP.smtpEmail.view)) {
      router.replace(EMAIL_ROUTES.setupReseller);
      return;
    }
    if (canViewDesign) {
      router.replace(EMAIL_ROUTES.design);
      return;
    }
    if (isInternal) {
      router.replace(EMAIL_ROUTES.setupPlatform);
      return;
    }
    router.replace(EMAIL_ROUTES.setupReseller);
  }, [router, hasOperational, canViewDesign, isInternal]);

  return <LoadingScreen message="Opening email configuration…" />;
}
