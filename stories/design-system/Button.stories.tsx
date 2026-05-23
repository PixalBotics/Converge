import type { Meta, StoryObj } from "@storybook/react";
import Add from "@mui/icons-material/Add";
import { Button } from "@/components/common/Button/Button";
import { gradientPrimaryButtonSx } from "@/components/common/Button/Button.styles";

const meta = {
  title: "Design System/Button",
  component: Button,
  args: {
    children: "Save changes",
    type: "button" as const,
  },
} satisfies Meta<typeof Button>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Primary: Story = { args: { variant: "primary" } };

export const PrimaryCompact: Story = { args: { variant: "primary", size: "compact" } };

export const Secondary: Story = { args: { variant: "secondary" } };

export const Outlined: Story = { args: { variant: "outlined" } };

export const PrimaryWithIcon: Story = {
  args: {
    variant: "primary",
    startIcon: <Add sx={{ fontSize: 20 }} />,
    children: "Add item",
  },
};

export const GradientAccent: Story = {
  args: {
    variant: "primary",
    sx: gradientPrimaryButtonSx,
    startIcon: <Add sx={{ fontSize: 20 }} />,
    children: "Primary CTA",
  },
};
