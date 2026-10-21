import * as React from "react";
import { Menu } from "@base-ui/react/menu";
import { ChevronDown, FilePlusCorner, Files, Plus } from "lucide-react";

import { BatchOrthologyDialog } from "./BatchOrthologyDialog";
import { SingleOrthologyDialog } from "./SingleOrthologyDialog";
import { triggerClassName } from "./styles";
import type { OnBatchConfirm, OnConfirm } from "./types";

export default function AddOrthologyButton({
  onConfirm,
  onBatchConfirm,
}: {
  onConfirm?: OnConfirm;
  onBatchConfirm?: OnBatchConfirm;
}) {
  const [singleOpen, setSingleOpen] = React.useState(false);
  const [batchOpen, setBatchOpen] = React.useState(false);

  return (
    <>
      <Menu.Root>
        <Menu.Trigger
          render={
            <button type="button" className={triggerClassName}>
              <Plus className="size-4" strokeWidth={2.5} />
              Add Orthology
              <ChevronDown className="size-3.5 text-slate-400" />
            </button>
          }
        />
        <Menu.Portal>
          <Menu.Positioner
            align="end"
            sideOffset={8}
            className="z-50 outline-none"
          >
            <Menu.Popup className="min-w-56 rounded-lg border border-slate-200 bg-white p-1.5 shadow-lg">
              <Menu.Item
                onClick={() => setSingleOpen(true)}
                className="flex cursor-pointer items-center gap-2 rounded-md px-2.5 py-1.5 text-sm text-slate-700 outline-none data-[highlighted]:bg-muted"
              >
                <FilePlusCorner className="h-4 w-4" />
                Add Single Dataset
              </Menu.Item>
              <Menu.Item
                onClick={() => setBatchOpen(true)}
                className="flex cursor-pointer items-center gap-2 rounded-md px-2.5 py-1.5 text-sm text-slate-700 outline-none data-[highlighted]:bg-muted"
              >
                <Files className="h-4 w-4" />
                Add Batch
              </Menu.Item>
            </Menu.Popup>
          </Menu.Positioner>
        </Menu.Portal>
      </Menu.Root>

      <SingleOrthologyDialog
        open={singleOpen}
        onOpenChange={setSingleOpen}
        onConfirm={onConfirm}
      />
      <BatchOrthologyDialog
        open={batchOpen}
        onOpenChange={setBatchOpen}
        onConfirm={onBatchConfirm}
      />
    </>
  );
}
