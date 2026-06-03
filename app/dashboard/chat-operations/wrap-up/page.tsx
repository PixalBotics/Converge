"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Typography } from "@/components/common";
import Box from "@mui/material/Box";
import { pageWrapper } from "@/app/dashboard/dashboard.styles";

/** Legacy route — always opens the email distribution form. */
export default function ChatOperationsWrapUpRoute() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const conversationId = searchParams.get("conversationId")?.trim() ?? "";

  useEffect(() => {
    if (!conversationId) {
      router.replace("/dashboard/chat-operations");
      return;
    }
    router.replace(
      `/dashboard/chat-operations/distribution?conversationId=${encodeURIComponent(conversationId)}`,
    );
  }, [conversationId, router]);

  return (
    <Box sx={pageWrapper}>
      <Typography sx={{ color: (t) => t.app.dashboard.textMuted }}>
        Redirecting to distribution form…
      </Typography>
    </Box>
  );
}
