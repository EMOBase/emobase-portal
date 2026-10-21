import * as React from "react";

import useAsyncData from "@/hooks/useAsyncData";
import useService from "@/hooks/useService";
import genomicsService, { type JobItem } from "@/utils/services/genomics";

export type BundleJobType = "ORTHOLOGY.BUNDLE" | "JBROWSE.TRACK.BUNDLE";

export type BundleUploadState = {
  id: string;
  file: File;
  progress: number;
  status: "UPLOADING" | "UPLOADED" | "FAILED";
  error?: string;
  fileId?: string | null;
};

/**
 * The lifecycle of a bundle archive on its way to the system: it is on the
 * wire (UPLOADING), it has landed and waits for its extraction job to be
 * listed (UPLOADED), or the upload itself failed (FAILED). The floating
 * BundleProcessingPanel renders this state, so a bundle archive never shows
 * up as page content.
 */
export function useBundleUploads({
  versionName,
  jobType,
  refreshToken,
}: {
  versionName: string;
  jobType: BundleJobType;
  refreshToken: number;
}) {
  const { fetchJobs } = useService(genomicsService);

  const { data: jobsData } = useAsyncData(
    () => fetchJobs(versionName),
    [versionName, fetchJobs, refreshToken],
  );

  const [bundleUploads, setBundleUploads] = React.useState<BundleUploadState[]>(
    [],
  );

  // The extraction jobs of this kind. DONE jobs drop out here so the panel
  // can watch a job leave the list (its completion animation); everything
  // else - including all historical FAILED rows, which live in the database
  // forever - is passed through for the panel to decide. The panel only ever
  // shows a failure it watched happen (the job was active in this page
  // instance first), so stale failures never surface, on any device, with no
  // client-side storage involved.
  const jobs = React.useMemo<JobItem[]>(
    () => (jobsData?.data ?? []).filter((job) => job.type === jobType),
    [jobsData, jobType],
  );

  const activeJobs = React.useMemo(
    () => jobs.filter((job) => job.status !== "DONE"),
    [jobs],
  );

  const addBundle = React.useCallback((file: File) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    setBundleUploads((prev) => [
      ...prev,
      { id, file, progress: 0, status: "UPLOADING" },
    ]);
  }, []);

  const updateBundle = React.useCallback(
    (id: string, patch: Partial<Omit<BundleUploadState, "id" | "file">>) => {
      setBundleUploads((prev) =>
        prev.map((upload) =>
          upload.id === id ? { ...upload, ...patch } : upload,
        ),
      );
    },
    [],
  );

  const dismissUpload = React.useCallback((uploadId: string) => {
    setBundleUploads((prev) => prev.filter((upload) => upload.id !== uploadId));
  }, []);

  // The system creates the extraction job before tus reports the upload as
  // successful, so its fileId lets us hand the row over from "uploading" to
  // "extracting" without a gap (and without name guessing).
  const jobFileIds = React.useMemo(() => {
    const ids = new Set<string>();
    for (const job of jobs) {
      if (job.fileId) ids.add(job.fileId);
    }
    return ids;
  }, [jobs]);

  // The uploads the panel still shows: an upload that has landed waits for
  // its job to be listed, and leaves the panel as soon as it is.
  const pendingUploads = React.useMemo(
    () =>
      bundleUploads.filter(
        (upload) =>
          !upload.fileId ||
          upload.status !== "UPLOADED" ||
          !jobFileIds.has(upload.fileId),
      ),
    [bundleUploads, jobFileIds],
  );

  React.useEffect(() => {
    if (jobFileIds.size === 0) return;
    setBundleUploads((prev) => {
      const next = prev.filter(
        (upload) =>
          !upload.fileId ||
          upload.status !== "UPLOADED" ||
          !jobFileIds.has(upload.fileId),
      );
      return next.length === prev.length ? prev : next;
    });
  }, [jobFileIds, bundleUploads]);

  return {
    jobs: activeJobs,
    uploads: bundleUploads,
    pendingUploads,
    addBundle,
    updateBundle,
    dismissUpload,
  };
}
