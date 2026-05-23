"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { EMAIL_ROUTES } from "@/features/email/email.constants";

export default function LegacyEmailConnectionRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace(EMAIL_ROUTES.setup);
  }, [router]);
  return null;
}
