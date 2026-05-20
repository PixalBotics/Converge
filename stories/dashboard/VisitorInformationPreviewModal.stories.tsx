import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import Box from "@mui/material/Box";
import { Button } from "@/components/common/Button/Button";
import { VisitorInformationPreviewModal } from "@/features/distribution-setup";

const meta = {
  title: "Dashboard/VisitorInformationPreviewModal",
  component: VisitorInformationPreviewModal,
} satisfies Meta<typeof VisitorInformationPreviewModal>;

export default meta;

type Story = StoryObj<typeof meta>;

function Demo() {
  const [open, setOpen] = useState(true);
  return (
    <Box>
      <Button type="button" variant="secondary" onClick={() => setOpen(true)}>
        Open visitor preview
      </Button>
      <VisitorInformationPreviewModal open={open} onClose={() => setOpen(false)} />
    </Box>
  );
}

export const Default: Story = {
  args: {
    open: false,
    onClose: () => undefined,
  },
  render: () => <Demo />,
};
