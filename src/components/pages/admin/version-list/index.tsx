import * as React from "react";
import { Download, History, Trash2, CheckCircle2 } from "lucide-react";

import CreateVersionButton from "./CreateVersionButton";
import { cn } from "@/utils/classname";
import {
  formatBytes,
  formatDate,
  mockVersions,
  type VersionItem,
} from "./mockData";

const statusStyles: Record<VersionItem["status"], string> = {
  PROCESSING: "bg-amber-50 text-amber-600 border-amber-200/50",
  READY: "bg-emerald-50 text-emerald-600 border-emerald-200/50",
  DRAFT: "bg-slate-100 text-slate-500 border-slate-200/50",
  ERROR: "bg-red-50 text-red-600 border-red-200/50",
  MISSING_REQUIRED_FILE: "bg-slate-100 text-slate-500 border-slate-200/50",
};

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
        "inline-block rounded border px-2 py-0.5 text-xs font-bold uppercase tracking-wider",
        statusStyles[status]
      )}
    >
      {label}
    </span>
  );
}

export default function VersionsManager() {
  const [versions, setVersions] = React.useState<VersionItem[]>(mockVersions);

  function handleCreate(name: string) {
    const newVersion: VersionItem = {
      id: String(Date.now()),
      name,
      createdAt: new Date().toISOString(),
      isDefault: false,
      status: "DRAFT",
      totalFileSize: 0,
    };
    setVersions((prev) => [newVersion, ...prev]);
  }

  function handleDelete(id: string) {
    setVersions((prev) => prev.filter((v) => v.id !== id));
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
        <CreateVersionButton onCreate={handleCreate} />
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="flex items-center gap-3 border-b border-slate-100 px-6 py-4">
          <History className="size-5 text-blue-700" />
          <h2 className="text-lg font-bold text-slate-800">Version History</h2>
        </div>

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
              {versions.length > 0 ? (
                versions.map((version) => (
                  <tr
                    key={version.id}
                    className="group transition-colors hover:bg-slate-50"
                  >
                    <td className="relative px-6 py-4">
                      <div className="absolute bottom-1/4 left-0 top-1/4 w-0.5 rounded-r-full bg-blue-700 opacity-0 transition-opacity group-hover:opacity-100" />
                      <div className="flex items-center gap-2">
                        <a
                          href={`/admin/versions/${version.name}`}
                          className="font-semibold tracking-tight text-slate-700 transition-colors hover:text-blue-700"
                        >
                          {version.name}
                        </a>
                        {version.isDefault && (
                          <span className="rounded bg-blue-50 px-1.5 py-0.5 text-xs font-bold uppercase tracking-wider text-blue-700">
                            CURRENT
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
                        {version.status === "DRAFT" ? (
                          <button
                            onClick={() => handleDelete(version.id)}
                            className="rounded-lg p-2 text-slate-300 transition-colors hover:text-rose-500"
                            aria-label="Delete version"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        ) : (
                          <>
                            {version.status === "MISSING_REQUIRED_FILE" ? (
                              <button
                                onClick={() => handleDelete(version.id)}
                                className="rounded-lg p-2 text-slate-300 transition-colors hover:text-rose-500"
                                aria-label="Delete version"
                              >
                                <Trash2 className="size-4" />
                              </button>
                            ) : (
                              <>
                                {version.status === "READY" &&
                                !version.isDefault ? (
                                  <button
                                    onClick={() =>
                                      setVersions((prev) =>
                                        prev.map((v) => ({
                                          ...v,
                                          isDefault: v.id === version.id,
                                        })),
                                      )
                                    }
                                    className="rounded-lg p-2 text-slate-300 transition-colors hover:text-blue-500"
                                    aria-label="Set as default"
                                  >
                                    <CheckCircle2 className="size-4" />
                                  </button>
                                ) : null}
                                <button
                                  className="rounded-lg p-2 text-slate-300 transition-colors hover:text-blue-700"
                                  aria-label="Download files"
                                >
                                  <Download className="size-4" />
                                </button>
                                {(version.status === "ERROR" ||
                                  version.status === "READY") &&
                                !version.isDefault ? (
                                  <button
                                    onClick={() => handleDelete(version.id)}
                                    className="rounded-lg p-2 text-slate-300 transition-colors hover:text-rose-500"
                                    aria-label="Delete version"
                                  >
                                    <Trash2 className="size-4" />
                                  </button>
                                ) : null}
                              </>
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
                    No version found
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
