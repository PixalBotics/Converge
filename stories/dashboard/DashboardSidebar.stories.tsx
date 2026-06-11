import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import Box from "@mui/material/Box";
import DashboardSidebar from "@/components/layout/dashboard/DashboardSidebar";

const meta = {
  title: "Dashboard/Sidebar",
  component: DashboardSidebar,
} satisfies Meta<typeof DashboardSidebar>;

export default meta;

type Story = StoryObj<typeof meta>;

export const DesktopRail: Story = {
  render: () => (
    <Box sx={{ display: "flex", minHeight: 560 }}>
      <Box sx={{ width: 280, flexShrink: 0, borderRight: 1, borderColor: "divider" }}>
        <DashboardSidebar open onClose={() => {}} />
      </Box>
      <Box sx={{ flex: 1, p: 2 }} />
    </Box>
  ),
};

export const MobileDrawer: Story = {
  parameters: {
    viewport: { defaultViewport: "mobile1" },
  },
  render: function MobileDrawerPlayground() {
    const [open, setOpen] = useState(true);
    return (
      <Box>
        <DashboardSidebar open={open} onClose={() => setOpen(false)} />
      </Box>
    );
  },
};
