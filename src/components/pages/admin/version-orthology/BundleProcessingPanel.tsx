import * as React from "react";
import { AlertCircle, FileArchive, X } from "lucide-react";
import { Tooltip } from "@base-ui/react/tooltip";

import { ProgressBar } from "@/components/pages/admin/version-assembly-upload/FileCard/ProgressBar";
import { cn } from "@/utils/classname";
import type { JobItem } from "@/utils/services/genomics";

export type BundleUploadItem = {
  id: string;
  name: string;
  progress: number;
  /**
   * UPLOADING - the archive is on the wire (client-side work).
   * UPLOADED  - the client-side upload is done, but the extraction job has
   *             not been listed by the next /jobs poll yet. A hand-off buffer
   *             that closes as soon as the job shows up - it is not a job row
   *             and must not read like one.
   * FAILED    - the upload itself failed; no extraction job will ever exist.
   */
  status: "UPLOADING" | "UPLOADED" | "FAILED";
  error?: string;
};

function statusPill(status: JobItem["status"]) {
  if (status === "FAILED") {
    return (
      <span className="shrink-0 rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-red-600">
        Failed
      </span>
    );
  }
  if (status === "RUNNING") {
    return (
      <span className="shrink-0 rounded-full bg-orange-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-orange-600">
        Extracting
      </span>
    );
  }
  return (
    <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-slate-500">
      Queued
    </span>
  );
}

function uploadPill(status: BundleUploadItem["status"]) {
  if (status === "UPLOADING") {
    // Client-side state: same slate treatment the FileCard gives an upload in
    // transit, so "still on my machine" never looks like server processing.
    return (
      <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-slate-500">
        Uploading
      </span>
    );
  }
  if (status === "UPLOADED") {
    // Hand-off state: the archive has landed, but its extraction job has not
    // been listed by the backend yet. It deliberately does not say "Queued" -
    // that word belongs to the backend's own PENDING job row, and two rows
    // must never look like the same thing.
    return (
      <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-slate-500">
        Uploaded
      </span>
    );
  }
  return (
    <span className="shrink-0 rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-red-600">
      Failed
    </span>
  );
}

function bundleName(job: JobItem) {
  return (
    (job.payload?.file_path as string | undefined)?.split("/").pop() ||
    "orthology bundle"
  );
}

function ErrorTooltip({
  label,
  message,
  onOpenChange,
}: {
  label: string;
  message?: string;
  onOpenChange?: (open: boolean) => void;
}) {
  return (
    <Tooltip.Provider>
      <Tooltip.Root onOpenChange={onOpenChange}>
        <Tooltip.Trigger
          type="button"
          aria-label={label}
          className="flex cursor-help items-center text-red-500"
        >
          {/* No padding: the 14px icon must fit inside the label line's
              15px box (10px * lh 1.5) or the row grows when the state
              changes. */}
          <AlertCircle className="size-3.5" />
        </Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Positioner
            side="top"
            sideOffset={6}
            // Two-tier rule: page-hosted tooltips stay at z-50 (behind the
            // fixed corner stack - panel z-90, toasts z-100), while tooltips
            // hosted inside an overlay (this panel, or a toast) rise above
            // the whole stack. Portal renders body-level, so this z competes
            // directly.
            className="z-[110]"
          >
            <Tooltip.Popup className="max-w-xs break-words rounded-md bg-slate-900 px-2 py-1 text-xs font-medium text-white shadow-md outline-none">
              {message}
            </Tooltip.Popup>
          </Tooltip.Positioner>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  );
}

const COMPLETE_LINGER_MS = 1600;
// How long a failed row stays on screen when the user does not touch it:
// long enough to read the reason (and to hover the row and read it a moment
// later), short enough that the panel does not keep every old failure
// around.
const ERROR_LINGER_MS = 5000;
// How often the panel looks for rows whose time is up.
const ERROR_CHECK_MS = 250;

