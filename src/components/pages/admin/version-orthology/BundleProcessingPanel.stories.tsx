import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { BundleProcessingPanel } from "./BundleProcessingPanel";
import type { JobItem } from "@/utils/services/genomics";

const meta = {
  title: "Admin/Version Orthology/BundleProcessingPanel",
  component: BundleProcessingPanel,
  parameters: {
    layout: "fullscreen",
  },
  argTypes: {
    jobs: { control: false },
    versionName: { control: false },
  },
} satisfies Meta<typeof BundleProcessingPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

const makeJob = (overrides: Partial<JobItem> = {}): JobItem => ({
  id: 1,
  versionId: 12,
  type: "ORTHOLOGY.BUNDLE",
  description: "Extract orthology bundle",
  status: "PENDING",
  payload: { file_path: "/data/uploads/dmel_orthologs.zip" },
  ...overrides,
});

export const Queued: Story = {
  name: "Queued — single pending job",
  args: {
    versionName: "story-queued",
    jobs: [makeJob()],
  },
};

export const Running: Story = {
  name: "Running — extracting",
  args: {
    versionName: "story-running",
    jobs: [
      makeJob({
        id: 11,
        status: "RUNNING",
        payload: { file_path: "/data/uploads/dmel_orthologs.zip" },
      }),
    ],
  },
};

export const Failed: Story = {
  name: "Failed — error with dismiss",
  args: {
    versionName: "story-failed",
    jobs: [
      makeJob({
        id: 21,
        status: "FAILED",
        error: "invalid manifest: missing orthology.tsv at bundle root",
        payload: { file_path: "/data/uploads/broken_bundle.zip" },
      }),
    ],
  },
};

export const MultipleActive: Story = {
  name: "Multiple active jobs",
  args: {
    versionName: "story-multiple-active",
    jobs: [
      makeJob({
        id: 31,
        status: "RUNNING",
        payload: { file_path: "/data/uploads/fly_orthologs.zip" },
      }),
      makeJob({
        id: 32,
        status: "PENDING",
        payload: { file_path: "/data/uploads/mouse_orthologs.zip" },
      }),
      makeJob({
        id: 33,
        status: "PENDING",
        description: "Enqueued",
        payload: { file_path: "/data/uploads/worm_orthologs.zip" },
      }),
    ],
  },
};

export const MixedStates: Story = {
  name: "All states — queued, extracting, failed",
  args: {
    versionName: "story-mixed-states",
    jobs: [
      makeJob({
        id: 41,
        status: "RUNNING",
        payload: { file_path: "/data/uploads/fly_orthologs.zip" },
      }),
      makeJob({
        id: 42,
        status: "PENDING",
        payload: { file_path: "/data/uploads/mouse_orthologs.zip" },
      }),
      makeJob({
        id: 43,
        status: "FAILED",
        error: "gzip: unexpected end of file",
        payload: { file_path: "/data/uploads/corrupt.zip" },
      }),
    ],
  },
};

export const FailedOnly: Story = {
  name: "Failed only — review subtitle",
  args: {
    versionName: "story-failed-only",
    jobs: [
      makeJob({
        id: 51,
        status: "FAILED",
        error: "invalid manifest: missing orthology.tsv at bundle root",
        payload: { file_path: "/data/uploads/broken_bundle.zip" },
      }),
      makeJob({
        id: 52,
        status: "FAILED",
        error: "gzip: unexpected end of file",
        payload: { file_path: "/data/uploads/another_corrupt.zip" },
      }),
    ],
  },
};

function CompletionDemo() {
  const [jobs, setJobs] = React.useState<JobItem[]>([
    makeJob({
      id: 61,
      status: "RUNNING",
      payload: { file_path: "/data/uploads/fly_orthologs.zip" },
    }),
  ]);

  React.useEffect(() => {
    const timer = window.setTimeout(() => setJobs([]), 1500);
    return () => window.clearTimeout(timer);
  }, []);

  return <BundleProcessingPanel jobs={jobs} versionName="story-completion" />;
}

export const CompletionAnimation: Story = {
  name: "Completion animation — job finishes, bar fills to 100%, panel closes",
  parameters: { controls: { disable: true } },
  args: { jobs: [], versionName: "story-completion" },
  render: () => <CompletionDemo />,
};
