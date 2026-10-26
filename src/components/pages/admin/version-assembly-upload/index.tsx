import * as React from "react";
import { ChevronRight, Plus } from "lucide-react";

import AddJBrowseTrackButton from "./AddJBrowseTrackButton";
import { JBrowseTrackBundleUpload } from "./JBrowseTrackBundleUpload";
import { GffFileCard, JBrowseTrackFileCard, SynonymFileCard } from "./FileCard";
import { BundleProcessingPanel } from "../_shared/BundleProcessingPanel";
import { FileCard, type FileStatus } from "../_shared/FileCard";
import { useBundleUploads } from "../_shared/useBundleUploads";
import genomicsService, {
  type FileDetail,
  type VersionDetailFiles,
} from "@/utils/services/genomics";
import useAsyncData from "@/hooks/useAsyncData";
import useService from "@/hooks/useService";
import { formatBytes } from "@/utils/format";
import { isBeetleSpecies } from "@/utils/species";

type MainFileConfig = {
  category: string;
  icon: string;
};

const getMainFileConfigs = (
  speciesCode: string,
): Record<string, MainFileConfig> => {
  const configs: Record<string, MainFileConfig> = {
    "genomic.fna": { category: "Genome Sequence", icon: "file-text" },
    "genomic.gff": { category: "Genome Annotation", icon: "hash" },
    "rna.fna": { category: "RNA Sequences", icon: "microscope" },
    "cds.fna": { category: "Coding Sequences", icon: "braces" },
    "protein.faa": { category: "Protein Sequences", icon: "dna" },
  };

  if (isBeetleSpecies(speciesCode)) {
    configs["dsrna.csv"] = { category: "dsRNA Silencing", icon: "syringe" };
  }

  return configs;
};

