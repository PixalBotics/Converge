import type { Meta, StoryObj } from "@storybook/react";
import Stack from "@mui/material/Stack";
import React from "react";
import Typography from "@mui/material/Typography";
import { AppCard } from "@/components/common/AppCard/AppCard";

const meta = {
  title: "Design System/AppCard",
  component: AppCard,
} satisfies Meta<typeof AppCard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: (
      <Stack spacing={1}>
        <Typography variant="h6" component="h2">
          Card title
        </Typography>
        <Typography variant="body2" color="text.secondary">
          AppCard wraps auth and onboarding surfaces with consistent padding and width.
        </Typography>
      </Stack>
    ),
  },
};

export const Narrow: Story = {
  args: {
    maxWidth: 320,
    children: (
      <Typography variant="body2" color="text.secondary">
        maxWidth set to 320px.
      </Typography>
    ),
  },
};
