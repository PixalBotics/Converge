"use client";

import { use, useEffect } from "react";
import { useRouter } from "next/navigation";

/** Legacy deep link → unified settings page with ?website= query. */
export default function ChatSettingsWebsiteRedirectPage({
  params,
}: {
  params: Promise<{ websiteId: string }>;
}) {
  const { websiteId } = use(params);
  const router = useRouter();

  useEffect(() => {
    router.replace(
      `/dashboard/chat-settings/close-policy?website=${encodeURIComponent(websiteId)}`,
      { scroll: false },
    );
  }, [router, websiteId]);

  return null;
}
