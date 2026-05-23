"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { DISTRIBUTION_ROUTES } from "@/features/distribution-setup/distribution.constants";

export default function LegacyEmailDistributionRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace(DISTRIBUTION_ROUTES.home);
  }, [router]);
  return null;
}
