import type { Meta, StoryObj } from "@storybook/react";
import Stack from "@mui/material/Stack";
import { SocialAuthButton } from "@/components/common/SocialAuthButton/SocialAuthButton";
import { FacebookIcon, GitHubIcon, GoogleIcon } from "@/components/common/SocialAuthButton/social-icons";

const meta = {
  title: "Design System/SocialAuthButton",
  component: SocialAuthButton,
} satisfies Meta<typeof SocialAuthButton>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Row: Story = {
  render: () => (
    <Stack direction="row" spacing={1} sx={{ maxWidth: 400 }}>
      <SocialAuthButton aria-label="Continue with Google" icon={<GoogleIcon />} onClick={() => {}} />
      <SocialAuthButton aria-label="Continue with GitHub" icon={<GitHubIcon />} onClick={() => {}} />
      <SocialAuthButton aria-label="Continue with Facebook" icon={<FacebookIcon />} onClick={() => {}} />
    </Stack>
  ),
};
