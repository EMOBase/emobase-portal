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
    jobs: [makeJob()],
  },
};

export const Running: Story = {
  name: "Running — extracting",
  args: {
    jobs: [
      makeJob({
        id: 11,
        status: "RUNNING",
        payload: { file_path: "/data/uploads/dmel_orthologs.zip" },
      }),
    ],
  },
};

export const MultipleActive: Story = {
  name: "Multiple active jobs",
  args: {
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

// The panel only shows a failure it WATCHED happen (the job was active in
// this page instance first). These stories therefore start their failing
// jobs active and flip them to FAILED after a beat, exactly like a real
// poll would deliver the transition.
function WitnessedFailureDemo({
  initialJobs,
  failures,
}: {
  initialJobs: JobItem[];
  failures: Record<number, string>;
}) {
  const [jobs, setJobs] = React.useState<JobItem[]>(initialJobs);

  React.useEffect(() => {
    const timer = window.setTimeout(() => {
      setJobs((prev) =>
        prev.map((job) =>
          failures[job.id]
            ? { ...job, status: "FAILED", error: failures[job.id] }
            : job,
        ),
      );
    }, 1500);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <BundleProcessingPanel jobs={jobs} />;
}

export const Failed: Story = {
  name: "Failed — fails live, then dismiss",
  parameters: { controls: { disable: true } },
  args: { jobs: [] },
  render: () => (
    <WitnessedFailureDemo
      initialJobs={[
        makeJob({
          id: 21,
          status: "RUNNING",
          payload: { file_path: "/data/uploads/broken_bundle.zip" },
        }),
      ]}
      failures={{
        21: "invalid manifest: missing orthology.tsv at bundle root",
      }}
    />
  ),
};

export const MixedStates: Story = {
  name: "All states — queued, extracting, failed",
  parameters: { controls: { disable: true } },
  args: { jobs: [] },
  render: () => (
    <WitnessedFailureDemo
      initialJobs={[
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
          status: "RUNNING",
          payload: { file_path: "/data/uploads/corrupt.zip" },
        }),
      ]}
      failures={{ 43: "gzip: unexpected end of file" }}
    />
  ),
};

export const FailedOnly: Story = {
  name: "Failed only — review subtitle",
  parameters: { controls: { disable: true } },
  args: { jobs: [] },
  render: () => (
    <WitnessedFailureDemo
      initialJobs={[
        makeJob({
          id: 51,
          status: "RUNNING",
          payload: { file_path: "/data/uploads/broken_bundle.zip" },
        }),
        makeJob({
          id: 52,
          status: "PENDING",
          payload: { file_path: "/data/uploads/another_corrupt.zip" },
        }),
      ]}
      failures={{
        51: "invalid manifest: missing orthology.tsv at bundle root",
        52: "gzip: unexpected end of file",
      }}
    />
  ),
};

export const UnwitnessedFailure: Story = {
  name: "Unwitnessed failure — renders nothing (by design)",
  parameters: { controls: { disable: true } },
  args: { jobs: [] },
  render: () => (
    // A FAILED job that was never watched as active - e.g. it failed while
    // the tab was closed, or days ago and still sits in the jobs table. The
    // panel deliberately renders nothing: this is the rule that keeps stale
    // failures off every device with zero client-side storage.
    <BundleProcessingPanel
      jobs={[
        makeJob({
          id: 71,
          status: "FAILED",
          error: "job failed 3 days ago",
          payload: { file_path: "/data/uploads/old_failure.zip" },
        }),
      ]}
    />
  ),
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

  return <BundleProcessingPanel jobs={jobs} />;
}

export const CompletionAnimation: Story = {
  name: "Completion animation — job finishes, bar fills to 100%, panel closes",
  parameters: { controls: { disable: true } },
  args: { jobs: [] },
  render: () => <CompletionDemo />,
};
