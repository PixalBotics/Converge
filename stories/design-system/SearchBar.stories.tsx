import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { SearchBar } from "@/components/common/SearchBar/SearchBar";

const meta = {
  title: "Design System/SearchBar",
  component: SearchBar,
} satisfies Meta<typeof SearchBar>;

export default meta;

function SearchPlayground() {
  const [value, setValue] = useState("");
  return <SearchBar value={value} onChange={setValue} placeholder="Search anything…" />;
}

export const Default: StoryObj = {
  render: () => <SearchPlayground />,
};
