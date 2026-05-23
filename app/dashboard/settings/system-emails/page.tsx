"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { EMAIL_ROUTES } from "@/features/email/email.constants";

/** Legacy redirect — system emails live under Email → Email design → Platform design. */
export default function LegacySystemEmailsRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace(EMAIL_ROUTES.designPlatform);
  }, [router]);
  return null;
}
