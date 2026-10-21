import * as React from "react";
import { Files } from "lucide-react";

import { BatchOrthologyDialog } from "./BatchOrthologyDialog";
import { triggerClassName } from "./styles";
import type { OnBatchConfirm } from "./types";

export function AddBatchOrthologyButton({
  onConfirm,
}: {
  onConfirm?: OnBatchConfirm;
}) {
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <button
        type="button"
        className={triggerClassName}
        onClick={() => setOpen(true)}
      >
        <Files className="size-4" strokeWidth={2.5} />
        Add Batch
      </button>
      <BatchOrthologyDialog
        open={open}
        onOpenChange={setOpen}
        onConfirm={onConfirm}
      />
    </>
  );
}
