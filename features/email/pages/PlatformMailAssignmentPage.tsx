"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSmtpEmailAccess } from "../hooks/useSmtpEmailAccess";
import { useAuth } from "@/lib/auth";
import { PlatformMailAssignmentsTable } from "../components/PlatformMailAssignmentsTable";

export function PlatformMailAssignmentPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { canView } = useSmtpEmailAccess();

  useEffect(() => {
    if (user && user.userType !== "Internal") {
      router.replace("/dashboard");
    }
  }, [user, router]);

  if (!canView) return null;

  return <PlatformMailAssignmentsTable syncEditQueryParam />;
}
