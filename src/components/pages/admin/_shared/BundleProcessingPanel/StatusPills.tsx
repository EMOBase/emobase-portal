import type { JobItem } from "@/utils/services/genomics";
import type { BundleUploadItem } from "./types";

/**
 * The state of an extraction job.
 */
export function StatusPill({ status }: { status: JobItem["status"] }) {
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

/**
 * The state of the client-side upload, which is a different thing: the
 * archive may still be on the wire, or already handed over to the system.
 */
export function UploadPill({ status }: { status: BundleUploadItem["status"] }) {
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
    // been listed by the system yet. It deliberately does not say "Queued" -
    // that word belongs to the system's own PENDING job row, and two rows
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

/**
 * The job finished, so the row is on its way out.
 */
export function CompletePill() {
  return (
    <span className="shrink-0 rounded-full bg-green-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-green-600">
      Complete
    </span>
  );
}
