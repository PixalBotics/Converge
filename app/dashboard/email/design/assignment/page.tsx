"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { LoadingScreen } from "@/components/common";
import { EMAIL_ROUTES } from "@/features/email/email.constants";

/** Legacy route — resellers default to platform design; no separate assignment screen. */
export default function EmailDesignAssignmentRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace(EMAIL_ROUTES.designReseller);
  }, [router]);

  return <LoadingScreen message="Redirecting…" />;
}
