import type { Meta, StoryObj } from "@storybook/react";
import Box from "@mui/material/Box";
import { HoverTooltip } from "@/components/common/HoverTooltip/HoverTooltip";

const meta = {
  title: "Design System/HoverTooltip",
  component: HoverTooltip,
} satisfies Meta<typeof HoverTooltip>;

export default meta;

type Story = StoryObj<typeof meta>;

export const OnChip: Story = {
  render: () => (
    <HoverTooltip label="Saved accent · Nitro mint">
      <Box
        sx={{
          width: 120,
          height: 40,
          borderRadius: 2,
          bgcolor: "rgba(52, 211, 153, 0.35)",
          border: "1px solid rgba(255,255,255,0.2)",
        }}
      />
    </HoverTooltip>
  ),
};
