import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import FormControlLabel from "@mui/material/FormControlLabel";
import Stack from "@mui/material/Stack";
import { Checkbox } from "@/components/common/Checkbox/Checkbox";

const meta = {
  title: "Design System/Checkbox",
  component: Checkbox,
} satisfies Meta<typeof Checkbox>;

export default meta;

type Story = StoryObj<typeof meta>;

function LabeledRow() {
  const [checked, setChecked] = useState(true);
  return (
    <FormControlLabel
      control={<Checkbox checked={checked} onChange={(_, v) => setChecked(v)} />}
      label="Remember this device"
      sx={{ color: "text.primary" }}
    />
  );
}

export const WithLabel: Story = {
  render: () => (
    <Stack sx={{ maxWidth: 360 }}>
      <LabeledRow />
    </Stack>
  ),
};

export const Unchecked: Story = {
  render: () => (
    <Stack sx={{ maxWidth: 360 }}>
      <FormControlLabel control={<Checkbox />} label="Optional updates" sx={{ color: "text.primary" }} />
    </Stack>
  ),
};
