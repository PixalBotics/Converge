"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { CRM_ROUTES } from "@/features/crm-integration";

/** Legacy CRM Integrator page — redirects to the unified wizard. */
export default function CrmIntegratorRedirectPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace(CRM_ROUTES.home);
  }, [router]);
  return null;
}
