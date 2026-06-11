"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { LoadingScreen } from "@/components/common";
import { EMAIL_ROUTES } from "@/features/email/email.constants";

/** Legacy path — redirect under setup layout. */
export default function LegacyConnectionAssignmentRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const qs = searchParams.toString();
    router.replace(qs ? `${EMAIL_ROUTES.setupAssignment}?${qs}` : EMAIL_ROUTES.setupAssignment);
  }, [router, searchParams]);

  return <LoadingScreen message="Opening platform mail assignments…" />;
}
