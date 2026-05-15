import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import Stack from "@mui/material/Stack";
import { InputField } from "@/components/common/InputField/InputField";

const meta = {
  title: "Design System/InputField",
  component: InputField,
} satisfies Meta<typeof InputField>;

export default meta;

type Story = StoryObj<typeof meta>;

function ControlledText() {
  const [value, setValue] = useState("hello@example.com");
  return (
    <InputField
      label="Email"
      name="email"
      type="email"
      value={value}
      onChange={(e) => setValue(e.target.value)}
      placeholder="you@company.com"
    />
  );
}

export const Email: Story = {
  render: () => (
    <Stack sx={{ maxWidth: 400 }}>
      <ControlledText />
    </Stack>
  ),
};

function ControlledPassword() {
  const [value, setValue] = useState("secret");
  return (
    <InputField
      label="Password"
      name="password"
      type="password"
      value={value}
      onChange={(e) => setValue(e.target.value)}
    />
  );
}

export const Password: Story = {
  render: () => (
    <Stack sx={{ maxWidth: 400 }}>
      <ControlledPassword />
    </Stack>
  ),
};

export const WithError: Story = {
  render: () => (
    <Stack sx={{ maxWidth: 400 }}>
      <InputField
        label="Workspace"
        name="ws"
        value=""
        onChange={() => {}}
        error
        helperText="This field is required."
      />
    </Stack>
  ),
};
