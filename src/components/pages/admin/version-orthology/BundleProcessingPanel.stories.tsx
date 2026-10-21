import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";

import {
  BundleProcessingPanel,
  type BundleUploadItem,
} from "./BundleProcessingPanel";
import type { JobItem } from "@/utils/services/genomics";

const meta = {
  title: "Admin/Version Orthology/BundleProcessingPanel",
  component: BundleProcessingPanel,
  parameters: {
    layout: "fullscreen",
  },
  argTypes: {
    jobs: { control: false },
    uploads: { control: false },
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

// Overview story: a static snapshot of every row shape the panel can render,
// so all of them can be reviewed side by side. Nothing animates here - the
// per-case stories below cover the transitions (completion handover, live
// failure). The upload rows cover the client-side half of the lifecycle: one
// archive still in transit (gray), one whose upload is done but whose job is
// not listed yet (also gray) and one that failed on the way.
export const AllStates: Story = {
  name: "All states — uploading, queued, extracting, failed, complete",
  parameters: { controls: { disable: true } },
  args: {
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
      makeJob({
        id: 44,
        status: "DONE",
        payload: { file_path: "/data/uploads/worm_orthologs.zip" },
      }),
    ],
    uploads: [
      {
        id: "upload-1",
        name: "beetle_orthologs.zip",
        progress: 35,
        status: "UPLOADING",
      },
      {
        id: "upload-2",
        name: "zebra_orthologs.tar.gz",
        progress: 100,
        status: "UPLOADED",
      },
      {
        id: "upload-3",
        name: "shark_orthologs.zip",
        progress: 100,
        status: "FAILED",
        error: "Network error while uploading the bundle",
      },
    ],
  },
  // preview: show the failure and the completed row that the live page
  // (which filters DONE jobs and hides unwitnessed failures) never shows.
  render: (args) => <BundleProcessingPanel {...args} preview />,
};

export const Queued: Story = {
  name: "Queued — single pending job",
  args: {
    jobs: [makeJob()],
  },
};

// The client-side phase in one story: the archive fills the gray bar from
// 0% to 100% and then flips to the hand-off state ("Uploaded"), which is
// exactly what the row looks like in the live page.
function UploadingDemo() {
  const [uploads, setUploads] = React.useState<BundleUploadItem[]>([
    {
      id: "upload-1",
      name: "dmel_orthologs.zip",
      progress: 0,
      status: "UPLOADING",
    },
  ]);

  React.useEffect(() => {
    const timer = window.setInterval(() => {
      setUploads((prev) =>
        prev.map((upload) => {
          if (upload.status !== "UPLOADING") return upload;
          const progress = Math.min(100, upload.progress + 5);
          return {
            ...upload,
            progress,
            status: progress === 100 ? "UPLOADED" : "UPLOADING",
          };
        }),
      );
    }, 200);
    return () => window.clearInterval(timer);
  }, []);

  return <BundleProcessingPanel jobs={[]} uploads={uploads} />;
}

export const Uploading: Story = {
  name: "Uploading — archive in transit, 0% → 100% then hand-off (gray)",
  parameters: { controls: { disable: true } },
  args: { jobs: [] },
  render: () => <UploadingDemo />,
};

export const Mixed: Story = {
  name: "Mixed — uploading (gray) next to extracting (orange)",
  args: {
    jobs: [
      makeJob({
        id: 21,
        status: "RUNNING",
        payload: { file_path: "/data/uploads/fly_orthologs.zip" },
      }),
    ],
    uploads: [
      {
        id: "upload-4",
        name: "worm_orthologs.zip",
        progress: 63,
        status: "UPLOADING",
      },
    ],
  },
};

export const UploadFailed: Story = {
  name: "Upload failed — archive rejected before extraction",
  args: {
    jobs: [],
    uploads: [
      {
        id: "upload-3",
        name: "broken_bundle.zip",
        progress: 100,
        status: "FAILED",
        error: "Network error while uploading the bundle",
      },
    ],
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
