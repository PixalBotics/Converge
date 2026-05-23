import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { StatusRadioGroup } from "@/components/common/StatusRadioGroup/StatusRadioGroup";

const meta = {
  title: "Design System/StatusRadioGroup",
  component: StatusRadioGroup,
} satisfies Meta<typeof StatusRadioGroup>;

export default meta;

type Story = StoryObj<typeof meta>;

function Playground() {
  const [value, setValue] = useState<"Active" | "Inactive">("Active");
  return <StatusRadioGroup value={value} onChange={setValue} />;
}

export const Default: StoryObj<typeof meta> = {
  render: () => <Playground />,
};
