import { ChevronRight, Download, Play } from "lucide-react";

import OrthologyMapping from "./OrthologyMapping";
import SpeciesCard from "./SpeciesCard";
import { mockOrthologyFiles, mockSpecies } from "./mockData";

type VersionDetailProps = {
  versionName: string;
};

export default function VersionDetail({ versionName }: VersionDetailProps) {
  return (
    <div className="mx-auto max-w-6xl">
      <nav className="mb-5 flex items-center text-sm text-slate-400">
        <a href="/admin/versions" className="hover:text-slate-600">
          Data Management
        </a>
        <ChevronRight className="mx-0.5 size-3.5 text-slate-400" />
        <span className="font-semibold text-slate-800">
          Version {versionName}
        </span>
      </nav>

      <div className="mb-8 flex items-start justify-between gap-6">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-slate-900">
            Version {versionName}
          </h1>
          <p className="mt-1 max-w-lg text-sm text-slate-500">
            Detailed analysis and orthology mapping status for the current
            synthetic precision build.
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2.5">
          <button
            type="button"
            className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-800 hover:bg-slate-50"
          >
            <Download className="size-4" />
            Export Data
          </button>
          <button
            type="button"
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-blue-700 px-4 text-sm font-semibold text-white hover:bg-blue-800"
          >
            <Play className="size-4 fill-current" />
            Run Pipeline
          </button>
        </div>
      </div>

      <div className="flex items-start gap-8">
        <section className="min-w-0 flex-1">
          <div className="mb-4 flex items-center gap-2.5">
            <h2 className="text-lg font-bold text-slate-800">
              Species Data Integration
            </h2>
            <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-bold text-blue-700">
              {mockSpecies.length} Active
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {mockSpecies.map((species) => (
              <SpeciesCard key={species.id} species={species} />
            ))}
          </div>
        </section>

        <div className="w-80 shrink-0">
          <OrthologyMapping files={mockOrthologyFiles} />
        </div>
      </div>
    </div>
  );
}
