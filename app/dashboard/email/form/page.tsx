"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { EMAIL_ROUTES } from "@/features/email/email.constants";

export default function LegacyEmailFormRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace(EMAIL_ROUTES.forms);
  }, [router]);
  return null;
}
