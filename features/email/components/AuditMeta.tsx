"use client";

import { Typography } from "@/components/common";

export function AuditMeta({
  updatedBy,
  updatedAt,
  lastTestedBy,
}: {
  updatedBy?: string | null;
  updatedAt?: string | null;
  lastTestedBy?: string | null;
}) {
  if (!updatedBy && !updatedAt && !lastTestedBy) return null;

  const parts: string[] = [];
  if (updatedBy) parts.push(`Updated by ${updatedBy}`);
  if (updatedAt) parts.push(new Date(updatedAt).toLocaleString());
  if (lastTestedBy) parts.push(`Last tested by ${lastTestedBy}`);

  return (
    <Typography variant="small" sx={{ color: "rgba(255,255,255,0.55)", mt: 1 }}>
      {parts.join(" · ")}
    </Typography>
  );
}
