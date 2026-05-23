import type { Meta, StoryObj } from "@storybook/react";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import {
  AddCircleIcon,
  BellIcon,
  ChatsByDepartmentIcon,
  DollarBadgeIcon,
  HeaderSettingsIcon,
  SearchIcon,
  SidebarReactIcon,
} from "@/components/common/icons";

const meta = {
  title: "Design System/App icons",
} satisfies Meta;

export default meta;

export const HeaderChrome: StoryObj = {
  render: () => (
    <Stack direction="row" spacing={3} alignItems="center" flexWrap="wrap" useFlexGap>
      <SearchIcon />
      <BellIcon />
      <HeaderSettingsIcon />
      <AddCircleIcon />
    </Stack>
  ),
};

export const SidebarKeys: StoryObj = {
  render: () => (
    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
      {(
        [
          "dashboard",
          "users",
          "reports",
          "chat",
          "billing",
          "settings",
        ] as const
      ).map((key) => (
        <Box key={key} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <SidebarReactIcon iconKey={key} />
        </Box>
      ))}
    </Box>
  ),
};

export const KpiGlyph: StoryObj = {
  render: () => (
    <Stack direction="row" spacing={2} alignItems="center">
      <ChatsByDepartmentIcon />
      <DollarBadgeIcon />
    </Stack>
  ),
};
