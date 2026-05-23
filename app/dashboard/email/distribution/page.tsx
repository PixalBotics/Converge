"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/** Distribution email settings live under Distribution setup, not Email configuration. */
export default function EmailDistributionRedirectPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/dashboard/distribution-setup");
  }, [router]);
  return null;
}
