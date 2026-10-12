import * as React from "react";
import { ArrowRight, ChevronRight, Plus } from "lucide-react";

import SpeciesCard from "./SpeciesCard";
import VersionActionButton from "./VersionActionButton";
import { mockSpecies } from "./mockData";
import genomicsService from "@/utils/services/genomics";
import useAsyncData from "@/hooks/useAsyncData";
import useService from "@/hooks/useService";

type VersionDetailProps = {
  versionName: string;
};

export default function VersionDetail({ versionName }: VersionDetailProps) {
  const { fetchVersionDetail, releaseVersion } = useService(genomicsService);

  const [refreshKey, setRefreshKey] = React.useState(0);
  const [action, setAction] = React.useState<"release" | "sync" | null>(null);
  const [actionError, setActionError] = React.useState<string | null>(null);

  const { data } = useAsyncData(
    () => fetchVersionDetail(versionName),
    [versionName, refreshKey, fetchVersionDetail],
  );

  const versionData = data?.data;

  async function handleAction(kind: "release" | "sync") {
    setAction(kind);
    setActionError(null);
    try {
      await releaseVersion(versionName);
      setRefreshKey((prev) => prev + 1);
    } catch (err) {
      setActionError(
        err instanceof Error
          ? err.message
          : `Failed to ${kind === "sync" ? "sync" : "release"} version ${versionName}`,
      );
    } finally {
      setAction(null);
    }
  }

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
        <h1 className="font-display text-3xl font-bold tracking-tight text-slate-900">
          Version {versionName}
        </h1>

        <VersionActionButton
          status={versionData?.status}
          isDefault={versionData?.isDefault}
          pending={action}
          error={actionError}
          onRelease={() => void handleAction("release")}
          onSync={() => void handleAction("sync")}
        />
      </div>

      <section className="mb-8">
        <h2 className="mb-4 text-lg font-bold text-slate-800">Orthology</h2>
        <a
          href={`/admin/versions/${encodeURIComponent(versionName)}/orthology`}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-700 hover:underline"
        >
          Manage orthology data
          <ArrowRight className="size-4" />
        </a>
      </section>

      <section>
        <div className="mb-4 flex items-center gap-2.5">
          <h2 className="text-lg font-bold text-slate-800">Assemblies</h2>
          <span className="rounded-sm bg-blue-50 px-2 py-0.5 text-xs font-bold text-blue-700">
            {mockSpecies.length} items
          </span>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {mockSpecies.map((species) => (
            <SpeciesCard
              key={species.id}
              species={species}
              href={`/admin/versions/${encodeURIComponent(versionName)}/species/${encodeURIComponent(species.shorthand)}`}
            />
          ))}

          <a
            href={`/admin/versions/${encodeURIComponent(versionName)}/species/new`}
            className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-300 bg-white p-5 text-center transition-colors hover:border-blue-400 hover:bg-blue-50/50"
          >
            <span className="flex size-10 items-center justify-center rounded-full bg-blue-50 text-blue-700">
              <Plus className="size-5" />
            </span>
            <span className="text-sm font-semibold text-slate-700">
              Add new Assembly
            </span>
          </a>
        </div>
      </section>
    </div>
  );
}
