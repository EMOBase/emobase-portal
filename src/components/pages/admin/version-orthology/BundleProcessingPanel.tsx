import * as React from "react";
import { AlertCircle, FileArchive, X } from "lucide-react";
import { Tooltip } from "@base-ui/react/tooltip";

import { ProgressBar } from "@/components/pages/admin/version-assembly-upload/FileCard/ProgressBar";
import { cn } from "@/utils/classname";
import type { JobItem } from "@/utils/services/genomics";

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

function bundleName(job: JobItem) {
  return (
    (job.payload?.file_path as string | undefined)?.split("/").pop() ||
    "orthology bundle"
  );
}

const COMPLETE_LINGER_MS = 1600;

export function BundleProcessingPanel({ jobs }: { jobs: JobItem[] }) {
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
    Array<{ id: number; name: string }>
  >([]);
  const [prevJobs, setPrevJobs] = React.useState<JobItem[] | null>(null);

  if (jobs !== prevJobs) {
    setPrevJobs(jobs);
    const prevActive = new Map<number, string>();
    (prevJobs ?? []).forEach((job) => {
      if (job.status === "PENDING" || job.status === "RUNNING") {
        prevActive.set(job.id, bundleName(job));
      }
    });
    const currentIds = new Set(jobs.map((job) => job.id));
    const newlyDone = [...prevActive.entries()]
      .filter(([id]) => !currentIds.has(id))
      .map(([id, name]) => ({ id, name }));
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

  const hasJobs = visible.length > 0 || completing.length > 0;

  // Publish our height so the toast viewport (toaster.tsx) can stack directly
  // above this panel instead of covering it. Panel bottom is 1rem + 8px gap.
  const rootRef = React.useRef<HTMLDivElement | null>(null);
  React.useEffect(() => {
    if (!hasJobs) return;
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
  }, [hasJobs]);

  if (!hasJobs) return null;

  function dismiss(jobId: number) {
    setDismissed((prev) => {
      const next = new Set(prev);
      next.add(jobId);
      return next;
    });
  }

  const activeCount = visible.filter(
    (job) => job.status === "PENDING" || job.status === "RUNNING",
  ).length;

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
  > = [
    ...visible.map((job) => ({
      key: job.id,
      name: bundleName(job),
      completed: false as const,
      status: job.status,
      error: job.error,
      description: job.description,
    })),
    ...completing.map((row) => ({
      key: row.id,
      name: row.name,
      completed: true as const,
    })),
  ];

  return (
    <div
      ref={rootRef}
      aria-live="polite"
      className="fixed bottom-4 right-4 z-[90] w-[22.5rem] max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl border border-orange-200 bg-white shadow-lg"
    >
      <header className="flex items-center gap-3 border-b border-orange-100 bg-orange-50/70 px-4 py-3">
        <span className="rounded-lg bg-orange-100 p-1.5 text-orange-600">
          <FileArchive className="size-4" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-semibold text-slate-900">
            Bundle processing
          </div>
          <div className="text-xs text-slate-500">
            {activeCount > 0
              ? `Extracting orthology bundles · ${activeCount} active`
              : completing.length > 0
                ? "Finishing up"
                : "Review failed bundle extractions"}
          </div>
        </div>
        <span className="rounded-full bg-white px-2 py-0.5 text-xs font-bold text-orange-600 shadow-sm">
          {rows.length}
        </span>
      </header>

      <div className="divide-y divide-slate-100">
        {rows.map((row) => {
          const isFailed = !row.completed && row.status === "FAILED";

          return (
            <div
              key={row.key}
              className="relative flex items-start gap-2 px-4 py-3"
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
                  {/* Job errors come from the backend error log and can be
                      long - show an icon like FileCard does and keep the full
                      message in a tooltip instead of an inline line. */}
                  {isFailed ? (
                    <Tooltip.Provider>
                      <Tooltip.Root>
                        <Tooltip.Trigger
                          type="button"
                          aria-label="Bundle extraction error"
                          className="shrink-0 cursor-help text-red-500"
                        >
                          <AlertCircle className="size-4" />
                        </Tooltip.Trigger>
                        <Tooltip.Portal>
                          <Tooltip.Positioner
                            side="top"
                            sideOffset={6}
                            className="z-50"
                          >
                            <Tooltip.Popup className="max-w-xs break-words rounded-md bg-slate-900 px-2 py-1 text-xs font-medium text-white shadow-md outline-none">
                              {row.error || "Processing failed"}
                            </Tooltip.Popup>
                          </Tooltip.Positioner>
                        </Tooltip.Portal>
                      </Tooltip.Root>
                    </Tooltip.Provider>
                  ) : null}
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
                    theme={isFailed ? "red" : "orange"}
                    size="sm"
                    showComplete={row.completed}
                    showError={isFailed}
                  />
                </div>
              </div>

              {isFailed ? (
                <button
                  type="button"
                  aria-label={`Dismiss ${row.name}`}
                  onClick={() => dismiss(row.key)}
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
