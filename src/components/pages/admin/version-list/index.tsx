import * as React from "react";
import { Download, History, Trash2, CheckCircle2 } from "lucide-react";

import CreateVersionButton from "./CreateVersionButton";
import { cn } from "@/utils/classname";
import { formatDate } from "./utils";
import { formatBytes } from "@/utils/format";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { toastManager } from "@/components/ui/toaster";
import genomicsService, { type VersionItem } from "@/utils/services/genomics";
import { downloadUrl } from "@/utils/url";
import useService from "@/hooks/useService";
import useAsyncData from "@/hooks/useAsyncData";

const statusStyles: Record<VersionItem["status"], string> = {
  PROCESSING: "bg-amber-50 text-amber-600 border-amber-200/50",
  READY: "bg-emerald-50 text-emerald-600 border-emerald-200/50",
  DRAFT: "bg-slate-100 text-slate-500 border-slate-200/50",
  ERROR: "bg-red-50 text-red-600 border-red-200/50",
  MISSING_REQUIRED_FILE: "bg-slate-100 text-slate-500 border-slate-200/50",
};

const PAGE_SIZE = 100;

function StatusBadge({
  status,
  isDefault,
}: {
  status: VersionItem["status"];
  isDefault?: boolean;
}) {
  const label =
    status === "READY" && isDefault ? "LIVE" : status.replaceAll("_", " ");
  return (
    <span
      className={cn(
        "inline-block rounded-sm border px-2 py-0.5 text-xs font-bold uppercase tracking-wider",
        statusStyles[status],
      )}
    >
      {label}
    </span>
  );
}

