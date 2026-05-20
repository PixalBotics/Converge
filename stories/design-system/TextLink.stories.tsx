import type { Meta, StoryObj } from "@storybook/react";
import { TextLink } from "@/components/common/TextLink/TextLink";

const meta = {
  title: "Design System/TextLink",
  component: TextLink,
} satisfies Meta<typeof TextLink>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    href: "#",
    children: "Forgot password?",
  },
};
