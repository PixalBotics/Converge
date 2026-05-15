import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import { ToolbarFilterPopover } from "@/components/common/ToolbarFilterPopover/ToolbarFilterPopover";
import { Typography } from "@/components/common/Typography/Typography";

const meta = {
  title: "Design System/ToolbarFilterPopover",
  component: ToolbarFilterPopover,
} satisfies Meta<typeof ToolbarFilterPopover>;

export default meta;

type Story = StoryObj<typeof meta>;

function Playground() {
  const [open, setOpen] = useState(true);
  return (
    <Box sx={{ display: "flex", justifyContent: "flex-end", pr: 2 }}>
      <ToolbarFilterPopover open={open} onOpenChange={setOpen} active>
        <Stack spacing={1.5} sx={{ p: 1 }}>
          <Typography variant="small" sx={{ color: "text.secondary" }}>
            Filter panel content (forms, chips, combo fields).
          </Typography>
        </Stack>
      </ToolbarFilterPopover>
    </Box>
  );
}

export const Open: StoryObj<typeof meta> = {
  render: () => <Playground />,
};
