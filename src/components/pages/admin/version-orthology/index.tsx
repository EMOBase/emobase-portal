import * as React from "react";
import { ChevronRight } from "lucide-react";

import AddOrthologyButton, {
  AddBatchOrthologyButton,
  AddSingleOrthologyButton,
} from "./AddOrthologyButton";
import { OrthologyFileCard } from "./OrthologyFileCard";
import { OrthologyBundleUpload } from "./OrthologyBundleUpload";
import { BundleProcessingPanel } from "./BundleProcessingPanel";
import {
  FileCard,
  type FileStatus,
} from "@/components/pages/admin/version-assembly-upload/FileCard";
import genomicsService, {
  type FileDetail,
  type JobItem,
} from "@/utils/services/genomics";
import useAsyncData from "@/hooks/useAsyncData";
import useService from "@/hooks/useService";
import { formatBytes } from "@/utils/format";

function computeFileStatus(fileDetail: FileDetail): {
  status: FileStatus["status"];
  progress: number;
  progressTitle: string;
  error: string;
} {
  let status: FileStatus["status"] = "PENDING";
  let progress = 0;
  let progressTitle = "";
  let error = "";

  if (fileDetail.uploadStatus === "FAILED") {
    status = "ERROR";
    error = "Upload failed";
    progress = 100;
  } else if (fileDetail.uploadStatus === "UPLOADING") {
    status = "PAUSED";
    progress = 50;
    progressTitle = "INTERRUPTED";
  } else {
    const jobs = fileDetail.jobs || [];
    const failedJob = jobs.find((j) => j.status === "FAILED");
    const activeJob = jobs.find(
      (j) => j.status === "RUNNING" || j.status === "PENDING",
    );

    if (failedJob) {
      status = "ERROR";
      error = failedJob.error || "Processing failed";
      progress = 100;
    } else if (activeJob) {
      status = "PROCESSING";
      const doneJobsCount = jobs.filter((j) => j.status === "DONE").length;
      progress = Math.min(100, Math.max(10, doneJobsCount * 20));
      progressTitle = activeJob.description || "PROCESSING DATA";
    } else {
      status = "READY";
      progress = 100;
    }
  }

  return { status, progress, progressTitle, error };
}

type BundleUploadState = {
  id: string;
  file: File;
  progress: number;
  status: "UPLOADING" | "UPLOADED" | "FAILED";
  error?: string;
  fileId?: string | null;
};

