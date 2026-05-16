import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "@/components/common/Button/Button";
import { ConfirmActionModal } from "@/components/common/ConfirmActionModal/ConfirmActionModal";
import { FormModal } from "@/components/common/FormModal/FormModal";
import { InputField } from "@/components/common/InputField/InputField";

const meta = {
  title: "Design System/Modal",
} satisfies Meta;

export default meta;

function FormModalDemo() {
  const [open, setOpen] = useState(true);
  const [name, setName] = useState("Acme Workspace");
  return (
    <>
      <Button variant="secondary" type="button" onClick={() => setOpen(true)}>
        Open dialog
      </Button>
      <FormModal
        open={open}
        title="Workspace name"
        description="Updates apply everywhere this workspace appears."
        primaryButtonLabel="Save"
        onClose={() => setOpen(false)}
        onSave={() => setOpen(false)}
      >
        <InputField label="Display name" name="displayName" value={name} onChange={(e) => setName(e.target.value)} />
      </FormModal>
    </>
  );
}

export const FormModalGlass: StoryObj = {
  render: () => <FormModalDemo />,
};

function ConfirmDemo() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant="primary" type="button" sx={{ mr: 1 }} onClick={() => setOpen(true)}>
        Destroy draft
      </Button>
      <ConfirmActionModal
        open={open}
        title="Discard changes?"
        description="You’ll lose edits that weren’t synced to the platform."
        confirmLabel="Discard"
        confirmButtonVariant="danger"
        onDismiss={() => setOpen(false)}
        onConfirm={() => setOpen(false)}
      />
    </>
  );
}

export const ConfirmInline: StoryObj = {
  render: () => <ConfirmDemo />,
};
