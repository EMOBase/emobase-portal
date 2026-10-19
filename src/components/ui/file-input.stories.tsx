import type { Meta, StoryObj } from "@storybook/react-vite";

import { FileInput } from "./file-input";

const sampleFile = new File(["@example"], "genomic.fna", {
  type: "text/plain",
});

const meta = {
  title: "UI/FileInput",
  component: FileInput,
  decorators: [
    (Story) => (
      <div className="w-80">
        <Story />
      </div>
    ),
  ],
  argTypes: {
    onFiles: { action: "files" },
    value: { control: false },
    defaultValue: { control: false },
  },
} satisfies Meta<typeof FileInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {
  name: "Empty — placeholder",
  args: {
    accept: ".gz,.bgz",
  },
};

export const WithFile: Story = {
  name: "With file — shows name",
  args: {
    accept: ".gz,.bgz",
    defaultValue: sampleFile,
  },
};

export const Disabled: Story = {
  name: "Disabled",
  args: {
    accept: ".gz,.bgz",
    defaultValue: sampleFile,
    disabled: true,
  },
};

export const Invalid: Story = {
  name: "Invalid — error state",
  args: {
    accept: ".gz,.bgz",
    "aria-invalid": true,
  },
};
