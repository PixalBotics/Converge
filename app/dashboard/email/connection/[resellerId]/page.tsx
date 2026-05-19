"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { LoadingScreen } from "@/components/common";
import { resellerOwnMailEditPath } from "@/features/email/email.constants";

export default function ResellerMailDeepLinkPage() {
  const params = useParams();
  const router = useRouter();
  const raw = params?.resellerId;
  const resellerId = typeof raw === "string" ? raw : Array.isArray(raw) ? raw[0] : "";

  useEffect(() => {
    if (resellerId?.trim()) {
      router.replace(resellerOwnMailEditPath(resellerId.trim()));
    }
  }, [resellerId, router]);

  return <LoadingScreen message="Opening reseller mail…" />;
}
