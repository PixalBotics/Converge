import type { Meta, StoryObj } from "@storybook/react";
import Stack from "@mui/material/Stack";
import { Label } from "@/components/common/Label/Label";

const meta = {
  title: "Design System/Label",
  component: Label,
} satisfies Meta<typeof Label>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Variants: Story = {
  render: () => (
    <Stack spacing={2}>
      <Label htmlFor="f1" variant="mediumSmall">
        Medium small label
      </Label>
      <Label htmlFor="f2" variant="mediumLarge">
        Medium large label
      </Label>
    </Stack>
  ),
};
