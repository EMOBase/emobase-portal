import type { Meta, StoryObj } from "@storybook/react-vite";

import { FileCardBase, type FileStatus } from "./base";

const meta = {
  title: "Admin/Version Assembly Upload/FileCard",
  component: FileCardBase,
  parameters: {
    layout: "padded",
  },
  decorators: [
    (Story) => (
      <div className="mx-auto w-full max-w-6xl">
        <Story />
      </div>
    ),
  ],
  args: {
    isUploading: false,
    uploadProgress: 0,
    canUpload: false,
  },
  argTypes: {
    onChooseFile: { action: "chooseFile" },
    onDelete: { control: false },
    file: { control: "object" },
    cardSize: { control: "select", options: ["sm", "md"] },
  },
} satisfies Meta<typeof FileCardBase>;

export default meta;
type Story = StoryObj<typeof meta>;

const makeFile = (overrides: Partial<FileStatus> = {}): FileStatus => ({
  name: "genomic.fna",
  category: "Genome Sequence",
  icon: "file-text",
  status: "PENDING",
  progress: 0,
  progressTitle: "",
  size: "",
  ...overrides,
});

export const Pending: Story = {
  name: "Pending — choose file",
  args: {
    file: makeFile(),
    canUpload: true,
  },
};

export const PendingNotUploadable: Story = {
  name: "Pending — not uploadable (no version/assembly)",
  args: {
    file: makeFile({
      name: "track.gff.gz",
      category: "JBrowse2 Track",
      icon: "database",
    }),
    canUpload: false,
    cardSize: "sm",
  },
};

export const Uploading: Story = {
  name: "Uploading — in transit",
  args: {
    file: makeFile(),
    canUpload: true,
    isUploading: true,
    uploadProgress: 64,
  },
};

export const UploadingSmall: Story = {
  name: "Uploading — small (JBrowse2 track)",
  args: {
    file: makeFile({
      name: "coverage.bw.gz",
      category: "JBrowse2 Track",
      icon: "database",
      status: "UPLOADING",
      theme: "orange",
      size: "8.4 MB",
      id: "file-7",
    }),
    isUploading: true,
    uploadProgress: 55,
    cardSize: "sm",
  },
};

export const Processing: Story = {
  name: "Processing — job running",
  args: {
    file: makeFile({
      status: "PROCESSING",
      progress: 40,
      progressTitle: "INDEXING GENOME",
      theme: "orange",
      size: "128 MB",
    }),
    canUpload: true,
  },
};

export const Ready: Story = {
  name: "Ready — complete + status badge",
  args: {
    file: makeFile({
      status: "READY",
      progress: 100,
      theme: "blue",
      size: "312 MB",
      id: "file-1",
    }),
    canUpload: true,
  },
};

export const Error: Story = {
  name: "Error — re-upload with tooltip",
  args: {
    file: makeFile({
      status: "ERROR",
      progress: 100,
      error: "Upload failed",
      theme: "orange",
      size: "312 MB",
      id: "file-2",
    }),
    canUpload: true,
  },
};

export const ErrorNotUploadable: Story = {
  name: "Error — not uploadable (tooltip only)",
  args: {
    file: makeFile({
      status: "ERROR",
      progress: 100,
      error: "Job failed: duplicate gene ID 'gb12345'",
      theme: "orange",
      size: "312 MB",
      id: "file-3",
    }),
    canUpload: false,
  },
};

export const Paused: Story = {
  name: "Paused — resume upload",
  args: {
    file: makeFile({
      status: "PAUSED",
      progress: 50,
      progressTitle: "INTERRUPTED",
      theme: "orange",
      size: "312 MB",
      id: "file-4",
    }),
    canUpload: true,
  },
};

export const Disabled: Story = {
  name: "Disabled",
  args: {
    file: makeFile({
      name: "dsrna.csv",
      category: "dsRNA Silencing",
      icon: "syringe",
      status: "DISABLED",
    }),
    canUpload: true,
  },
};

export const ReadyDeletable: Story = {
  name: "Ready — listed file with delete",
  args: {
    file: makeFile({
      name: "genes.gff.gz",
      category: "JBrowse2 Track",
      icon: "database",
      status: "READY",
      progress: 100,
      theme: "blue",
      size: "8.4 MB",
      id: "file-5",
    }),
    onDelete: () => {},
    cardSize: "sm",
  },
};

