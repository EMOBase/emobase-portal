import * as React from "react";
import { Download, History, Trash2, CheckCircle2 } from "lucide-react";

import CreateVersionButton from "./CreateVersionButton";
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
      className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${statusStyles[status]}`}
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
    <div className="max-w-6xl space-y-8 mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 font-display tracking-tight">
            Data Management
          </h1>
          <p className="text-slate-500 mt-1 font-medium">
            Upload and publish genomic data
          </p>
        </div>
        <CreateVersionButton onCreate={handleCreate} />
      </div>

      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-8 flex items-center gap-4 border-b border-slate-50">
          <History className="text-primary h-6 w-6" />
          <h2 className="text-xl font-bold text-slate-800">Version History</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-50">
                <th className="px-8 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-[0.15em]">
                  Version Name
                </th>
                <th className="px-8 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-[0.15em]">
                  Status
                </th>
                <th className="px-8 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-[0.15em]">
                  Created Date
                </th>
                <th className="px-8 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-[0.15em]">
                  Total Size
                </th>
                <th className="px-8 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-[0.15em] text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50/50">
              {versions.length > 0 ? (
                versions.map((version) => (
                  <tr
                    key={version.id}
                    className="group hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="px-8 py-6 relative">
                      <div className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-primary rounded-r-full opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="flex items-center gap-3">
                        <a
                          href={`/admin/versions/${version.name}`}
                          className="font-bold text-slate-700 tracking-tight hover:text-blue-700 transition-colors cursor-pointer"
                        >
                          {version.name}
                        </a>
                        {version.isDefault && (
                          <span className="px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700">
                            CURRENT
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <StatusBadge
                        status={version.status}
                        isDefault={version.isDefault}
                      />
                    </td>
                    <td className="px-8 py-6 text-slate-500 font-medium text-sm">
                      {formatDate(version.createdAt)}
                    </td>
                    <td className="px-8 py-6 text-slate-500 font-bold text-sm">
                      {formatBytes(version.totalFileSize)}
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {version.status === "DRAFT" ? (
                          <button
                            onClick={() => handleDelete(version.id)}
                            className="p-2 text-slate-300 hover:text-rose-500 rounded-lg transition-colors cursor-pointer"
                            aria-label="Delete version"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        ) : (
                          <>
                            {version.status === "MISSING_REQUIRED_FILE" ? (
                              <button
                                onClick={() => handleDelete(version.id)}
                                className="p-2 text-slate-300 hover:text-rose-500 rounded-lg transition-colors cursor-pointer"
                                aria-label="Delete version"
                              >
                                <Trash2 className="h-5 w-5" />
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
                                    className="p-2 text-slate-300 hover:text-blue-500 rounded-lg transition-colors cursor-pointer"
                                    aria-label="Set as default"
                                  >
                                    <CheckCircle2 className="h-5 w-5" />
                                  </button>
                                ) : null}
                                <button
                                  className="p-2 text-slate-300 hover:text-blue-700 rounded-lg transition-colors cursor-pointer"
                                  aria-label="Download files"
                                >
                                  <Download className="h-5 w-5" />
                                </button>
                                {version.status === "ERROR" ||
                                version.status === "READY" ? (
                                  !version.isDefault ? (
                                    <button
                                      onClick={() => handleDelete(version.id)}
                                      className="p-2 text-slate-300 hover:text-rose-500 rounded-lg transition-colors cursor-pointer"
                                      aria-label="Delete version"
                                    >
                                      <Trash2 className="h-5 w-5" />
                                    </button>
                                  ) : null
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
                    className="px-8 py-12 text-center text-slate-400 text-sm"
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
