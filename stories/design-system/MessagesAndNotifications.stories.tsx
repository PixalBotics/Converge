import type { Meta, StoryObj } from "@storybook/react";
import Stack from "@mui/material/Stack";
import { Button } from "@/components/common/Button/Button";
import { publishAppToast } from "@/lib/notify";

const meta = {
  title: "Design System/Messages & notifications",
} satisfies Meta;

export default meta;

export const GlassToasts: StoryObj = {
  name: "In-app toasts (glass)",
  render: () => (
    <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
      <Button
        type="button"
        variant="secondary"
        onClick={() => publishAppToast({ variant: "success", message: "Changes saved successfully." })}
      >
        Success toast
      </Button>
      <Button
        type="button"
        variant="secondary"
        onClick={() => publishAppToast({ variant: "error", message: "Could not reach the server. Retry shortly." })}
      >
        Error toast
      </Button>
    </Stack>
  ),
};
