import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import Box from "@mui/material/Box";
import { Dropdown } from "@/components/common/Dropdown/Dropdown";

const meta = {
  title: "Design System/Dropdown",
  component: Dropdown,
} satisfies Meta<typeof Dropdown>;

export default meta;

type Story = StoryObj<typeof meta>;

function Playground() {
  const [value, setValue] = useState("all");
  return (
    <Box>
      <Dropdown
        options={[
          { label: "All channels", value: "all" },
          { label: "Chat only", value: "chat" },
          { label: "Email only", value: "email" },
        ]}
        value={value}
        onChange={setValue}
      />
    </Box>
  );
}

export const Default: StoryObj<typeof meta> = {
  render: () => <Playground />,
};
