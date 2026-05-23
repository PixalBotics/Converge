import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import Box from "@mui/material/Box";
import { FilterableSearchBar } from "@/components/common/SearchBar/FilterableSearchBar";
import type { FilterableSearchSuggestion } from "@/components/common/SearchBar/FilterableSearchBar.types";

const suggestions: FilterableSearchSuggestion[] = [
  { id: "1", label: "Billing · Invoices" },
  { id: "2", label: "Billing · Receipts" },
  { id: "3", label: "Users · Active agents" },
];

const meta = {
  title: "Design System/FilterableSearchBar",
  component: FilterableSearchBar,
} satisfies Meta<typeof FilterableSearchBar>;

export default meta;

type Story = StoryObj<typeof meta>;

function Playground() {
  const [value, setValue] = useState("");
  const [select, setSelect] = useState("all");
  const [picked, setPicked] = useState<FilterableSearchSuggestion | undefined>(undefined);
  return (
    <Box sx={{ maxWidth: 560 }}>
      <FilterableSearchBar
        value={value}
        onChange={setValue}
        selectValue={select}
        onSelectChange={setSelect}
        selectOptions={[
          { label: "All", value: "all" },
          { label: "Users", value: "users" },
        ]}
        selectedSuggestion={picked}
        onSelectedSuggestionChange={setPicked}
        suggestions={value.trim().length > 0 ? suggestions : []}
        isSuggestionsLoading={false}
        placeholder="Search workspace…"
      />
    </Box>
  );
}

export const Default: StoryObj<typeof meta> = {
  render: () => <Playground />,
};
