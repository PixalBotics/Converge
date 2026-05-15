import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import Box from "@mui/material/Box";
import { Calendar } from "@/components/common/Calendar/Calendar";

const meta = {
  title: "Design System/Calendar",
  component: Calendar,
} satisfies Meta<typeof Calendar>;

export default meta;

type Story = StoryObj<typeof meta>;

function Playground() {
  const [value, setValue] = useState("2026-05-16");
  return (
    <Box sx={{ maxWidth: 380 }}>
      <Calendar label="Start date" name="start" value={value} onChange={setValue} />
    </Box>
  );
}

export const Default: StoryObj<typeof meta> = {
  render: () => <Playground />,
};
