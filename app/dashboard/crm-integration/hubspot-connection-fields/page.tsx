"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { CRM_ROUTES } from "@/features/crm-integration";

/** Legacy route — redirects to the unified connection step. */
export default function HubSpotConnectionFieldsRedirectPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace(CRM_ROUTES.connection);
  }, [router]);
  return null;
}
