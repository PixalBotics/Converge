"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ChatBubbleOutline from "@mui/icons-material/ChatBubbleOutline";
import MessageOutlined from "@mui/icons-material/MessageOutlined";
import RadioButtonChecked from "@mui/icons-material/RadioButtonChecked";
import RadioButtonUnchecked from "@mui/icons-material/RadioButtonUnchecked";
import Box from "@mui/material/Box";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { Button, Typography } from "@/components/common";
import { gradientPrimaryButtonSx } from "@/components/common/Button/Button.styles";
import { WidgetFlowShell } from "@/components/dashboard/WidgetFlowShell";

type WidgetType = "chat" | "text";

export default function WidgetTypeSelectionPage() {
  const router = useRouter();
  const theme = useTheme() as AppTheme;
  const [selectedType, setSelectedType] = useState<WidgetType>("chat");

  return (
    <WidgetFlowShell
      pageTitle="Widget Type Selection"
      subtitle="Connect your Meta Business assets to streamline your workflow and data sync."
      cardTitle="Widget Type Selection"
      footer={
        <>
          <Button type="button" variant="secondary" onClick={() => router.push("/dashboard/chat-widget")}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="primary"
            sx={gradientPrimaryButtonSx}
            onClick={() =>
              router.push(selectedType === "chat" ? "/dashboard/chat-widget/add/chat/button" : "/dashboard/chat-widget/add/text")
            }
          >
            Next
          </Button>
        </>
      }
    >
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 1.25 }}>
        {[
          { id: "chat" as const, title: "Chat Widget", icon: <ChatBubbleOutline sx={{ fontSize: 18 }} />, iconColor: "#7DD3FC" },
          { id: "text" as const, title: "Text Us Widget", icon: <MessageOutlined sx={{ fontSize: 18 }} />, iconColor: "#FDBA74" },
        ].map((item) => {
          const active = selectedType === item.id;
          return (
            <Box
              key={item.id}
              onClick={() => setSelectedType(item.id)}
              sx={{
                borderRadius: 2,
                border: `1px solid ${active ? theme.app.dashboard.accentBlue : theme.app.dashboard.cardBorder}`,
                p: 2.25,
                cursor: "pointer",
                background: theme.app.dashboard.overlayLight,
              }}
            >
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.5 }}>
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    bgcolor: item.iconColor,
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#0B1024",
                  }}
                >
                  {item.icon}
                </Box>
                {active ? (
                  <RadioButtonChecked sx={{ color: theme.app.dashboard.accentBlue, fontSize: 20 }} />
                ) : (
                  <RadioButtonUnchecked sx={{ color: theme.app.dashboard.textMuted, fontSize: 20 }} />
                )}
              </Box>
              <Typography variant="mediumLarge" color="white" sx={{ mb: 0.25 }}>
                {item.title}
              </Typography>
              <Typography variant="body2" sx={{ color: theme.app.dashboard.textMuted }}>
                ? Your Tagline Goes Here
              </Typography>
            </Box>
          );
        })}
      </Box>
    </WidgetFlowShell>
  );
}
