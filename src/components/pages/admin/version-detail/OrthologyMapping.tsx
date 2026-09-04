import { Plus, Share2 } from "lucide-react";

import type { OrthologyFile } from "./mockData";

export default function OrthologyMapping({
  files,
}: {
  files: OrthologyFile[];
}) {
  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-800">Orthology Mapping</h2>
        <button
          type="button"
          className="flex size-7 items-center justify-center rounded-full border-2 border-blue-700 text-blue-700 hover:bg-blue-50"
          aria-label="Add mapping"
        >
          <Plus className="size-4" strokeWidth={2.5} />
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="flex items-center gap-2 bg-slate-50 px-4 py-3">
          <Share2 className="size-4 text-slate-500" />
          <span className="text-sm font-semibold text-slate-600">
            Relationship Files
          </span>
        </div>

        <ul>
          {files.map((file) => (
            <li key={file.id} className="border-t border-slate-100 px-4 py-3.5">
              <p className="text-sm font-bold text-slate-800">{file.name}</p>
              {file.status === "failed" ? (
                <p className="mt-1 flex items-center gap-1.5 text-sm font-medium text-red-700/90">
                  <span className="size-1.5 rounded-full bg-red-700/90" />
                  {file.updatedAt}
                </p>
              ) : (
                <p className="mt-1 text-sm text-slate-500">{file.updatedAt}</p>
              )}
            </li>
          ))}
        </ul>

        <div className="border-t border-slate-100 py-3 text-center">
          <a
            href="#"
            className="text-sm font-semibold text-blue-700 hover:underline"
          >
            View All Mappings
          </a>
        </div>
      </div>
    </section>
  );
}
