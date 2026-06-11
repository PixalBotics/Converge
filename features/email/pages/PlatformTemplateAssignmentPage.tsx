"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { PlatformTemplateAssignmentsTable } from "../components/PlatformTemplateAssignmentsTable";
import { useEmailTemplateAccess } from "../hooks/useEmailTemplateAccess";

export function PlatformTemplateAssignmentPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { canView } = useEmailTemplateAccess();

  useEffect(() => {
    if (user && user.userType !== "Internal") {
      router.replace("/dashboard");
    }
  }, [user, router]);

  if (!canView) return null;

  return <PlatformTemplateAssignmentsTable />;
}
