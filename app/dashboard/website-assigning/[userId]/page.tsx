"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

/**
 * Legacy segment: the main list previously linked here with a **website** id.
 * Keeps bookmarks working and satisfies stale Next.js generated type paths.
 */
export default function WebsiteAssigningLegacyIdRedirectPage() {
  const params = useParams<{ userId: string }>();
  const router = useRouter();
  const segment = typeof params?.userId === "string" ? params.userId : "";

  useEffect(() => {
    if (!segment.trim()) {
      router.replace("/dashboard/website-assigning");
      return;
    }
    router.replace(`/dashboard/website-assigning/website/${encodeURIComponent(segment.trim())}`);
  }, [router, segment]);

  return null;
}
