"use client";

import { useParams } from "next/navigation";
import { WebsiteServiceSchedulingWorkspace } from "@/features/website-assignments/components/WebsiteServiceSchedulingWorkspace";

export default function WebsiteServiceSchedulingPage() {
  const params = useParams<{ websiteId: string }>();
  const websiteId = typeof params?.websiteId === "string" ? params.websiteId : "";
  return <WebsiteServiceSchedulingWorkspace websiteId={websiteId} />;
}
