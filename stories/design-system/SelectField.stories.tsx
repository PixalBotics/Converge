import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import Box from "@mui/material/Box";
import { SelectField } from "@/components/common/SelectField/SelectField";

const options = [
  { label: "North America", value: "na" },
  { label: "Europe", value: "eu" },
  { label: "Asia Pacific", value: "apac" },
];

const meta = {
  title: "Design System/SelectField",
  component: SelectField,
} satisfies Meta<typeof SelectField>;

export default meta;

type Story = StoryObj<typeof meta>;

function Playground() {
  const [value, setValue] = useState("eu");
  return (
    <Box sx={{ maxWidth: 360 }}>
      <SelectField label="Region" value={value} onChange={setValue} options={options} searchable />
    </Box>
  );
}

export const Searchable: StoryObj<typeof meta> = {
  render: () => <Playground />,
};
