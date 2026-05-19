import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import Stack from "@mui/material/Stack";
import { Button } from "@/components/common/Button/Button";
import { AddSocialMediaModal } from "@/components/common/AddSocialMediaModal/AddSocialMediaModal";
import { EditIpBlockModal } from "@/components/common/EditIpBlockModal/EditIpBlockModal";
import { DisconnectConfirmModal } from "@/components/common/DisconnectConfirmModal/DisconnectConfirmModal";
import { UnblockIpConfirmModal } from "@/components/common/UnblockIpConfirmModal/UnblockIpConfirmModal";
import { SendLicenseConfirmModal } from "@/components/common/SendLicenseConfirmModal/SendLicenseConfirmModal";

const meta = {
  title: "Design System/Modals (flows)",
} satisfies Meta;

export default meta;

export const AddSocialMedia: StoryObj = {
  render: function AddSocialMediaDemo() {
    const [open, setOpen] = useState(true);
    return (
      <Stack spacing={2}>
        <Button type="button" variant="secondary" onClick={() => setOpen(true)}>
          Open add social media
        </Button>
        <AddSocialMediaModal open={open} onClose={() => setOpen(false)} />
      </Stack>
    );
  },
};

export const EditIpBlock: StoryObj = {
  render: function EditIpDemo() {
    const [open, setOpen] = useState(true);
    return (
      <Stack spacing={2}>
        <Button type="button" variant="secondary" onClick={() => setOpen(true)}>
          Open edit IP block
        </Button>
        <EditIpBlockModal open={open} onClose={() => setOpen(false)} />
      </Stack>
    );
  },
};

export const DisconnectConfirm: StoryObj = {
  render: function DisconnectDemo() {
    const [open, setOpen] = useState(false);
    return (
      <Stack spacing={2}>
        <Button type="button" variant="primary" onClick={() => setOpen(true)}>
          Disconnect integration
        </Button>
        <DisconnectConfirmModal open={open} onDismiss={() => setOpen(false)} onConfirm={() => setOpen(false)} />
      </Stack>
    );
  },
};

export const UnblockIp: StoryObj = {
  render: function UnblockDemo() {
    const [open, setOpen] = useState(false);
    return (
      <Stack spacing={2}>
        <Button type="button" variant="secondary" onClick={() => setOpen(true)}>
          Unblock IP
        </Button>
        <UnblockIpConfirmModal open={open} onDismiss={() => setOpen(false)} onConfirm={() => setOpen(false)} />
      </Stack>
    );
  },
};

export const SendLicense: StoryObj = {
  render: function SendLicenseDemo() {
    const [open, setOpen] = useState(true);
    return (
      <Stack spacing={2}>
        <Button type="button" variant="secondary" onClick={() => setOpen(true)}>
          Open send license
        </Button>
        <SendLicenseConfirmModal open={open} onDismiss={() => setOpen(false)} onConfirm={() => setOpen(false)} />
      </Stack>
    );
  },
};
