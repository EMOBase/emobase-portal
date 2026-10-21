import * as React from "react";

import { cn } from "@/utils/classname";
import type { JobItem } from "@/utils/services/genomics";

import { JobRow } from "./JobRow";
import { PanelHeader, panelSubtitle } from "./PanelHeader";
import { panelThemeClasses, resolvePanelTheme } from "./theme";
import type { BundleUploadItem, PanelJobRow } from "./types";
import { UploadRow } from "./UploadRow";
import { useErrorLinger } from "./useErrorLinger";
import { bundleName, jobErrorKey, uploadErrorKey } from "./utils";

const COMPLETE_LINGER_MS = 1600;

export function BundleProcessingPanel({
  jobs,
  uploads = [],
  onDismissUpload,
  preview = false,
}: {
  jobs: JobItem[];
  uploads?: BundleUploadItem[];
  onDismissUpload?: (uploadId: string) => void;
  /** Static showcase mode (Storybook): every row shape is rendered at once -
      failures are not hidden by the witness rule, a job that is already
      DONE shows up as a completed row, and the failed rows do not remove
      themselves. The live page never sets this: it filters DONE jobs out,
      only ever shows failures it witnessed, and lets an ignored failure
      disappear again. */
  preview?: boolean;
}) {
  // Job ids this page instance has watched in an active state (PENDING or
  // RUNNING). FAILED rows live in the database forever, but the panel only
  // shows a failure it actually watched happen - a reload (or another
  // device/browser) starts with an empty watch list, so stale failures never
  // resurface anywhere. Purely in-memory: no localStorage involved.
  const seenActiveRef = React.useRef<Set<number>>(new Set());

  // Failed rows the user explicitly hid with the X - for this page instance
  // only; a reload forgets it (and the failure itself will not return anyway,
  // since it is no longer being watched).
  const [dismissed, setDismissed] = React.useState<Set<number>>(new Set());

  const visible = jobs.filter((job) => {
    if (job.status !== "FAILED") return true;
    if (preview) return !dismissed.has(job.id);
    return seenActiveRef.current.has(job.id) && !dismissed.has(job.id);
  });

  // When an active job leaves the jobs list (it reached DONE), keep its row
  // around as "completing" so the bar can animate to 100% before the row and
  // the panel close. Detected during render, not in an effect: React then
  // re-renders before committing, so the row's DOM (and its ProgressBar) is
  // preserved across 50% -> 100% and the CSS transition actually runs.
  // An effect would be one commit too late - the row would unmount and
  // remount at 100%, and transitions never fire on a fresh element.
  const [completing, setCompleting] = React.useState<
    Array<{ id: number; name: string; position: number }>
  >([]);
  const [prevJobs, setPrevJobs] = React.useState<JobItem[] | null>(null);

  if (jobs !== prevJobs) {
    setPrevJobs(jobs);
    // Positions in RENDER space (same filter as `visible` below), so a
    // finishing row can later be spliced back into the exact slot it
    // used to occupy instead of jumping to the bottom of the panel.
    const prevVisible = (prevJobs ?? []).filter(
      (job) =>
        job.status !== "FAILED" ||
        (seenActiveRef.current.has(job.id) && !dismissed.has(job.id)),
    );
    const prevActive = new Map<number, { name: string; position: number }>();
    prevVisible.forEach((job, index) => {
      if (job.status === "PENDING" || job.status === "RUNNING") {
        prevActive.set(job.id, { name: bundleName(job), position: index });
      }
    });
    const currentIds = new Set(jobs.map((job) => job.id));
    const newlyDone = [...prevActive.entries()]
      .filter(([id]) => !currentIds.has(id))
      .map(([id, info]) => ({ id, ...info }));
    if (newlyDone.length > 0) {
      setCompleting((prev) => [
        ...prev,
        ...newlyDone.filter((row) => !prev.some((p) => p.id === row.id)),
      ]);
    }
    // Also observe actives in the CURRENT snapshot (including the very first
    // one at mount), so a job that fails before its next poll was still
    // witnessed as active first.
    jobs.forEach((job) => {
      if (job.status === "PENDING" || job.status === "RUNNING") {
        seenActiveRef.current.add(job.id);
      }
    });
  }

  React.useEffect(() => {
    if (completing.length === 0) return;
    // 500ms of bar animation (ProgressBar transition) + ~1s of reading time.
    const timer = window.setTimeout(() => {
      setCompleting((prev) =>
        prev.filter((row) => !completing.some((c) => c.id === row.id)),
      );
    }, COMPLETE_LINGER_MS);
    return () => window.clearTimeout(timer);
  }, [completing]);

  const hasRows =
    uploads.length > 0 || visible.length > 0 || completing.length > 0;

  const dismissJob = React.useCallback((jobId: number) => {
    setDismissed((prev) => {
      const next = new Set(prev);
      next.add(jobId);
      return next;
    });
  }, []);

  // The error rows that may remove themselves once the user has had time to
  // read them. Both kinds of failure count: a failed upload and a failed
  // extraction.
  const errorKeys = [
    ...uploads
      .filter((upload) => upload.status === "FAILED")
      .map((upload) => uploadErrorKey(upload.id)),
    ...visible
      .filter((job) => job.status === "FAILED")
      .map((job) => jobErrorKey(job.id)),
  ];

  const handleErrorExpire = React.useCallback(
    (key: string) => {
      if (key.startsWith("upload:")) {
        onDismissUpload?.(key.slice("upload:".length));
        return;
      }
      if (key.startsWith("job:")) {
        dismissJob(Number(key.slice("job:".length)));
      }
    },
    [onDismissUpload, dismissJob],
  );

  // The static showcase keeps its failure rows: a story that removed its own
  // error rows would show an empty panel.
  const { hold, release, touch } = useErrorLinger(
    errorKeys,
    handleErrorExpire,
    !preview,
  );

  // Publish our height so the toast viewport (toaster.tsx) can stack directly
  // above this panel instead of covering it. Panel bottom is 1rem + 8px gap.
  const rootRef = React.useRef<HTMLDivElement | null>(null);
  React.useEffect(() => {
    if (!hasRows) return;
    const el = rootRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const root = document.documentElement;
    const observer = new ResizeObserver((entries) => {
      const height = entries[0]?.contentRect.height ?? 0;
      root.style.setProperty("--corner-stack-bottom", `${height + 24}px`);
    });
    observer.observe(el);
    return () => {
      observer.disconnect();
      root.style.removeProperty("--corner-stack-bottom");
    };
  }, [hasRows]);

  if (!hasRows) return null;

  const activeJobCount = visible.filter(
    (job) => job.status === "PENDING" || job.status === "RUNNING",
  ).length;
  // A bundle still on the wire is client-side work (same as the FileCard's IN
  // TRANSIT state), and so is the hand-off wait for its job to be listed:
  // orange only starts once the system has a job row of its own.
  const uploadingCount = uploads.filter(
    (upload) => upload.status === "UPLOADING",
  ).length;
  const queuedCount = uploads.filter(
    (upload) => upload.status === "UPLOADED",
  ).length;
  const clientActiveCount = uploadingCount + queuedCount;
  const serverActiveCount = activeJobCount;
  const activeCount = serverActiveCount + clientActiveCount;

  const anyFailed =
    visible.some((job) => job.status === "FAILED") ||
    uploads.some((upload) => upload.status === "FAILED");

  const theme = resolvePanelTheme({
    serverActiveCount,
    clientActiveCount,
    completingCount: completing.length,
    anyFailed,
  });
  const themeClasses = panelThemeClasses[theme];

  // One merged array for BOTH live and completing rows. Rendering them as two
  // sibling .map() calls would make React treat them as two independent
  // reconciliation slots - a finishing row moving from the live list to the
  // completing list would unmount and remount even with matching keys, and
  // the ProgressBar width transition would never run on a fresh element.
  const rows: PanelJobRow[] = visible.map((job) =>
    // A job that is already DONE renders as a completed row. The live page
    // filters DONE jobs out (the panel animates the handover instead), so
    // this only shows up in the static showcase.
    job.status === "DONE"
      ? { key: job.id, name: bundleName(job), completed: true as const }
      : {
          key: job.id,
          name: bundleName(job),
          completed: false as const,
          status: job.status,
          error: job.error,
          description: job.description,
        },
  );
  // Splice finishing rows back at the position they occupied in the last
  // snapshot (ascending, so multiple completions land correctly) instead of
  // appending - otherwise a job reorders the panel the moment it is DONE.
  [...completing]
    .sort((a, b) => a.position - b.position)
    .forEach((row) => {
      rows.splice(Math.min(row.position, rows.length), 0, {
        key: row.id,
        name: row.name,
        completed: true as const,
      });
    });

  return (
    <div
      ref={rootRef}
      aria-live="polite"
      className={cn(
        "fixed bottom-4 right-4 z-[90] w-[22.5rem] max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl border bg-white shadow-lg",
        themeClasses.root,
      )}
    >
      <PanelHeader
        theme={theme}
        subtitle={panelSubtitle({
          serverActiveCount,
          clientActiveCount,
          activeCount,
          completingCount: completing.length,
          uploadFailed: uploads.some((upload) => upload.status === "FAILED"),
        })}
        count={rows.length + uploads.length}
      />

      <div className="divide-y divide-slate-100">
        {uploads.map((upload) => (
          <UploadRow
            key={`upload-${upload.id}`}
            upload={upload}
            onHold={hold}
            onRelease={release}
            onTouch={touch}
            onDismiss={onDismissUpload}
          />
        ))}

        {rows.map((row) => (
          <JobRow
            key={row.key}
            row={row}
            onHold={hold}
            onRelease={release}
            onTouch={touch}
            onDismiss={dismissJob}
          />
        ))}
      </div>
    </div>
  );
}
