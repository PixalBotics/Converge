import type { Meta, StoryObj } from "@storybook/react";
import Stack from "@mui/material/Stack";
import { ButtonOutline } from "@/components/common/ButtonOutline/ButtonOutline";

const meta = {
  title: "Design System/ButtonOutline",
  component: ButtonOutline,
} satisfies Meta<typeof ButtonOutline>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    text: "Enterprise",
    dotColor: "#34d399",
  },
};

export const Row: Story = {
  render: () => (
    <Stack direction="row" spacing={2} flexWrap="wrap">
      <ButtonOutline text="Starter" dotColor="#60a5fa" />
      <ButtonOutline text="Growth" dotColor="#a78bfa" />
      <ButtonOutline text="Enterprise" dotColor="#34d399" />
    </Stack>
  ),
};