/**
 * Removes error rows that nobody is looking at.
 *
 * Every failed row (a failed upload, a failed extraction) gets
 * ERROR_LINGER_MS to live. Touching a row - the pointer on it, or its error
 * tooltip open - holds its countdown, so a row never disappears while the
 * reason is being read. Once the user is done with it, the row gets a fresh
 * window and then leaves on its own.
 *
 * `activeKeys` are the error rows currently on screen, `onExpire` is called
 * with the key of the row that timed out.
 */
function useErrorLinger(
  activeKeys: string[],
  onExpire: (key: string) => void,
  enabled = true,
) {
  // Rows the user is engaged with (the pointer is on the row, or its error
  // tooltip is open): their countdown is on hold. A ref, not state: the
  // checker below reads it on every tick, and holding a row must not cost a
  // render.
  const heldRef = React.useRef<Set<string>>(new Set());
  // Hold reasons per row. The pointer and the tooltip can hold the same row
  // at the same time, so the reasons have to be balanced.
  const holdsRef = React.useRef<Map<string, number>>(new Map());
  // When each row may leave, in epoch ms.
  const deadlinesRef = React.useRef<Map<string, number>>(new Map());
  // Rows that already left on their own: they get no new deadline while
  // they are still on screen.
  const expiredRef = React.useRef<Set<string>>(new Set());
  const onExpireRef = React.useRef(onExpire);

  // The joined key identifies the set: `activeKeys` is rebuilt on every
  // render, but its contents only change when a row appears or leaves.
  const key = activeKeys.join("|");
  const hasErrors = key.length > 0;

  React.useEffect(() => {
    onExpireRef.current = onExpire;
  });

  React.useEffect(() => {
    const deadlines = deadlinesRef.current;
    const active = new Set(key ? key.split("|") : []);
    const now = Date.now();
    for (const k of [...deadlines.keys()]) {
      if (active.has(k)) continue;
      // The row is gone: forget everything about it, so a later row with the
      // same key starts from scratch.
      deadlines.delete(k);
      expiredRef.current.delete(k);
      heldRef.current.delete(k);
      holdsRef.current.delete(k);
    }
    for (const k of active) {
      if (expiredRef.current.has(k)) continue;
      if (!deadlines.has(k)) deadlines.set(k, now + ERROR_LINGER_MS);
    }
  }, [key]);

  React.useEffect(() => {
    if (!enabled || !hasErrors) return;
    // A ticker, not one timeout per row: a row that leaves does not have to
    // re-arm the timer for the other rows.
    const timer = window.setInterval(() => {
      const now = Date.now();
      for (const [k, deadline] of deadlinesRef.current) {
        if (heldRef.current.has(k) || deadline > now) continue;
        expiredRef.current.add(k);
        deadlinesRef.current.delete(k);
        onExpireRef.current(k);
      }
    }, ERROR_CHECK_MS);
    return () => window.clearInterval(timer);
  }, [enabled, hasErrors]);

  function hold(k: string) {
    holdsRef.current.set(k, (holdsRef.current.get(k) ?? 0) + 1);
    heldRef.current.add(k);
  }

  function release(k: string) {
    const count = (holdsRef.current.get(k) ?? 0) - 1;
    if (count > 0) {
      holdsRef.current.set(k, count);
      return;
    }
    holdsRef.current.delete(k);
    heldRef.current.delete(k);
    // The user is done with it: a fresh window before it leaves.
    if (!expiredRef.current.has(k)) {
      deadlinesRef.current.set(k, Date.now() + ERROR_LINGER_MS);
    }
  }

  function touch(k: string) {
    if (expiredRef.current.has(k)) return;
    deadlinesRef.current.set(k, Date.now() + ERROR_LINGER_MS);
  }

  return { hold, release, touch };
}

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
      .map((upload) => `upload:${upload.id}`),
    ...visible
      .filter((job) => job.status === "FAILED")
      .map((job) => `job:${job.id}`),
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
  // orange only starts once the backend has a job row of its own.
  const uploadingCount = uploads.filter(
    (upload) => upload.status === "UPLOADING",
  ).length;
  const queuedCount = uploads.filter(
    (upload) => upload.status === "UPLOADED",
  ).length;
  const clientActiveCount = uploadingCount + queuedCount;
  const serverActiveCount = activeJobCount;
  const activeCount = serverActiveCount + clientActiveCount;

  // Panel theme follows the dominant state, priority processing > error >
  // complete: while anything is in flight the panel stays orange (it is the
  // processing panel), otherwise green when every visible row is completing
  // (no failures alongside), red when failures are on screen. Fully
  // class-mapped (no dynamic Tailwind names) so the JIT keeps the classes.
  const anyFailed =
    visible.some((job) => job.status === "FAILED") ||
    uploads.some((upload) => upload.status === "FAILED");
  // While the only thing in flight is a client-side upload (or the hand-off
  // wait for its job), the panel stays gray: only work the backend does is
  // orange.
  const theme =
    serverActiveCount > 0
      ? "orange"
      : clientActiveCount > 0
        ? "gray"
        : completing.length > 0 && !anyFailed
          ? "green"
          : "red";
  const themeClasses = {
    orange: {
      root: "border-orange-200",
      header: "border-orange-100 bg-orange-50/70",
      icon: "bg-orange-100 text-orange-600",
    },
    gray: {
      root: "border-slate-200",
      header: "border-slate-200 bg-slate-50",
      icon: "bg-slate-100 text-slate-500",
    },
    red: {
      root: "border-red-200",
      header: "border-red-100 bg-red-50/70",
      icon: "bg-red-100 text-red-600",
    },
    green: {
      // One ramp step deeper than red/orange: Tailwind green is far more
      // luminous than they are at the same level, so green-50/100 read as
      // washed out next to them in the same header slot.
      root: "border-green-300",
      header: "border-green-200 bg-green-100/70",
      icon: "bg-green-200 text-green-700",
    },
  }[theme];

  // One merged array for BOTH live and completing rows. Rendering them as two
  // sibling .map() calls would make React treat them as two independent
  // reconciliation slots - a finishing row moving from the live list to the
  // completing list would unmount and remount even with matching keys, and
  // the ProgressBar width transition would never run on a fresh element.
  const rows: Array<
    | {
        key: number;
        name: string;
        completed: false;
        status: JobItem["status"];
        error: string | undefined;
        description: string | undefined;
      }
    | { key: number; name: string; completed: true }
  > = visible.map((job) =>
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
      <header
        className={cn(
          "flex items-center gap-3 border-b px-4 py-3",
          themeClasses.header,
        )}
      >
        <span className={cn("rounded-lg p-1.5", themeClasses.icon)}>
          <FileArchive className="size-4" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-semibold text-slate-900">
            Bundle processing
          </div>
          <div className="text-xs text-slate-500">
            {serverActiveCount > 0 && clientActiveCount > 0
              ? `Uploading & extracting orthology bundles · ${activeCount} active`
              : serverActiveCount > 0
                ? `Extracting orthology bundles · ${serverActiveCount} active`
                : clientActiveCount > 0
                  ? `Uploading orthology bundles · ${clientActiveCount} active`
                  : completing.length > 0
                    ? "Finishing up"
                    : uploads.some((upload) => upload.status === "FAILED")
                      ? "Review failed bundle uploads"
                      : "Review failed bundle extractions"}
          </div>
        </div>
        <span className="rounded-full bg-white px-2 py-0.5 text-xs font-bold text-slate-500 shadow-sm">
          {rows.length + uploads.length}
        </span>
      </header>

      <div className="divide-y divide-slate-100">
        {uploads.map((upload) => {
          const isFailed = upload.status === "FAILED";
          const errorKey = `upload:${upload.id}`;

          return (
            <div
              key={`upload-${upload.id}`}
              className="relative flex items-start gap-2 px-4 py-3"
              // A failure the user is not looking at removes itself; hovering
              // it (or opening its tooltip) holds it in place.
              onMouseEnter={isFailed ? () => hold(errorKey) : undefined}
              onMouseLeave={isFailed ? () => release(errorKey) : undefined}
              onClick={isFailed ? () => touch(errorKey) : undefined}
            >
              <div className="min-w-0 flex-1">
                <div
                  className={cn("flex items-center gap-2", isFailed && "pr-7")}
                >
                  <span
                    className="truncate text-sm font-semibold text-slate-800"
                    title={upload.name}
                  >
                    {upload.name}
                  </span>
                  {uploadPill(upload.status)}
                </div>

                <div className="mt-2">
                  <ProgressBar
                    progress={
                      upload.status === "UPLOADING" ? upload.progress : 100
                    }
                    title={
                      upload.status === "UPLOADING"
                        ? "Upload orthology bundle"
                        : upload.status === "UPLOADED"
                          ? "Waiting for extraction"
                          : ""
                    }
                    // Gray for every client-side state (in transit, or waiting
                    // for the job to be listed); the orange bar belongs to
                    // the backend's own job rows.
                    theme={isFailed ? "red" : "gray"}
                    size="sm"
                    showError={isFailed}
                    leftSlot={
                      isFailed ? (
                        <ErrorTooltip
                          label="Bundle upload error"
                          message={upload.error || "Upload failed"}
                          onOpenChange={(open) =>
                            open ? hold(errorKey) : release(errorKey)
                          }
                        />
                      ) : undefined
                    }
                  />
                </div>
              </div>

              {isFailed ? (
                <button
                  type="button"
                  aria-label={`Dismiss ${upload.name}`}
                  onClick={() => onDismissUpload?.(upload.id)}
                  className="absolute right-2 top-2 rounded-lg p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                >
                  <X className="size-4" />
                </button>
              ) : null}
            </div>
          );
        })}

        {rows.map((row) => {
          const isFailed = !row.completed && row.status === "FAILED";
          const errorKey = `job:${row.key}`;

          return (
            <div
              key={row.key}
              className="relative flex items-start gap-2 px-4 py-3"
              // A failure the user is not looking at removes itself; hovering
              // it (or opening its tooltip) holds it in place.
              onMouseEnter={isFailed ? () => hold(errorKey) : undefined}
              onMouseLeave={isFailed ? () => release(errorKey) : undefined}
              onClick={isFailed ? () => touch(errorKey) : undefined}
            >
              <div className="min-w-0 flex-1">
                <div
                  className={cn(
                    "flex items-center gap-2",
                    // Keep the name/pill clear of the overlay dismiss button
                    // (the bar itself stays full width, unlike when the
                    // button was an in-flow sibling that shrank it).
                    isFailed && "pr-7",
                  )}
                >
                  <span
                    className="truncate text-sm font-semibold text-slate-800"
                    title={row.name}
                  >
                    {row.name}
                  </span>
                  {row.completed ? (
                    <span className="shrink-0 rounded-full bg-green-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-green-600">
                      Complete
                    </span>
                  ) : (
                    statusPill(row.status)
                  )}
                </div>

                {/* Bar for every row shape: a witnessed failure keeps its
                    element from the active state, so progress transitions to
                    100% (red, ERROR label) exactly like a completion does. */}
                <div className="mt-2">
                  <ProgressBar
                    progress={
                      row.completed || isFailed
                        ? 100
                        : row.status === "RUNNING"
                          ? 50
                          : 10
                    }
                    title={
                      row.completed || isFailed
                        ? ""
                        : row.description || "Extract orthology bundle"
                    }
                    theme={
                      row.completed ? "green" : isFailed ? "red" : "orange"
                    }
                    size="sm"
                    showComplete={row.completed}
                    showError={isFailed}
                    // Job errors come from the backend error log and can be
                    // long: park the FileCard-style icon in the bar's empty
                    // left label slot and keep the full message in a tooltip.
                    leftSlot={
                      isFailed ? (
                        <ErrorTooltip
                          label="Bundle extraction error"
                          message={row.error || "Processing failed"}
                          onOpenChange={(open) =>
                            open ? hold(errorKey) : release(errorKey)
                          }
                        />
                      ) : undefined
                    }
                  />
                </div>
              </div>

              {isFailed ? (
                <button
                  type="button"
                  aria-label={`Dismiss ${row.name}`}
                  onClick={() => dismissJob(row.key)}
                  className="absolute right-2 top-2 rounded-lg p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                >
                  <X className="size-4" />
                </button>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
