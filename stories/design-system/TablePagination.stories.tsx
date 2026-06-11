import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import Box from "@mui/material/Box";
import { TablePagination } from "@/components/common/TablePagination/TablePagination";

const meta = {
  title: "Design System/TablePagination",
  component: TablePagination,
} satisfies Meta<typeof TablePagination>;

export default meta;

type Story = StoryObj<typeof meta>;

function Playground() {
  const [page, setPage] = useState(3);
  return (
    <Box>
      <TablePagination page={page} pageCount={12} onPageChange={setPage} />
    </Box>
  );
}

export const Interactive: StoryObj<typeof meta> = {
  render: () => <Playground />,
};
