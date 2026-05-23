import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import Box from "@mui/material/Box";
import { FilterableComboField } from "@/components/common/FilterableComboField/FilterableComboField";
import type { FilterableComboOption } from "@/components/common/FilterableComboField/FilterableComboField.types";

const options: FilterableComboOption[] = [
  { label: "Acme Corp", value: "acme" },
  { label: "Globex LLC", value: "globex" },
  { label: "Initech", value: "initech" },
  { label: "Umbrella Holdings", value: "umbrella" },
];

const meta = {
  title: "Design System/FilterableComboField",
  component: FilterableComboField,
} satisfies Meta<typeof FilterableComboField>;

export default meta;

type Story = StoryObj<typeof meta>;

function Playground() {
  const [value, setValue] = useState("globex");
  return (
    <Box sx={{ maxWidth: 360 }}>
      <FilterableComboField label="Company" value={value} onChange={setValue} options={options} />
    </Box>
  );
}

export const Default: StoryObj<typeof meta> = {
  render: () => <Playground />,
};
