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

  if (visible.length === 0) return null;

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
              : "Review failed bundle extractions"}
          </div>
        </div>
        <span className="rounded-full bg-white px-2 py-0.5 text-xs font-bold text-orange-600 shadow-sm">
          {visible.length}
        </span>
      </header>

      <div className="divide-y divide-slate-100">
        {visible.map((job) => {
          const bundleName =
            (job.payload?.file_path as string | undefined)?.split("/").pop() ||
            "orthology bundle";
          const isFailed = job.status === "FAILED";

          return (
            <div key={job.id} className="flex items-start gap-2 px-4 py-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span
                    className="truncate text-sm font-semibold text-slate-800"
                    title={bundleName}
                  >
                    {bundleName}
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
                  aria-label={`Dismiss ${bundleName}`}
                  onClick={() => dismiss(job.id)}
                  className="shrink-0 rounded-lg p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
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
