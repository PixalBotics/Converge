"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { LoadingScreen } from "@/components/common";
import { useAuth } from "@/lib/auth";
import { EMAIL_ROUTES, resellerOwnMailEditPath } from "@/features/email/email.constants";
import { buildEmailTabHref, readEmailResellerFromStorage } from "@/features/email/email-reseller-storage";
import { OP } from "@/lib/permissions/operational-keys";

export default function EmailIndexPage() {
  const router = useRouter();
  const { hasOperational, user } = useAuth();

  useEffect(() => {
    const storedResellerId = readEmailResellerFromStorage();
    const scopedId = user?.resellerId?.trim() || storedResellerId;
    if (hasOperational(OP.smtpEmail.view)) {
      router.replace(
        scopedId ? resellerOwnMailEditPath(scopedId) : EMAIL_ROUTES.resellerMail,
      );
      return;
    }
    if (hasOperational(OP.emailTemplate.view)) {
      router.replace(buildEmailTabHref(EMAIL_ROUTES.design, scopedId));
      return;
    }
    router.replace(EMAIL_ROUTES.resellerMail);
  }, [hasOperational, router, user?.resellerId]);

  return <LoadingScreen message="Loading email settings…" />;
}
