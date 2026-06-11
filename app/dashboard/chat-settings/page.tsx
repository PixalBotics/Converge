"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ChatSettingsRedirectPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/dashboard/chat-settings/close-policy", { scroll: false });
  }, [router]);
  return null;
}
