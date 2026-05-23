import type { Meta, StoryObj } from "@storybook/react";
import Box from "@mui/material/Box";
import { Typography } from "@/components/common/Typography/Typography";
import { OperationalViewGate } from "@/components/layout/dashboard/OperationalViewGate";

const meta = {
  title: "Dashboard/OperationalViewGate",
  component: OperationalViewGate,
} satisfies Meta<typeof OperationalViewGate>;

export default meta;

type Story = StoryObj<typeof meta>;

export const AllowedChildren: Story = {
  args: {
    pathname: "/dashboard/hrms",
    children: (
      <Box sx={{ p: 2, borderRadius: 2, border: "1px dashed", borderColor: "divider" }}>
        <Typography variant="body2">Protected content renders when RBAC allows this path.</Typography>
      </Box>
    ),
  },
};