export default function VersionOrthology({
  versionName,
}: {
  versionName: string;
}) {
  const { fetchVersionDetail, fetchJobs } = useService(genomicsService);

  const [refreshToken, setRefreshToken] = React.useState(0);
  const refresh = React.useCallback(() => setRefreshToken((n) => n + 1), []);

  const { data } = useAsyncData(
    () => fetchVersionDetail(versionName),
    [versionName, fetchVersionDetail, refreshToken],
  );

  const { data: jobsData } = useAsyncData(
    () => fetchJobs(versionName),
    [versionName, fetchJobs, refreshToken],
  );

  const versionStatus = data?.data.status;

  // In-flight orthology bundle extractions: the bundle archive itself is not
  // listed in orthologyTSV (bundle rows are audit records), so the jobs list
  // is the only place the processing state is visible. DONE jobs drop out
  // here so the panel can watch a job leave the list (its completion
  // animation); everything else - including all historical FAILED rows, which
  // live in the database forever - is passed through for the panel to decide.
  // The panel only ever shows a failure it watched happen (the job was active
  // in this page instance first), so stale failures never surface, on any
  // device, with no client-side storage involved.
  const bundleJobs = React.useMemo<JobItem[]>(() => {
    const jobs: JobItem[] = jobsData?.data ?? [];
    return jobs.filter(
      (j) => j.type === "ORTHOLOGY.BUNDLE" && j.status !== "DONE",
    );
  }, [jobsData]);

  const orthologyFiles = React.useMemo<FileStatus[]>(() => {
    const files: FileDetail[] = data?.data.orthologyTSV ?? [];

    return files.map((fileDetail) => {
      const { status, progress, progressTitle, error } =
        computeFileStatus(fileDetail);
      const fileName = fileDetail.filePath.split("/").pop() || "orthology.tsv";

      return {
        id: fileDetail.id,
        name: fileName,
        category: "Orthology Mapping",
        icon: "tsv",
        status,
        progress,
        progressTitle,
        error,
        size: formatBytes(fileDetail.fileSize),
        theme: status === "READY" ? "blue" : "orange",
      };
    });
  }, [data]);

  const [singleUploads, setSingleUploads] = React.useState<
    Array<{
      id: string;
      file: File;
      order?: number;
      algorithm?: string;
    }>
  >([]);

  const [bundleUploads, setBundleUploads] = React.useState<BundleUploadState[]>(
    [],
  );

  // A bundle's tus upload is shown inside the floating processing panel, so it
  // is not page content. The empty state therefore only considers the
  // orthology.tsv list and inline single-file uploads.
  const showEmptyState =
    orthologyFiles.length === 0 && singleUploads.length === 0;

  function handleAdd(file: File, order: number, algorithm: string) {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    setSingleUploads((prev) => [...prev, { id, file, order, algorithm }]);
  }

  function handleAddBundle(bundleFile: File) {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    setBundleUploads((prev) => [
      ...prev,
      { id, file: bundleFile, progress: 0, status: "UPLOADING" },
    ]);
  }

  function updateBundleUpload(
    id: string,
    patch: Partial<Omit<BundleUploadState, "id" | "file">>,
  ) {
    setBundleUploads((prev) =>
      prev.map((upload) =>
        upload.id === id ? { ...upload, ...patch } : upload,
      ),
    );
  }

  // The backend creates the extraction job before tus reports the upload as
  // successful, so its fileId lets us hand the row over from "uploading" to
  // "extracting" without a gap (and without name guessing).
  const bundleJobFileIds = React.useMemo(() => {
    const ids = new Set<string>();
    for (const job of jobsData?.data ?? []) {
      if (job.type === "ORTHOLOGY.BUNDLE" && job.fileId) ids.add(job.fileId);
    }
    return ids;
  }, [jobsData]);

  const pendingBundleUploads = React.useMemo(
    () =>
      bundleUploads.filter(
        (upload) =>
          !upload.fileId ||
          upload.status !== "UPLOADED" ||
          !bundleJobFileIds.has(upload.fileId),
      ),
    [bundleUploads, bundleJobFileIds],
  );

  React.useEffect(() => {
    if (bundleJobFileIds.size === 0) return;
    setBundleUploads((prev) => {
      const next = prev.filter(
        (upload) =>
          !upload.fileId ||
          upload.status !== "UPLOADED" ||
          !bundleJobFileIds.has(upload.fileId),
      );
      return next.length === prev.length ? prev : next;
    });
  }, [bundleJobFileIds, bundleUploads]);

  const needsPolling =
    versionStatus === "PROCESSING" ||
    orthologyFiles.some((f) => f.status === "PROCESSING") ||
    bundleJobs.some((j) => j.status === "PENDING" || j.status === "RUNNING") ||
    singleUploads.length > 0 ||
    bundleUploads.some((upload) => upload.status !== "FAILED");

  React.useEffect(() => {
    if (!needsPolling) return;
    const timer = setInterval(refresh, 5000);
    return () => clearInterval(timer);
  }, [needsPolling, refresh]);

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      {/* Breadcrumb */}
      <nav className="flex items-center text-sm text-slate-400">
        <a href="/admin/versions" className="hover:text-slate-600">
          Data Management
        </a>
        <ChevronRight className="mx-0.5 size-3.5" />
        <a
          href={`/admin/versions/${versionName}`}
          className="hover:text-slate-600"
        >
          Version {versionName}
        </a>
        <ChevronRight className="mx-0.5 size-3.5" />
        <span className="font-semibold text-slate-800">Orthology</span>
      </nav>

      {/* Header */}
      <div className="flex items-start justify-between gap-6">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-slate-900">
            Orthology
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Mapping relationships between homologous genes across different
            species. Shared across every assembly in this version.
          </p>
        </div>
        <AddOrthologyButton
          onConfirm={handleAdd}
          onBatchConfirm={handleAddBundle}
        />
      </div>

      {/* Files */}
      <div className="grid gap-4">
        {orthologyFiles.map((file) => (
          <FileCard
            key={file.id}
            file={file}
            canDelete
            onRefresh={refresh}
            size="sm"
          />
        ))}

        {singleUploads.map((item) => (
          <OrthologyFileCard
            key={item.id}
            file={item.file}
            versionName={versionName}
            order={item.order}
            algorithm={item.algorithm}
            onComplete={() => {
              setSingleUploads((prev) =>
                prev.filter((upload) => upload.id !== item.id),
              );
              refresh();
            }}
          />
        ))}

        {showEmptyState ? (
          <div className="flex flex-col items-center justify-center py-16 border-2 border-dashed border-slate-200 rounded-lg bg-slate-50/50">
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              No orthology datasets yet
            </h3>
            <p className="text-sm text-slate-500 mb-6 text-center max-w-md">
              Upload orthology mapping data for this version. You can add a
              single dataset or a batch of datasets.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <AddSingleOrthologyButton onConfirm={handleAdd} />
              <AddBatchOrthologyButton onConfirm={handleAddBundle} />
            </div>
          </div>
        ) : null}
      </div>

      {/* Hidden tus uploaders. Bundle archives never render an inline
          FileCard: from the first byte to extraction they belong to the
          floating panel. */}
      {bundleUploads.map((upload) => (
        <OrthologyBundleUpload
          key={upload.id}
          file={upload.file}
          versionName={versionName}
          onProgress={(progress) => updateBundleUpload(upload.id, { progress })}
          onUploaded={(fileId) => {
            updateBundleUpload(upload.id, {
              fileId,
              status: "UPLOADED",
              progress: 100,
            });
            refresh();
          }}
          onFailed={(error) =>
            updateBundleUpload(upload.id, { status: "FAILED", error })
          }
        />
      ))}

      <BundleProcessingPanel
        jobs={bundleJobs}
        uploads={pendingBundleUploads.map((upload) => ({
          id: upload.id,
          name: upload.file.name,
          progress: upload.progress,
          status: upload.status,
          error: upload.error,
        }))}
        onDismissUpload={(uploadId) =>
          setBundleUploads((prev) =>
            prev.filter((upload) => upload.id !== uploadId),
          )
        }
      />
    </div>
  );
}
