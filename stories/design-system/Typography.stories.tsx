import type { Meta, StoryObj } from "@storybook/react";
import Stack from "@mui/material/Stack";
import { Typography } from "@/components/common/Typography/Typography";

const meta = {
  title: "Design System/Typography",
  component: Typography,
} satisfies Meta<typeof Typography>;

export default meta;

type Story = StoryObj<typeof meta>;

export const CustomVariants: Story = {
  render: () => (
    <Stack spacing={2} sx={{ maxWidth: 520 }}>
      <Typography variant="mediumLarge" fontWeight={600}>
        mediumLarge — section title
      </Typography>
      <Typography variant="body1">body1 — default MUI paragraph</Typography>
      <Typography variant="small" sx={{ color: "text.secondary" }}>
        small — supporting copy
      </Typography>
      <Typography variant="caption" sx={{ color: "text.secondary" }}>
        caption — table meta
      </Typography>
    </Stack>
  ),
};
