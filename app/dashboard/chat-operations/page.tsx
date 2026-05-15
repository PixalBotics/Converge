"use client";

import Box from "@mui/material/Box";
import { DataNotFoundPlaceholder } from "@/components/layout/dashboard";
import { Typography } from "@/components/common";
import { useAuth } from "@/lib/auth";
import { OP } from "@/lib/permissions";

export default function ChatOperationsPage() {
  const { hasPage, hasOperational, rbacEnabled } = useAuth();

  if (rbacEnabled && !hasPage("page:chat")) {
    return (
      <Box sx={{ p: 2, maxWidth: 560 }}>
        <Typography variant="body1" sx={{ color: "rgba(255,255,255,0.85)", lineHeight: 1.6 }}>
          This screen requires the{" "}
          <Box component="span" sx={{ fontWeight: 700, color: "white" }}>
            page:chat
          </Box>{" "}
          page permission (navigation and route access). Ask an administrator to assign it.
        </Typography>
      </Box>
    );
  }

  if (rbacEnabled && !hasOperational(OP.chat.access)) {
    return (
      <Box sx={{ p: 2, maxWidth: 560 }}>
        <Typography variant="body1" sx={{ color: "rgba(255,255,255,0.85)", lineHeight: 1.6 }}>
          Chat tools on this page require the{" "}
          <Box component="span" sx={{ fontWeight: 700, color: "white" }}>
            {OP.chat.access}
          </Box>{" "}
          operational permission (what you can do after you can open the page).
        </Typography>
      </Box>
    );
  }
  return <DataNotFoundPlaceholder />;
}
