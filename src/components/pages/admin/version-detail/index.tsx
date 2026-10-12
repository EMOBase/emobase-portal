import * as React from "react";
import { ChevronRight } from "lucide-react";

import OrthologyMapping from "./OrthologyMapping";
import SpeciesCard from "./SpeciesCard";
import VersionActionButton from "./VersionActionButton";
import { mockOrthologyFiles, mockSpecies } from "./mockData";
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
    [versionName, refreshKey, fetchVersionDetail]
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
          : `Failed to ${kind === "sync" ? "sync" : "release"} version ${versionName}`
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
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-slate-900">
            Version {versionName}
          </h1>
          <p className="mt-1 max-w-lg text-sm text-slate-500">
            Detailed analysis and orthology mapping status for the current
            synthetic precision build.
          </p>
        </div>

        <VersionActionButton
          status={versionData?.status}
          isDefault={versionData?.isDefault}
          pending={action}
          error={actionError}
          onRelease={() => void handleAction("release")}
          onSync={() => void handleAction("sync")}
        />
      </div>

      <div className="flex items-start gap-8">
        <section className="min-w-0 flex-1">
          <div className="mb-4 flex items-center gap-2.5">
            <h2 className="text-lg font-bold text-slate-800">
              Species Data Integration
            </h2>
            <span className="rounded-sm bg-blue-50 px-2 py-0.5 text-xs font-bold text-blue-700">
              {mockSpecies.length} Active
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {mockSpecies.map((species) => (
              <SpeciesCard
                key={species.id}
                species={species}
                href={`/admin/versions/${encodeURIComponent(versionName)}/species/${encodeURIComponent(species.shorthand)}`}
              />
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