export default function VersionsManager() {
  const { fetchVersions, createVersion, deleteVersion, releaseVersion } =
    useService(genomicsService);

  const [refreshKey, setRefreshKey] = React.useState(0);
  const [pendingName, setPendingName] = React.useState<string | null>(null);

  const { data, loading, error } = useAsyncData(
    () => fetchVersions({ page: 1, pageSize: PAGE_SIZE }),
    [refreshKey, fetchVersions],
  );

  const versions = data?.data.versions ?? [];
  const total = data?.data.total ?? 0;
  const errorMessage = error
    ? error instanceof Error
      ? error.message
      : String(error)
    : null;

  const refresh = () => setRefreshKey((prev) => prev + 1);

  async function run(action: () => Promise<unknown>, name: string) {
    setPendingName(name);
    try {
      await action();
      refresh();
    } catch (err) {
      toastManager.add({
        type: "error",
        title: `Failed to set version ${name} as default`,
        description: err instanceof Error ? err.message : undefined,
      });
    } finally {
      setPendingName(null);
    }
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-slate-900">
            Data Management
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Upload and publish genomic data
          </p>
        </div>
        <CreateVersionButton onCreate={(name) => createVersion({ name })} />
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-6 py-4">
          <div className="flex items-center gap-3">
            <History className="size-5 text-blue-700" />
            <h2 className="text-lg font-bold text-slate-800">
              Version History
            </h2>
          </div>
          {!loading && !error && (
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Showing {versions.length} of {total}
            </span>
          )}
        </div>

        {errorMessage ? (
          <div className="border-b border-rose-100 bg-rose-50 px-6 py-3 text-sm font-medium text-rose-600">
            {errorMessage}
          </div>
        ) : null}

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="px-6 py-3 text-xs font-bold uppercase tracking-widest text-slate-400">
                  Version Name
                </th>
                <th className="px-6 py-3 text-xs font-bold uppercase tracking-widest text-slate-400">
                  Status
                </th>
                <th className="px-6 py-3 text-xs font-bold uppercase tracking-widest text-slate-400">
                  Created Date
                </th>
                <th className="px-6 py-3 text-xs font-bold uppercase tracking-widest text-slate-400">
                  Total Size
                </th>
                <th className="px-6 py-3 text-right text-xs font-bold uppercase tracking-widest text-slate-400">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-12 text-center text-sm text-slate-400"
                  >
                    Loading versions...
                  </td>
                </tr>
              ) : versions.length > 0 ? (
                versions.map((version) => (
                  <tr
                    key={version.id}
                    className="group transition-colors hover:bg-slate-50"
                  >
                    <td className="relative px-6 py-4">
                      <div className="absolute bottom-1/4 left-0 top-1/4 w-0.5 rounded-r-full bg-blue-700 opacity-0 transition-opacity group-hover:opacity-100" />
                      <div className="flex items-center gap-2">
                        <a
                          href={`/admin/versions/${encodeURIComponent(version.name)}`}
                          className="font-semibold tracking-tight text-slate-700 transition-colors hover:text-blue-700"
                        >
                          {version.name}
                        </a>
                        {version.isDefault && (
                          <span className="rounded-sm bg-blue-100 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-blue-700">
                            DEFAULT
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge
                        status={version.status}
                        isDefault={version.isDefault}
                      />
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">
                      {formatDate(version.createdAt)}
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-slate-500">
                      {formatBytes(version.totalFileSize)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {version.status === "DRAFT" ||
                        version.status === "MISSING_REQUIRED_FILE" ? (
                          <ConfirmDialog
                            trigger={
                              <button
                                type="button"
                                disabled={pendingName === version.name}
                                className="rounded-lg p-2 text-slate-300 transition-colors hover:text-rose-500 disabled:opacity-50"
                                aria-label="Delete version"
                              >
                                <Trash2 className="size-4" />
                              </button>
                            }
                            title="Delete version"
                            description={
                              <>
                                Are you sure you want to delete version{" "}
                                <span className="font-semibold text-slate-700">
                                  {version.name}
                                </span>
                                ? This action cannot be undone.
                              </>
                            }
                            confirmLabel="Delete"
                            destructive
                            onConfirm={async () => {
                              await deleteVersion(version.name);
                              refresh();
                            }}
                          />
                        ) : (
                          <>
                            {version.status === "READY" &&
                              !version.isDefault && (
                                <ConfirmDialog
                                  trigger={
                                    <button
                                      disabled={pendingName === version.name}
                                      className="rounded-lg p-2 text-slate-300 transition-colors hover:text-blue-500 disabled:opacity-50"
                                      aria-label="Set as default"
                                    >
                                      <CheckCircle2 className="size-4" />
                                    </button>
                                  }
                                  title="Set as Default"
                                  description={
                                    <>
                                      Are you sure you want to set version{" "}
                                      <span className="font-semibold text-slate-700">
                                        {version.name}
                                      </span>{" "}
                                      to be the default version?
                                    </>
                                  }
                                  onConfirm={async () => {
                                    await releaseVersion(version.name);
                                    refresh();
                                  }}
                                />
                              )}
                            <a
                              target="_blank"
                              className="rounded-lg p-2 text-slate-300 transition-colors hover:text-blue-700"
                              aria-label="Download files"
                              href={downloadUrl(
                                `emobase-genomics/${encodeURIComponent(version.name)}/`,
                              )}
                            >
                              <Download className="size-4" />
                            </a>
                            {!version.isDefault && (
                              <ConfirmDialog
                                trigger={
                                  <button
                                    type="button"
                                    disabled={pendingName === version.name}
                                    className="rounded-lg p-2 text-slate-300 transition-colors hover:text-rose-500 disabled:opacity-50"
                                    aria-label="Delete version"
                                  >
                                    <Trash2 className="size-4" />
                                  </button>
                                }
                                title="Delete version"
                                description={
                                  <>
                                    Are you sure you want to delete version{" "}
                                    <span className="font-semibold text-slate-700">
                                      {version.name}
                                    </span>
                                    ? This action cannot be undone.
                                  </>
                                }
                                confirmLabel="Delete"
                                destructive
                                onConfirm={async () => {
                                  await deleteVersion(version.name);
                                  refresh();
                                }}
                              />
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-12 text-center text-sm text-slate-400"
                  >
                    {error ? "Could not load versions" : "No version found"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
