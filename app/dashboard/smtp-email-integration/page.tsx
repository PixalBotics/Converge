"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { LoadingScreen } from "@/components/common";
import { EMAIL_ROUTES } from "@/features/email/email.constants";

/** Legacy path — redirects to the Email module. */
export default function LegacySmtpEmailRedirectPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace(EMAIL_ROUTES.setupReseller);
  }, [router]);
  return <LoadingScreen message="Opening email settings…" />;
}
