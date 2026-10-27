import type { Meta, StoryObj } from "@storybook/react-vite";

import HomePage from "./index";

const meta: Meta<typeof HomePage> = {
  title: "Home/HomePage",
  component: HomePage,
  parameters: {
    layout: "fullscreen",
  },
};

export default meta;
type Story = StoryObj<typeof HomePage>;

export const NoAssemblies: Story = {
  args: {
    assemblies: [],
  },
};
