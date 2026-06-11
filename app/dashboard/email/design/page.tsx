"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { EMAIL_ROUTES } from "@/features/email/email.constants";
import { readEmailResellerFromStorage } from "@/features/email/email-reseller-storage";
import { EmailDesignHubPage } from "@/features/email/pages/EmailDesignHubPage";
import { useAuth } from "@/lib/auth";

export default function EmailDesignIndexPage() {
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    const stored = readEmailResellerFromStorage();
    const scopedId = user?.resellerId?.trim() || stored;
    if (scopedId && user?.userType !== "Internal") {
      router.replace(EMAIL_ROUTES.designResellerEdit(scopedId));
    }
  }, [router, user?.resellerId, user?.userType]);

  return <EmailDesignHubPage />;
}
