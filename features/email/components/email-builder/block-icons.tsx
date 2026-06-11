"use client";

import type { ElementType } from "react";
import ChatOutlined from "@mui/icons-material/ChatOutlined";
import ForumOutlined from "@mui/icons-material/ForumOutlined";
import InfoOutlined from "@mui/icons-material/InfoOutlined";
import NotesOutlined from "@mui/icons-material/NotesOutlined";
import PersonOutline from "@mui/icons-material/PersonOutline";
import RouteOutlined from "@mui/icons-material/RouteOutlined";
import ThumbUpOutlined from "@mui/icons-material/ThumbUpOutlined";
import TravelExploreOutlined from "@mui/icons-material/TravelExploreOutlined";
import type { EmailTemplateBlockKey } from "../../types";
import { EMAIL_TEMPLATE_BLOCK_ICON_KEYS } from "../../email.constants";

const ICON_MAP: Record<string, ElementType> = {
  person: PersonOutline,
  forum: ForumOutlined,
  travel_explore: TravelExploreOutlined,
  chat: ChatOutlined,
  route: RouteOutlined,
  info: InfoOutlined,
  notes: NotesOutlined,
  feedback: ThumbUpOutlined,
};

export function blockIconForKey(blockKey: EmailTemplateBlockKey): ElementType {
  const key = EMAIL_TEMPLATE_BLOCK_ICON_KEYS[blockKey];
  return ICON_MAP[key] ?? InfoOutlined;
}
