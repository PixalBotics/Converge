import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import Box from "@mui/material/Box";
import { Typography } from "@/components/common/Typography/Typography";
import { DashboardHeader } from "@/components/layout/dashboard";

const meta = {
  title: "Dashboard/Header",
  component: DashboardHeader,
} satisfies Meta<typeof DashboardHeader>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Box sx={{ maxWidth: 1200, mx: "auto" }}>
      <DashboardHeader />
    </Box>
  ),
};

export const WithMenuHandler: Story = {
  render: function WithMenuHandlerDemo() {
    const [, setClicks] = useState(0);
    return (
      <Box sx={{ maxWidth: 1200, mx: "auto" }}>
        <DashboardHeader onMenuClick={() => setClicks((c) => c + 1)} />
        <Typography variant="caption" sx={{ mt: 1, display: "block", color: "text.secondary" }}>
          Mobile menu control is wired; open the canvas in a narrow viewport to use it.
        </Typography>
      </Box>
    );
  },
};
