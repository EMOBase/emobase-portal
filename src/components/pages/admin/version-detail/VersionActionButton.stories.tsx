import type { Meta, StoryObj } from "@storybook/react-vite";

import VersionActionButton from "./VersionActionButton";

const meta = {
  title: "Admin/Version Detail/VersionActionButton",
  component: VersionActionButton,
  parameters: {
    layout: "centered",
  },
  args: {
    status: "READY",
    isDefault: false,
    pending: null,
    onRelease: () => {},
    onSync: () => {},
  },
  argTypes: {
    status: {
      control: "select",
      options: [
        "DRAFT",
        "PROCESSING",
        "READY",
        "ERROR",
        "MISSING_REQUIRED_FILE",
      ],
    },
    pending: {
      control: "select",
      options: [null, "release", "sync"],
    },
  },
} satisfies Meta<typeof VersionActionButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const SetAsDefault: Story = {
  name: "Set as Default (READY, not default)",
};

export const Sync: Story = {
  name: "Sync (is default)",
  args: { isDefault: true },
};

export const Releasing: Story = {
  name: "Releasing (pending)",
  args: { pending: "release" },
};

export const Syncing: Story = {
  name: "Syncing (pending)",
  args: { isDefault: true, pending: "sync" },
};
