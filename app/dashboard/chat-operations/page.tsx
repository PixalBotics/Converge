"use client";

import { useMemo, useState } from "react";
import Box from "@mui/material/Box";
import Circle from "@mui/icons-material/Circle";
import Attachment from "@mui/icons-material/Attachment";
import Send from "@mui/icons-material/Send";
import AccessTime from "@mui/icons-material/AccessTime";
import RoomOutlined from "@mui/icons-material/RoomOutlined";
import LinkOutlined from "@mui/icons-material/LinkOutlined";
import ChatBubbleOutlineOutlined from "@mui/icons-material/ChatBubbleOutlineOutlined";
import type { SxProps, Theme } from "@mui/material/styles";
import { alpha, useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { Button, DashboardCard, InputField, Typography } from "@/components/common";
import {
  chatOpsBubbleSx,
  chatOpsCenterColSx,
  chatOpsChatListSx,
  chatOpsChipButtonSx,
  chatOpsChipRowSx,
  chatOpsComposerWrapSx,
  chatOpsGridSx,
  chatOpsInfoTileSx,
  chatOpsInfoTitleRowSx,
  chatOpsLeftColSx,
  chatOpsLinkLineSx,
  chatOpsListItemSx,
  chatOpsMessagesSx,
  chatOpsPageWrapperSx,
  chatOpsRightBodySx,
  chatOpsRightColSx,
  chatOpsSectionHeaderSx,
  chatOpsShellSx,
} from "./chat-operations.styles";

const CHATS = Array.from({ length: 8 }, (_, i) => ({
  id: `chat-${i + 1}`,
  name: i === 0 ? "Maryam" : "Maryam",
  preview: "Looking for an online consultation",
  time: "2:56:40 AM",
}));

const MESSAGES = [
  { id: "m1", text: "HE Welcome to Dubai Health Experience. How may I help you today?", time: "2:56:40 AM", outgoing: true },
  { id: "m2", text: "Please note that we cannot provide online consultation. We are not a hospital / facility", time: "2:56:40 AM", outgoing: true },
  { id: "m3", text: "Make sure to confirm the contact details (Phone number & email) you got from survey form", time: "2:56:40 AM", outgoing: false },
  { id: "m4", text: "I can help you later in touch with the facility for treatment / consultation", time: "2:56:40 AM", outgoing: true },
];

export default function ChatOperationsPage() {
  const theme = useTheme() as AppTheme;
  const [activeId, setActiveId] = useState(CHATS[0]?.id ?? "");
  const [message, setMessage] = useState("");
  const activeChat = useMemo(() => CHATS.find((c) => c.id === activeId) ?? CHATS[0], [activeId]);

  return (
    <Box sx={chatOpsPageWrapperSx}>
      <DashboardCard sx={chatOpsShellSx}>
        <Box sx={chatOpsGridSx}>
          <Box sx={chatOpsLeftColSx}>
            <Box sx={chatOpsSectionHeaderSx}>
              <Typography variant="mediumLarge" color="white" fontWeight={600}>
                Active Chats
              </Typography>
            </Box>
            <Box sx={chatOpsChatListSx}>
              {CHATS.map((chat) => (
                <Box
                  key={chat.id}
                  sx={chatOpsListItemSx(chat.id === activeId)}
                  onClick={() => setActiveId(chat.id)}
                >
                  <Typography variant="medium" color="white">
                    {chat.name}
                    <Circle sx={{ fontSize: 10, ml: 0.5, color: "white" }} />
                  </Typography>
                  <Typography variant="small" sx={{ color: alpha(theme.app.text.primary, 0.85), mt: 0.35 }}>
                    {chat.preview}
                  </Typography>
                  <Typography variant="small" sx={{ color: alpha(theme.app.text.primary, 0.6), mt: 0.2 }}>
                    {chat.time}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>

          <Box sx={chatOpsCenterColSx}>
            <Box sx={chatOpsSectionHeaderSx}>
              <Typography variant="mediumLarge" color="white" fontWeight={600}>
                Francesco
              </Typography>
              <Typography variant="small" sx={{ color: theme.app.dashboard.textMuted, mt: 0.35 }}>
                {activeChat?.time}   cfxh.ah/en1/L.A   fredvog@hotmail.com
              </Typography>
            </Box>
            <Box sx={chatOpsMessagesSx}>
              {MESSAGES.map((msg) => (
                <Box key={msg.id} sx={chatOpsBubbleSx(msg.outgoing)}>
                  <Typography variant="small" color="white">
                    {msg.text}
                  </Typography>
                  <Typography variant="small" sx={{ color: alpha(theme.app.text.primary, 0.65), mt: 0.3 }}>
                    {msg.time}
                  </Typography>
                </Box>
              ))}
            </Box>
            <Box sx={chatOpsComposerWrapSx}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Box sx={{ flex: 1 }}>
                  <InputField
                    label=""
                    placeholder="Type Message here ..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    sx={{ "& .MuiFormHelperText-root": { display: "none" } }}
                  />
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", pr: 0.4 }}>
                  <Attachment sx={{ fontSize: 16, color: theme.app.dashboard.textMuted, mr: 1 }} />
                  <Send sx={{ fontSize: 16, color: "primary.main" }} />
                </Box>
              </Box>
              <Box sx={chatOpsChipRowSx}>
                <Button type="button" variant="secondary" sx={chatOpsChipButtonSx(false)}>Website Canned</Button>
                <Button type="button" variant="secondary" sx={chatOpsChipButtonSx(true)}>Personal Canned</Button>
                <Button type="button" variant="secondary" sx={chatOpsChipButtonSx(false)}>Push Canned</Button>
              </Box>
              <InputField
                label=""
                placeholder="Search Canned Messages..."
                value=""
                onChange={() => {}}
                sx={{ "& .MuiFormHelperText-root": { display: "none" } }}
              />
            </Box>
          </Box>

          <Box sx={chatOpsRightColSx}>
            <Box sx={chatOpsSectionHeaderSx}>
              <Typography variant="mediumLarge" color="white" fontWeight={600}>
                Visitor Information
              </Typography>
            </Box>
            <Box sx={chatOpsRightBodySx}>
              <Box sx={chatOpsInfoTileSx("default")}>
                <Box sx={chatOpsInfoTitleRowSx}>
                  <ChatBubbleOutlineOutlined sx={{ fontSize: 18, width: 18, height: 18, color: theme.app.dashboard.textMuted }} />
                  <Typography variant="small" sx={{ color: theme.app.dashboard.textMuted, fontSize: "0.95rem", lineHeight: 1.2 }}>25</Typography>
                </Box>
                <Typography variant="small" color="white" sx={{ mt: 0.35, fontSize: "1.08rem", lineHeight: 1.2 }}>Previous chat</Typography>
              </Box>
              <Box sx={chatOpsInfoTileSx("mint")}>
                <Box sx={chatOpsInfoTitleRowSx}>
                  <AccessTime sx={{ fontSize: 18, width: 18, height: 18, color: theme.app.text.primary }} />
                  <Typography variant="small" sx={{ color: theme.app.text.primary, fontSize: "1.02rem", lineHeight: 1.2 }}>12:21</Typography>
                </Box>
                <Typography variant="small" sx={{ color: alpha(theme.app.text.primary, 0.88), mt: 0.35, fontSize: "1.08rem", lineHeight: 1.2 }}>Chat Duration</Typography>
              </Box>
              <Box sx={chatOpsInfoTileSx("cream")}>
                <Box sx={chatOpsInfoTitleRowSx}>
                  <AccessTime sx={{ fontSize: 18, width: 18, height: 18, color: theme.app.text.primary }} />
                  <Typography variant="small" sx={{ color: theme.app.text.primary, fontSize: "1.02rem", lineHeight: 1.2 }}>13:22</Typography>
                </Box>
                <Typography variant="small" sx={{ color: alpha(theme.app.text.primary, 0.88), mt: 0.35, fontSize: "1.08rem", lineHeight: 1.2 }}>Local Time</Typography>
              </Box>
              <Box sx={chatOpsInfoTileSx("rose")}>
                <Box sx={chatOpsInfoTitleRowSx}>
                  <RoomOutlined sx={{ fontSize: 18, width: 18, height: 18, color: theme.app.text.primary }} />
                  <Typography variant="small" sx={{ color: theme.app.text.primary, fontSize: "1.02rem", lineHeight: 1.2 }}>Ajman</Typography>
                </Box>
                <Typography variant="small" sx={{ color: alpha(theme.app.text.primary, 0.88), mt: 0.35, fontSize: "1.08rem", lineHeight: 1.2 }}>United Location</Typography>
              </Box>
              <Box sx={{ p: 1.35 }}>
                <Typography variant="small" sx={chatOpsLinkLineSx}><LinkOutlined sx={{ fontSize: 15, width: 15, height: 15 }} /> https://www.google.com</Typography>
                <Typography variant="small" sx={chatOpsLinkLineSx}><LinkOutlined sx={{ fontSize: 15, width: 15, height: 15 }} /> https://www.dxh.ae</Typography>
                <Typography variant="small" sx={{ color: theme.app.dashboard.textMuted }}><AccessTime sx={{ fontSize: 14, width: 14, height: 14, mr: 0.3 }} /> 11/18/2019 - 1:05:37PM</Typography>
                <Typography variant="small" sx={{ color: theme.app.dashboard.textMuted }}><AccessTime sx={{ fontSize: 14, width: 14, height: 14, mr: 0.3 }} /> 11/18/2019 - 1:05:37PM</Typography>
              </Box>
              <Box sx={chatOpsInfoTileSx("blue")}>
                <Typography variant="medium" color="white" fontWeight={600}>Click Path</Typography>
                <Typography variant="small" color="white">- 105   1m 7s   https://www.dxh.ae</Typography>
                <Typography variant="small" color="white">- 105   1m 7s   https://www.dxh.ae/en-US</Typography>
                <Typography variant="small" color="white">- 105   1m 7s   https://www.dxh.ae/en-US</Typography>
              </Box>
            </Box>
          </Box>
        </Box>
      </DashboardCard>
    </Box>
  );
}