function computeFileStatus(fileDetail?: FileDetail | null): {
  status: FileStatus["status"];
  progress: number;
  progressTitle: string;
  error: string;
} {
  let status: FileStatus["status"] = "PENDING";
  let progress = 0;
  let progressTitle = "";
  let error = "";

  if (!fileDetail) {
    return { status, progress, progressTitle, error };
  }

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

export default function VersionAssemblyUpload({
  versionName,
  assemblyId,
}: {
  versionName: string;
  assemblyId: string;
}) {
  const { fetchAssemblyVersionDetail } = useService(genomicsService);

  const [refreshToken, setRefreshToken] = React.useState(0);
  const refresh = React.useCallback(() => setRefreshToken((n) => n + 1), []);

  const { data } = useAsyncData(
    () => fetchAssemblyVersionDetail(versionName, assemblyId),
    [versionName, assemblyId, fetchAssemblyVersionDetail, refreshToken],
  );

  // The bundle archives and their extraction jobs live in the floating
  // processing panel, not in the page: the panel owns the whole lifecycle of
  // an archive, from the first byte to its extraction.
  const {
    jobs: bundleJobs,
    uploads: bundleUploads,
    pendingUploads: pendingBundleUploads,
    addBundle: handleAddBundle,
    updateBundle: updateBundleUpload,
    dismissUpload: dismissBundleUpload,
  } = useBundleUploads({
    versionName,
    jobType: "JBROWSE.TRACK.BUNDLE",
    refreshToken,
  });

  const assemblyName = data?.data?.name ?? assemblyId;
  const speciesCode = data?.data?.speciesCode ?? "";
  const versionFiles: VersionDetailFiles = data?.data?.files ?? {};

  const mainFiles = React.useMemo<FileStatus[]>(() => {
    return Object.entries(getMainFileConfigs(speciesCode)).map(
      ([fileName, config]) => {
        const fileDetail = versionFiles[
          fileName as keyof VersionDetailFiles
        ] as FileDetail | null | undefined;
        const { status, progress, progressTitle, error } =
          computeFileStatus(fileDetail);

        return {
          id: fileDetail?.id,
          name: fileName,
          category: config.category,
          icon: config.icon,
          status,
          progress,
          progressTitle,
          error,
          size: fileDetail ? formatBytes(fileDetail.fileSize) : "",
          theme: status === "READY" ? "blue" : "orange",
        };
      },
    );
  }, [versionFiles, speciesCode]);

  const jbrowseTrackFiles = React.useMemo<FileStatus[]>(() => {
    const files: FileDetail[] = versionFiles["jbrowse.track"] || [];

    return files.map((fileDetail) => {
      const { status, progress, progressTitle, error } =
        computeFileStatus(fileDetail);
      const fileName = fileDetail.filePath.split("/").pop() || "jbrowse.track";

      return {
        id: fileDetail.id,
        name: fileName,
        category: "JBrowse2 Track",
        icon: "database",
        status,
        progress,
        progressTitle,
        error,
        size: formatBytes(fileDetail.fileSize),
        theme: status === "READY" ? "blue" : "orange",
      };
    });
  }, [versionFiles]);

  const synonymFiles = React.useMemo<FileStatus[]>(() => {
    const files: FileDetail[] = versionFiles["species.synonym"] || [];

    return files.map((fileDetail) => {
      const { status, progress, progressTitle, error } =
        computeFileStatus(fileDetail);
      const fileName =
        fileDetail.filePath.split("/").pop() || "species.synonym";

      return {
        id: fileDetail.id,
        name: fileName,
        category: "Synonyms",
        icon: "book-open",
        status,
        progress,
        progressTitle,
        error,
        size: formatBytes(fileDetail.fileSize),
        theme: status === "READY" ? "blue" : "orange",
      };
    });
  }, [versionFiles]);

  const needsPolling =
    data?.data?.status === "PROCESSING" ||
    [...mainFiles, ...jbrowseTrackFiles, ...synonymFiles].some(
      (f) => f.status === "PROCESSING",
    ) ||
    bundleJobs.some((j) => j.status === "PENDING" || j.status === "RUNNING") ||
    bundleUploads.some((upload) => upload.status !== "FAILED");

  React.useEffect(() => {
    if (!needsPolling) return;
    const timer = setInterval(refresh, 5000);
    return () => clearInterval(timer);
  }, [needsPolling, refresh]);

  const [jbrowseTrackUploads, setJBrowseTrackUploads] = React.useState<
    Array<{
      id: string;
      file: File;
      trackName: string;
      category?: string;
      selectInDefaultSession?: boolean;
    }>
  >([]);

  const [synonymUploads, setSynonymUploads] = React.useState<
    Array<{ id: string; file: File }>
  >([]);

  function handleAddTrack(
    file: File,
    trackName: string,
    category?: string,
    selectInDefaultSession?: boolean,
  ) {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    setJBrowseTrackUploads((prev) => [
      ...prev,
      { id, file, trackName, category, selectInDefaultSession },
    ]);
  }

  function handleAddSynonym(file: File) {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    setSynonymUploads((prev) => [...prev, { id, file }]);
  }

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
        <span className="font-semibold text-slate-800">{assemblyName}</span>
      </nav>

      {/* Page title */}
      <h1 className="font-display text-3xl font-bold tracking-tight text-slate-900">
        {assemblyName}
      </h1>

      {/* Main required files */}
      <div className="grid gap-4">
        {mainFiles.map((file) =>
          file.name === "genomic.gff" ? (
            <GffFileCard
              key={file.name}
              file={file}
              versionName={versionName}
              assemblyId={assemblyId}
              onRefresh={refresh}
            />
          ) : (
            <FileCard
              key={file.name}
              file={file}
              versionName={versionName}
              assemblyId={assemblyId}
              onRefresh={refresh}
            />
          ),
        )}
      </div>

      <hr className="border-slate-200" />

      {/* JBrowse2 Track Files */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-900">
              JBrowse2 Track Files
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Visualisation tracks for the JBrowse2 genome browser.
            </p>
          </div>
          <AddJBrowseTrackButton
            onConfirm={handleAddTrack}
            onBatchConfirm={handleAddBundle}
          />
        </div>

        <div className="grid gap-4">
          {jbrowseTrackFiles.map((track) => (
            <FileCard
              key={track.id}
              file={track}
              canDelete
              onRefresh={refresh}
              size="sm"
            />
          ))}

          {jbrowseTrackUploads.map((item) => (
            <JBrowseTrackFileCard
              key={item.id}
              file={item.file}
              versionName={versionName}
              assemblyId={assemblyId}
              trackName={item.trackName}
              category={item.category}
              selectInDefaultSession={item.selectInDefaultSession}
              onComplete={() => {
                setJBrowseTrackUploads((prev) =>
                  prev.filter((u) => u.id !== item.id),
                );
                refresh();
              }}
            />
          ))}

          {jbrowseTrackFiles.length === 0 &&
          jbrowseTrackUploads.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-400">
              No JBrowse2 track files uploaded yet.
            </p>
          ) : null}
        </div>
      </div>

      <hr className="border-slate-200" />

      {/* Synonyms */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-900">
              Synonyms
            </h2>
            <p className="mt-1 text-sm text-slate-500">Gene synonym files.</p>
          </div>
          <button
            type="button"
            className="relative inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-800 hover:bg-slate-50"
          >
            <Plus className="size-4" strokeWidth={2.5} />
            Add Synonym File
            <input
              type="file"
              accept=".gz,.bgz"
              className="absolute inset-0 cursor-pointer opacity-0"
              onChange={(e) => {
                const selected = e.target.files?.[0];
                if (selected) handleAddSynonym(selected);
                e.target.value = "";
              }}
            />
          </button>
        </div>

        <div className="grid gap-4">
          {synonymFiles.map((file) => (
            <FileCard
              key={file.id}
              file={file}
              canDelete
              onRefresh={refresh}
              size="sm"
            />
          ))}

          {synonymUploads.map((item) => (
            <SynonymFileCard
              key={item.id}
              file={item.file}
              versionName={versionName}
              assemblyId={assemblyId}
              species={speciesCode}
              onComplete={() => {
                setSynonymUploads((prev) =>
                  prev.filter((u) => u.id !== item.id),
                );
                refresh();
              }}
            />
          ))}

          {synonymFiles.length === 0 && synonymUploads.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-400">
              No synonym files uploaded yet.
            </p>
          ) : null}
        </div>
      </div>

      {/* Hidden tus uploaders. Bundle archives never render an inline
          FileCard: from the first byte to extraction they belong to the
          floating panel. */}
      {bundleUploads.map((upload) => (
        <JBrowseTrackBundleUpload
          key={upload.id}
          file={upload.file}
          versionName={versionName}
          assemblyId={assemblyId}
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
        onDismissUpload={dismissBundleUpload}
      />
    </div>
  );
}
