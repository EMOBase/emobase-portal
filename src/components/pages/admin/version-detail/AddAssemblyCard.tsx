import { Plus } from "lucide-react";

import AssemblyFormModal from "./AssemblyFormModal";
import genomicsService from "@/utils/services/genomics";
import useService from "@/hooks/useService";

export default function AddAssemblyCard({
  versionName,
}: {
  versionName: string;
}) {
  const { createAssemblyVersion } = useService(genomicsService);

  return (
    <AssemblyFormModal
      trigger={
        <button
          type="button"
          className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-300 bg-white p-8 text-center transition-colors hover:border-blue-400 hover:bg-blue-50/50"
        >
          <span className="flex size-10 items-center justify-center rounded-full bg-blue-50 text-blue-700">
            <Plus className="size-5" />
          </span>
          <span className="text-sm font-semibold text-slate-700">
            Add new Assembly
          </span>
        </button>
      }
      title="Add new Assembly"
      description={`Add a new assembly to version ${versionName}.`}
      submitLabel="Create"
      onSubmit={async ({ name, species }) => {
        const res = await createAssemblyVersion(versionName, { name, species });
        window.location.assign(
          `/admin/versions/${encodeURIComponent(versionName)}/species/${encodeURIComponent(res.data.species)}`,
        );
      }}
    />
  );
}
