"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { LoadingScreen } from "@/components/common";
import { EMAIL_BASE_PATH } from "@/features/email/email.constants";

/** Alias: `/dashboard/settings/email` → email module hub. */
export default function SettingsEmailRedirectPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace(EMAIL_BASE_PATH);
  }, [router]);
  return <LoadingScreen message="Opening email settings…" />;
}
