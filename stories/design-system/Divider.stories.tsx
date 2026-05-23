import type { Meta, StoryObj } from "@storybook/react";
import Stack from "@mui/material/Stack";
import { Divider } from "@/components/common/Divider/Divider";
import { Typography } from "@/components/common/Typography/Typography";

const meta = {
  title: "Design System/Divider",
  component: Divider,
} satisfies Meta<typeof Divider>;

export default meta;

type Story = StoryObj<typeof meta>;

export const BetweenSections: Story = {
  render: () => (
    <Stack spacing={0} sx={{ maxWidth: 400 }}>
      <Typography variant="body2">Section A</Typography>
      <Divider />
      <Typography variant="body2">Section B</Typography>
    </Stack>
  ),
};
