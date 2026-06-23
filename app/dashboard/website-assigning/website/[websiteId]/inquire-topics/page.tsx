"use client";

import { useParams } from "next/navigation";
import { WebsiteInquireTopicsWorkspace } from "@/features/website-assignments/components/WebsiteInquireTopicsWorkspace";

export default function WebsiteInquireTopicsPage() {
  const params = useParams<{ websiteId: string }>();
  const websiteId = typeof params?.websiteId === "string" ? params.websiteId : "";
  return <WebsiteInquireTopicsWorkspace websiteId={websiteId} />;
}
