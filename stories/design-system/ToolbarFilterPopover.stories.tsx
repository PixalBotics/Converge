import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import Box from "@mui/material/Box";
import { ToolbarFilterPopover } from "@/components/common/ToolbarFilterPopover/ToolbarFilterPopover";
import { ToolbarFilterPopoverPanel } from "@/components/common/ToolbarFilterPopoverPanel/ToolbarFilterPopoverPanel";
import { Button } from "@/components/common/Button/Button";
import { Typography } from "@/components/common/Typography/Typography";
import { gradientPrimaryButtonSx } from "@/components/common/Button/Button.styles";

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
        <ToolbarFilterPopoverPanel
          footer={
            <>
              <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
                Reset
              </Button>
              <Button type="button" variant="primary" sx={gradientPrimaryButtonSx} onClick={() => setOpen(false)}>
                Done
              </Button>
            </>
          }
        >
          <Typography variant="small" sx={{ color: "text.secondary" }}>
            Long filter content scrolls here; Done stays pinned in the footer (see ToolbarFilterPopoverPanel).
          </Typography>
        </ToolbarFilterPopoverPanel>
      </ToolbarFilterPopover>
    </Box>
  );
}

export const Open: StoryObj<typeof meta> = {
  render: () => <Playground />,
};