export const ProcessingTrack: Story = {
  name: "Processing — listed track (delete hidden while processing)",
  args: {
    file: makeFile({
      name: "genes.gff.gz",
      category: "JBrowse2 Track",
      icon: "database",
      status: "PROCESSING",
      progress: 40,
      progressTitle: "INDEXING TRACK",
      theme: "orange",
      size: "8.4 MB",
      id: "file-6",
    }),
    onDelete: () => {},
    cardSize: "sm",
  },
};

export const ErrorTrack: Story = {
  name: "Error — small JBrowse2 track (failed processing)",
  args: {
    file: makeFile({
      name: "genes.gff.gz",
      category: "JBrowse2 Track",
      icon: "database",
      status: "ERROR",
      progress: 100,
      error: "Processing failed",
      theme: "orange",
      size: "8.4 MB",
      id: "file-8",
    }),
    onDelete: () => {},
    cardSize: "sm",
  },
};

export const ProcessingOrange: Story = {
  name: "Processing — orange theme (dsRNA)",
  args: {
    file: makeFile({
      name: "dsrna.csv",
      category: "dsRNA Silencing",
      icon: "syringe",
      status: "PROCESSING",
      progress: 20,
      progressTitle: "PROCESSING DATA",
      theme: "orange",
      size: "1.2 MB",
    }),
    canUpload: true,
  },
};

export const AllCases: Story = {
  name: "All cases",
  parameters: { controls: { disable: true } },
  args: { file: makeFile() },
  render: () => (
    <div className="grid gap-4">
      <FileCardBase
        file={makeFile()}
        isUploading={false}
        uploadProgress={0}
        canUpload
      />
      <FileCardBase file={makeFile()} isUploading uploadProgress={64} />
      <FileCardBase
        file={makeFile({
          status: "PAUSED",
          progress: 50,
          progressTitle: "INTERRUPTED",
          theme: "orange",
          size: "312 MB",
          id: "file-4",
        })}
        isUploading={false}
        uploadProgress={0}
        canUpload
      />
      <FileCardBase
        file={makeFile({
          status: "PROCESSING",
          progress: 40,
          progressTitle: "INDEXING GENOME",
          theme: "orange",
          size: "128 MB",
        })}
        isUploading={false}
        uploadProgress={0}
      />
      <FileCardBase
        file={makeFile({
          status: "READY",
          progress: 100,
          theme: "blue",
          size: "312 MB",
          id: "file-1",
        })}
        isUploading={false}
        uploadProgress={0}
      />
      <FileCardBase
        file={makeFile({
          status: "ERROR",
          progress: 100,
          error: "Upload failed",
          theme: "orange",
          size: "312 MB",
          id: "file-2",
        })}
        isUploading={false}
        uploadProgress={0}
        canUpload
      />
      <FileCardBase
        file={makeFile({
          name: "dsrna.csv",
          category: "dsRNA Silencing",
          icon: "syringe",
          status: "DISABLED",
        })}
        isUploading={false}
        uploadProgress={0}
      />
      <FileCardBase
        file={makeFile({
          name: "genes.gff.gz",
          category: "JBrowse2 Track",
          icon: "database",
          status: "READY",
          progress: 100,
          theme: "blue",
          size: "8.4 MB",
          id: "file-5",
        })}
        isUploading={false}
        uploadProgress={0}
        onDelete={() => {}}
        cardSize="sm"
      />
      <FileCardBase
        file={makeFile({
          name: "genes.gff.gz",
          category: "JBrowse2 Track",
          icon: "database",
          status: "PROCESSING",
          progress: 40,
          progressTitle: "INDEXING TRACK",
          theme: "orange",
          size: "8.4 MB",
          id: "file-6",
        })}
        isUploading={false}
        uploadProgress={0}
        onDelete={() => {}}
        cardSize="sm"
      />
      <FileCardBase
        file={makeFile({
          name: "genes.gff.gz",
          category: "JBrowse2 Track",
          icon: "database",
          status: "ERROR",
          progress: 100,
          error: "Processing failed",
          theme: "orange",
          size: "8.4 MB",
          id: "file-8",
        })}
        isUploading={false}
        uploadProgress={0}
        onDelete={() => {}}
        cardSize="sm"
      />
      <FileCardBase
        file={makeFile({
          name: "coverage.bw.gz",
          category: "JBrowse2 Track",
          icon: "database",
          status: "UPLOADING",
          theme: "orange",
          size: "8.4 MB",
          id: "file-7",
        })}
        isUploading
        uploadProgress={55}
        cardSize="sm"
      />
    </div>
  ),
};
