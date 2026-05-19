import type { Meta, StoryObj } from "@storybook/react";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import EditOutlined from "@mui/icons-material/EditOutlined";
import { DataTable } from "@/components/common/DataTable/DataTable";
import type { DataTableColumn } from "@/components/common/DataTable/DataTable.types";

type Row = { id: string; name: string; role: string; status: string };

const columns: DataTableColumn<Row>[] = [
  { id: "name", label: "Name" },
  { id: "role", label: "Role", cellVariant: "muted" },
  { id: "status", label: "Status" },
];

const rows: Row[] = [
  { id: "1", name: "Ayesha Khan", role: "Manager", status: "Active" },
  { id: "2", name: "Jordan Lee", role: "Agent", status: "Away" },
  { id: "3", name: "Sam Rivera", role: "Admin", status: "Active" },
];

const meta = {
  title: "Design System/DataTable",
  component: DataTable,
} satisfies Meta<typeof DataTable>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    columns,
    rows,
    getRowId: (r) => r.id,
    minWidth: 560,
    actionColumn: {
      label: "",
      render: () => (
        <IconButton size="small" aria-label="Edit">
          <EditOutlined fontSize="small" />
        </IconButton>
      ),
    },
  },
  decorators: [
    (S) => (
      <Box sx={{ maxWidth: 720 }}>
        <S />
      </Box>
    ),
  ],
};

export const Loading: Story = {
  args: {
    columns,
    rows: [],
    isLoading: true,
    loadingRowCount: 5,
  },
  decorators: Default.decorators,
};

export const Empty: Story = {
  args: {
    columns,
    rows: [],
    emptyState: {
      title: "No rows yet",
      description: "Invite teammates to see them listed here.",
    },
  },
  decorators: Default.decorators,
};
