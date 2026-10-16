import { ArrowRight, Pencil, Trash2 } from "lucide-react";
import { Tooltip } from "@base-ui/react/tooltip";

import AssemblyFormModal, {
  type AssemblyFormValues,
} from "./AssemblyFormModal";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { cn } from "@/utils/classname";
import placeholderImage from "@/assets/species/placeholder.svg?url";

export type AssemblyCardItem = {
  id: string | number;
  name: string;
  species: string;
  image?: string;
  size?: string;
  siteUrl?: string;
};

export default function SpeciesCard({
  species,
  href,
  onSubmit,
  onDelete,
}: {
  species: AssemblyCardItem;
  href?: string;
  onSubmit?: (values: AssemblyFormValues) => Promise<unknown> | void;
  onDelete?: () => Promise<unknown> | void;
}) {
  return (
    <article className="relative flex flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md">
      {href ? (
        <a
          href={href}
          aria-label={`Manage assembly data for ${species.name}`}
          className="group/anchor absolute inset-0 z-10"
        >
          <div className="pointer-events-none absolute inset-x-0 top-3 flex justify-center opacity-0 transition-opacity duration-200 group-hover/anchor:opacity-100">
            <span className="flex items-center gap-1.5 rounded-full bg-slate-900/75 px-3 py-1 text-xs font-medium text-white shadow-sm">
              Manage assembly data
              <ArrowRight className="size-3.5" />
            </span>
          </div>
        </a>
      ) : null}

      <div className="relative h-52 overflow-hidden border-b border-slate-200 bg-slate-100">
        <img
          src={species.image ?? placeholderImage}
          alt={species.species}
          className="absolute inset-0 h-full w-full object-cover"
        />
      </div>

      <div className="flex flex-grow flex-col p-6">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="text-xl font-bold text-gray-900">{species.name}</h3>
            <p className="italic text-slate-500">{species.species}</p>
          </div>

          <div className="flex shrink-0 items-center gap-1">
            <Tooltip.Provider>
              <Tooltip.Root>
                <AssemblyFormModal
                  trigger={
                    <Tooltip.Trigger
                      type="button"
                      aria-label={`Edit ${species.name}`}
                      className="relative z-20 rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
                    >
                      <Pencil className="size-4" />
                    </Tooltip.Trigger>
                  }
                  title="Update Assembly"
                  description={`Update the details for ${species.name}.`}
                  submitLabel="Save"
                  defaultValues={{
                    name: species.name,
                    species: species.species,
                  }}
                  onSubmit={onSubmit ?? (() => {})}
                />
                <Tooltip.Portal>
                  <Tooltip.Positioner side="bottom" sideOffset={6}>
                    <Tooltip.Popup className="z-50 rounded-md bg-slate-900 px-2 py-1 text-xs font-medium text-white shadow-md outline-none">
                      Edit
                    </Tooltip.Popup>
                  </Tooltip.Positioner>
                </Tooltip.Portal>
              </Tooltip.Root>
            </Tooltip.Provider>

            <Tooltip.Provider>
              <Tooltip.Root>
                <ConfirmDialog
                  trigger={
                    <Tooltip.Trigger
                      type="button"
                      aria-label={`Delete ${species.name}`}
                      className="relative z-20 rounded-lg p-2 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 className="size-4" />
                    </Tooltip.Trigger>
                  }
                  title="Delete assembly"
                  description={`Are you sure you want to delete ${species.name}? This action cannot be undone.`}
                  confirmLabel="Delete"
                  destructive
                  onConfirm={onDelete ?? (() => {})}
                />
                <Tooltip.Portal>
                  <Tooltip.Positioner side="bottom" sideOffset={6}>
                    <Tooltip.Popup className="z-50 rounded-md bg-slate-900 px-2 py-1 text-xs font-medium text-white shadow-md outline-none">
                      Delete
                    </Tooltip.Popup>
                  </Tooltip.Positioner>
                </Tooltip.Portal>
              </Tooltip.Root>
            </Tooltip.Provider>
          </div>
        </div>

        <dl className="mt-5 space-y-1 text-sm text-slate-600">
          <div className="flex min-w-0 gap-1.5">
            <dt className="shrink-0">Size:</dt>
            <dd className="truncate font-medium text-slate-800">
              {species.size || "0 B"}
            </dd>
          </div>
          <div className="flex min-w-0 gap-1.5">
            <dt className="shrink-0">Link:</dt>
            <dd
              className={cn(
                "font-medium",
                species.siteUrl
                  ? "truncate text-slate-800"
                  : "italic font-normal text-slate-400",
              )}
              title={species.siteUrl || undefined}
            >
              {species.siteUrl || "Not set"}
            </dd>
          </div>
        </dl>
      </div>
    </article>
  );
}
