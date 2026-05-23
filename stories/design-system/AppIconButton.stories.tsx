import type { Meta, StoryObj } from "@storybook/react";
import MoreHoriz from "@mui/icons-material/MoreHoriz";
import NotificationsNone from "@mui/icons-material/NotificationsNone";
import SettingsOutlined from "@mui/icons-material/SettingsOutlined";
import Box from "@mui/material/Box";
import { AppIconButton } from "@/components/common/AppIconButton/AppIconButton";
import { Typography } from "@/components/common/Typography/Typography";

const meta = {
  title: "Design System/AppIconButton",
  component: AppIconButton,
} satisfies Meta<typeof AppIconButton>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    "aria-label": "More options",
    children: <MoreHoriz sx={{ fontSize: 18 }} />,
    type: "button",
    tone: "default",
  },
};

export const MutedTone: Story = {
  args: {
    ...Default.args,
    tone: "muted",
  },
};

export const ToolbarStrip: Story = {
  render: () => (
    <Box sx={{ display: "inline-flex", alignItems: "center", gap: 1 }}>
      <AppIconButton aria-label="Notifications" tone="muted" type="button">
        <NotificationsNone sx={{ fontSize: 18 }} />
      </AppIconButton>
      <AppIconButton aria-label="Settings" tone="muted" type="button">
        <SettingsOutlined sx={{ fontSize: 18 }} />
      </AppIconButton>
      <AppIconButton aria-label="More" tone="muted" type="button">
        <MoreHoriz sx={{ fontSize: 18 }} />
      </AppIconButton>
    </Box>
  ),
};
