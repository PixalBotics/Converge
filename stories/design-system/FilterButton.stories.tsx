import type { Meta, StoryObj } from "@storybook/react";
import { FilterButton } from "@/components/common/FilterButton/FilterButton";

const meta = {
  title: "Design System/FilterButton",
  component: FilterButton,
  args: {
    onClick: () => undefined,
  },
} satisfies Meta<typeof FilterButton>;

export default meta;

export const Idle: StoryObj = {};

export const Active: StoryObj = {
  args: { active: true },
};
