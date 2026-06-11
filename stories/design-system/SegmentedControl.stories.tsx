import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import Box from "@mui/material/Box";
import { SegmentedControl } from "@/components/common/SegmentedControl/SegmentedControl";

const meta = {
  title: "Design System/SegmentedControl",
  component: SegmentedControl,
} satisfies Meta<typeof SegmentedControl>;

export default meta;

type Story = StoryObj<typeof meta>;

function Playground() {
  const [value, setValue] = useState("week");
  return (
    <Box sx={{ maxWidth: 420 }}>
      <SegmentedControl
        options={[
          { label: "Day", value: "day" },
          { label: "Week", value: "week" },
          { label: "Month", value: "month" },
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

export const Secondary: StoryObj<typeof meta> = {
  render: function SecondaryPlayground() {
    const [value, setValue] = useState("Live");
    return (
      <SegmentedControl
        variant="secondary"
        options={["Live", "Paused", "Draft"]}
        value={value}
        onChange={setValue}
      />
    );
  },
};
