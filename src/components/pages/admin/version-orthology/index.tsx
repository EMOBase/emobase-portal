import * as React from "react";
import { ChevronRight } from "lucide-react";

import AddOrthologyButton, {
  AddBatchOrthologyButton,
  AddSingleOrthologyButton,
} from "./AddOrthologyButton";
import { OrthologyFileCard } from "./OrthologyFileCard";
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
  // is the only place the processing state is visible. PENDING/RUNNING jobs
  // always show; a FAILED job only shows while it is the latest bundle job,
  // so a successful re-upload supersedes the old failure. On top of that the
  // panel itself announces each failure only once (recorded in localStorage),
  // since FAILED rows are kept in the database forever, like DONE ones.
  const bundleJobs = React.useMemo<JobItem[]>(() => {
    const jobs: JobItem[] = jobsData?.data ?? [];
    const bundles = jobs.filter((j) => j.type === "ORTHOLOGY.BUNDLE");

    return bundles.filter((j) => {
      if (j.status !== "FAILED") return j.status !== "DONE";
      return !bundles.some((other) => other.id > j.id);
    });
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

  const [uploads, setUploads] = React.useState<
    Array<{
      id: string;
      file: File;
      fileType: "orthology.tsv" | "orthology.bundle";
      order?: number;
      algorithm?: string;
      metadataFile?: File | null;
    }>
  >([]);

  function handleAdd(file: File, order: number, algorithm: string) {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    setUploads((prev) => [
      ...prev,
      { id, file, fileType: "orthology.tsv", order, algorithm },
    ]);
  }

  function handleAddBundle(bundleFile: File, metadataFile: File | null) {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    setUploads((prev) => [
      ...prev,
      { id, file: bundleFile, fileType: "orthology.bundle", metadataFile },
    ]);
  }

  const needsPolling =
    versionStatus === "PROCESSING" ||
    orthologyFiles.some((f) => f.status === "PROCESSING") ||
    bundleJobs.some((j) => j.status === "PENDING" || j.status === "RUNNING") ||
    uploads.length > 0;

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

        {/* Bundles are extracted server-side after the upload finishes, before
            their child orthology.tsv files exist. The archive is not a file in
            this list, so its extraction shows in the floating panel instead. */}
        {uploads.map((item) => (
          <OrthologyFileCard
            key={item.id}
            file={item.file}
            versionName={versionName}
            fileType={item.fileType}
            order={item.order}
            algorithm={item.algorithm}
            onComplete={() => {
              setUploads((prev) => prev.filter((u) => u.id !== item.id));
              refresh();
            }}
          />
        ))}

        {orthologyFiles.length === 0 &&
        bundleJobs.length === 0 &&
        uploads.length === 0 ? (
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

      <BundleProcessingPanel jobs={bundleJobs} versionName={versionName} />
    </div>
  );
}
