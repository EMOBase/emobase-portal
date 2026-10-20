import * as React from "react";
import { FileArchive, X } from "lucide-react";

import { ProgressBar } from "@/components/pages/admin/version-assembly-upload/FileCard/ProgressBar";
import type { JobItem } from "@/utils/services/genomics";

const storageKey = (versionName: string) =>
  `emobase:dismissed-bundle-jobs:${versionName}`;

function loadDismissed(versionName: string): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(storageKey(versionName));
    return raw ? new Set(JSON.parse(raw) as string[]) : new Set();
  } catch {
    return new Set();
  }
}

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

export function BundleProcessingPanel({
  jobs,
  versionName,
}: {
  jobs: JobItem[];
  versionName: string;
}) {
  const [dismissed, setDismissed] = React.useState<Set<string>>(() =>
    loadDismissed(versionName),
  );

  React.useEffect(() => {
    setDismissed(loadDismissed(versionName));
  }, [versionName]);

  const visible = jobs.filter(
    (job) => !(job.status === "FAILED" && dismissed.has(String(job.id))),
  );

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
  const [prevJobs, setPrevJobs] = React.useState<JobItem[]>(jobs);

  if (jobs !== prevJobs) {
    setPrevJobs(jobs);
    const prevActive = new Map<number, string>();
    prevJobs.forEach((job) => {
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
      next.add(String(jobId));
      localStorage.setItem(storageKey(versionName), JSON.stringify([...next]));
      return next;
    });
  }

  const activeCount = visible.filter(
    (job) => job.status === "PENDING" || job.status === "RUNNING",
  ).length;

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
          {visible.length + completing.length}
        </span>
      </header>

      <div className="divide-y divide-slate-100">
        {visible.map((job) => {
          const name = bundleName(job);
          const isFailed = job.status === "FAILED";

          return (
            <div key={job.id} className="flex items-start gap-2 px-4 py-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span
                    className="truncate text-sm font-semibold text-slate-800"
                    title={name}
                  >
                    {name}
                  </span>
                  {statusPill(job.status)}
                </div>

                {isFailed ? (
                  <p
                    className="mt-1 truncate text-xs text-red-500"
                    title={job.error || "Processing failed"}
                  >
                    {job.error || "Processing failed"}
                  </p>
                ) : (
                  <div className="mt-2">
                    <ProgressBar
                      progress={job.status === "RUNNING" ? 50 : 10}
                      title={job.description || "Extract orthology bundle"}
                      theme="orange"
                      size="sm"
                    />
                  </div>
                )}
              </div>

              {isFailed ? (
                <button
                  type="button"
                  aria-label={`Dismiss ${name}`}
                  onClick={() => dismiss(job.id)}
                  className="shrink-0 rounded-lg p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                >
                  <X className="size-4" />
                </button>
              ) : null}
            </div>
          );
        })}

        {/* Same keyed elements as the live rows they came from, so the bar
            transitions 50% -> 100% instead of remounting at full width. */}
        {completing.map((row) => (
          <div key={row.id} className="flex items-start gap-2 px-4 py-3">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span
                  className="truncate text-sm font-semibold text-slate-800"
                  title={row.name}
                >
                  {row.name}
                </span>
                <span className="shrink-0 rounded-full bg-green-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-green-600">
                  Complete
                </span>
              </div>
              <div className="mt-2">
                <ProgressBar
                  progress={100}
                  title=""
                  theme="orange"
                  size="sm"
                  showComplete
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
