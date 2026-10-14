import * as React from "react";
import { ArrowRight, ChevronRight } from "lucide-react";

import AddAssemblyCard from "./AddAssemblyCard";
import SpeciesCard from "./SpeciesCard";
import VersionActionButton from "./VersionActionButton";
import { toastManager } from "@/components/ui/toaster";
import genomicsService from "@/utils/services/genomics";
import type { AssemblyVersionDetail } from "@/utils/services/genomics";
import { formatBytes } from "@/utils/format";
import useAsyncData from "@/hooks/useAsyncData";
import useService from "@/hooks/useService";

type VersionDetailProps = {
  versionName: string;
};

// Total size of an assembly, summed from all of its own uploaded files.
// orthology.tsv is intentionally excluded — it is shared across every assembly
// in a version rather than owned by one.
function assemblySize(files: AssemblyVersionDetail["files"]): number {
  const singleFiles = [
    files["genomic.fna"],
    files["genomic.gff"],
    files["rna.fna"],
    files["cds.fna"],
    files["protein.faa"],
    files["dsrna.csv"],
  ];
  const fileLists = [files["jbrowse.track"], files["species.synonym"]];

  return (
    singleFiles.reduce((sum, file) => sum + (file?.fileSize ?? 0), 0) +
    fileLists.reduce(
      (sum, list) =>
        sum + (list ?? []).reduce((inner, file) => inner + file.fileSize, 0),
      0,
    )
  );
}

export default function VersionDetail({ versionName }: VersionDetailProps) {
  const { fetchVersionDetail, releaseVersion, deleteAssemblyVersion } =
    useService(genomicsService);

  const [refreshKey, setRefreshKey] = React.useState(0);
  const [action, setAction] = React.useState<"release" | "sync" | null>(null);
  const [actionError, setActionError] = React.useState<string | null>(null);

  const { data } = useAsyncData(
    () => fetchVersionDetail(versionName),
    [versionName, refreshKey, fetchVersionDetail],
  );

  const versionData = data?.data;
  const assemblies = versionData?.assemblies ?? [];

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

  async function handleUpdateAssembly() {}

  async function handleDeleteAssembly(assembly: AssemblyVersionDetail) {
    try {
      await deleteAssemblyVersion(versionName, assembly.id);
      setRefreshKey((prev) => prev + 1);
      toastManager.add({
        type: "success",
        title: `Deleted assembly ${assembly.name}`,
      });
    } catch (err) {
      toastManager.add({
        type: "error",
        title: `Failed to delete assembly ${assembly.name}`,
        description: err instanceof Error ? err.message : undefined,
      });
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
            {assemblies.length} items
          </span>
        </div>

        <div className="grid auto-rows-fr grid-cols-2 gap-4 lg:grid-cols-3">
          {assemblies.map((assembly) => (
            <SpeciesCard
              key={assembly.id}
              species={{
                id: assembly.id,
                name: assembly.name,
                species: assembly.species,
                size: formatBytes(assemblySize(assembly.files)),
              }}
              href={`/admin/versions/${encodeURIComponent(versionName)}/assemblies/${encodeURIComponent(assembly.id)}`}
              onSubmit={handleUpdateAssembly}
              onDelete={() => handleDeleteAssembly(assembly)}
            />
          ))}

          <AddAssemblyCard versionName={versionName} />
        </div>
      </section>
    </div>
  );
}
