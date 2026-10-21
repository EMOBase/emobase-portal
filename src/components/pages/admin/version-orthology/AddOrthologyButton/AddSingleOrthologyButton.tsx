import * as React from "react";
import { FilePlusCorner } from "lucide-react";

import { SingleOrthologyDialog } from "./SingleOrthologyDialog";
import { triggerClassName } from "./styles";
import type { OnConfirm } from "./types";

export function AddSingleOrthologyButton({
  onConfirm,
}: {
  onConfirm?: OnConfirm;
}) {
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <button
        type="button"
        className={triggerClassName}
        onClick={() => setOpen(true)}
      >
        <FilePlusCorner className="size-4" strokeWidth={2.5} />
        Add Single Dataset
      </button>
      <SingleOrthologyDialog
        open={open}
        onOpenChange={setOpen}
        onConfirm={onConfirm}
      />
    </>
  );
}
