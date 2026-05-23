"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { OP } from "@/lib/permissions/operational-keys";
import { PlatformTemplateAssignmentsTable } from "../components/PlatformTemplateAssignmentsTable";

export function PlatformTemplateAssignmentPage() {
  const router = useRouter();
  const { hasOperational, user } = useAuth();
  const canView = hasOperational(OP.emailTemplate.view);

  useEffect(() => {
    if (user && user.userType !== "Internal") {
      router.replace("/dashboard");
    }
  }, [user, router]);

  if (!canView) return null;

  return <PlatformTemplateAssignmentsTable />;
}
