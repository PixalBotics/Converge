import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { useTheme } from "@mui/material/styles";
import Stack from "@mui/material/Stack";
import { Button } from "@/components/common/Button/Button";
import { DeleteUserConfirmModal } from "@/components/common/DeleteUserConfirmModal/DeleteUserConfirmModal";
import type { AppTheme } from "@/theme/theme";

const meta = {
  title: "Design System/DeleteUserConfirmModal",
  component: DeleteUserConfirmModal,
} satisfies Meta<typeof DeleteUserConfirmModal>;

export default meta;

type Story = StoryObj<typeof meta>;

function Demo() {
  const theme = useTheme() as AppTheme;
  const [open, setOpen] = useState(true);
  return (
    <Stack spacing={2}>
      <Button type="button" variant="secondary" onClick={() => setOpen(true)}>
        Open delete user confirm
      </Button>
      <DeleteUserConfirmModal
        open={open}
        displayName="Raja Saif"
        email="raja@example.com"
        onClose={() => setOpen(false)}
        onConfirm={() => setOpen(false)}
        isDeleting={false}
        theme={theme}
      />
    </Stack>
  );
}

export const Default: StoryObj<typeof meta> = {
  render: () => <Demo />,
};
