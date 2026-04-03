"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { LoadingScreen } from "@/components/common";
import { useAuth } from "@/lib/auth";

export default function AdminOnly({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    if (user?.role !== "admin") {
      router.replace("/dashboard");
    }
  }, [isLoading, user?.role, router]);

  if (isLoading) {
    return <LoadingScreen message="Loading..." />;
  }

  if (user?.role !== "admin") {
    return <LoadingScreen message="Redirecting..." />;
  }

  return <>{children}</>;
}
