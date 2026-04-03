import type { ReactNode } from "react";

export type SocialProvider = "google" | "github" | "facebook";

export interface SocialAuthButtonProps {
  provider: SocialProvider;
  icon: ReactNode;
  onClick?: () => void;
  "aria-label": string;
}
