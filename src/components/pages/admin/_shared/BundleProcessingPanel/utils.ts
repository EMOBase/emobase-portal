import type { JobItem } from "@/utils/services/genomics";

/**
 * The archive a job works on, e.g. "dmel_orthologs.zip".
 */
export function bundleName(job: JobItem) {
  return (
    (job.payload?.file_path as string | undefined)?.split("/").pop() ||
    "orthology bundle"
  );
}

/** Error keys namespace the client-side and the server-side failures. */
export const uploadErrorKey = (id: string) => `upload:${id}`;
export const jobErrorKey = (id: number) => `job:${id}`;
