"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { LoadingScreen } from "@/components/common";
import { EMAIL_ROUTES } from "@/features/email/email.constants";

/** Legacy path — keep query params (e.g. ?edit=) and land under setup layout. */
export default function LegacyConnectionResellerRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const qs = searchParams.toString();
    router.replace(qs ? `${EMAIL_ROUTES.setupReseller}?${qs}` : EMAIL_ROUTES.setupReseller);
  }, [router, searchParams]);

  return <LoadingScreen message="Opening reseller mail…" />;
}
