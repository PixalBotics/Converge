"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { LoadingScreen } from "@/components/common";
import { EMAIL_ROUTES, resellerOwnMailEditPath } from "@/features/email/email.constants";
import { readEmailResellerFromStorage } from "@/features/email/email-reseller-storage";
import { useAuth } from "@/lib/auth";

export default function EmailSetupIndexPage() {
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    const stored = readEmailResellerFromStorage();
    const scopedId = user?.resellerId?.trim() || stored;
    router.replace(scopedId ? resellerOwnMailEditPath(scopedId) : EMAIL_ROUTES.setupReseller);
  }, [router, user?.resellerId]);

  return <LoadingScreen message="Loading email setup…" />;
}
