"use client";

import type { ReactElement } from "react";
import AutoAwesomeRounded from "@mui/icons-material/AutoAwesomeRounded";
import CallSplitRounded from "@mui/icons-material/CallSplitRounded";
import ChatBubbleOutlineRounded from "@mui/icons-material/ChatBubbleOutlineRounded";
import FilterAltRounded from "@mui/icons-material/FilterAltRounded";
import MenuBookRounded from "@mui/icons-material/MenuBookRounded";
import ReplyRounded from "@mui/icons-material/ReplyRounded";
import SearchRounded from "@mui/icons-material/SearchRounded";
import SendRounded from "@mui/icons-material/SendRounded";
import SupportAgentRounded from "@mui/icons-material/SupportAgentRounded";
import WavingHandRounded from "@mui/icons-material/WavingHandRounded";
import WarningAmberRounded from "@mui/icons-material/WarningAmberRounded";
import type { FlowBuilderNodeType } from "./ai-flow-builder.types";

const ICONS: Record<string, ReactElement> = {
  chat: <ChatBubbleOutlineRounded sx={{ fontSize: 18 }} />,
  route: <CallSplitRounded sx={{ fontSize: 18 }} />,
  wave: <WavingHandRounded sx={{ fontSize: 18 }} />,
  filter: <FilterAltRounded sx={{ fontSize: 18 }} />,
  search: <SearchRounded sx={{ fontSize: 18 }} />,
  spark: <AutoAwesomeRounded sx={{ fontSize: 18 }} />,
  warning: <WarningAmberRounded sx={{ fontSize: 18 }} />,
  agent: <SupportAgentRounded sx={{ fontSize: 18 }} />,
  send: <SendRounded sx={{ fontSize: 18 }} />,
  reply: <ReplyRounded sx={{ fontSize: 18 }} />,
};

export function flowNodeIcon(iconKey: string, type?: FlowBuilderNodeType): ReactElement {
  if (type === "bot_reply" && !ICONS[iconKey]) {
    return ICONS.reply;
  }
  return ICONS[iconKey] ?? ICONS.chat;
}
