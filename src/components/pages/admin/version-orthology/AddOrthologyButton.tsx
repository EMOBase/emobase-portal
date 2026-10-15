import * as React from "react";
import { Dialog } from "@base-ui/react/dialog";
import { CloudUpload, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function AddOrthologyButton({
  onConfirm,
}: {
  onConfirm?: (file: File, order: number, algorithm: string) => void;
}) {
  const [open, setOpen] = React.useState(false);
  const [file, setFile] = React.useState<File | null>(null);
  const [order, setOrder] = React.useState("1");
  const [algorithm, setAlgorithm] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);

  function reset() {
    setFile(null);
    setOrder("1");
    setAlgorithm("");
    setError(null);
  }

  function handleConfirm() {
    if (!file) {
      setError("Please select a file to upload");
      return;
    }
    if (!file.name.endsWith(".gz") && !file.name.endsWith(".gzip")) {
      setError("Only .gz or .gzip files are accepted");
      return;
    }
    const orderValue = Number(order);
    if (
      order.trim() === "" ||
      Number.isNaN(orderValue) ||
      orderValue <= 0 ||
      !Number.isInteger(orderValue)
    ) {
      setError("Please enter a valid positive integer for Display Order");
      return;
    }
    if (!algorithm.trim()) {
      setError("Please enter an algorithm name");
      return;
    }

    onConfirm?.(file, orderValue, algorithm.trim());
    setOpen(false);
    reset();
  }

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) reset();
      }}
    >
      <Dialog.Trigger
        render={
          <button
            type="button"
            className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-800 hover:bg-slate-50"
          >
            <Plus className="size-4" strokeWidth={2.5} />
            Add Orthology Dataset
          </button>
        }
      />
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-slate-900/40" />
        <Dialog.Popup className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-md border border-slate-200 bg-white p-6 shadow-lg outline-none">
          <Dialog.Title className="text-xl font-bold text-slate-900 mb-1.5">
            Add Orthology Dataset
          </Dialog.Title>
          <Dialog.Description className="text-sm text-slate-500 mb-6">
            Upload a compressed orthology mapping dataset. It is shared across
            every species in this version.
          </Dialog.Description>

          <div className="mb-4">
            <label
              className="mb-1.5 block text-sm font-medium text-slate-700"
              htmlFor="orthology-file"
            >
              Source File
            </label>
            <Input
              id="orthology-file"
              type="file"
              accept=".gz,.gzip"
              onChange={(e) => {
                setFile(e.target.files?.[0] ?? null);
                if (error) setError(null);
              }}
              aria-invalid={error && !file ? true : undefined}
            />
            {error && !file ? (
              <p className="mt-1 text-sm text-destructive">{error}</p>
            ) : null}
          </div>

          <div className="mb-4">
            <label
              className="mb-1.5 block text-sm font-medium text-slate-700"
              htmlFor="orthology-order"
            >
              Display Order
            </label>
            <Input
              id="orthology-order"
              type="number"
              min="1"
              step="1"
              value={order}
              onChange={(e) => {
                setOrder(e.target.value);
                if (error) setError(null);
              }}
              placeholder="e.g., 1"
            />
          </div>

          <div className="mb-4">
            <label
              className="mb-1.5 block text-sm font-medium text-slate-700"
              htmlFor="orthology-algorithm"
            >
              Algorithm
            </label>
            <Input
              id="orthology-algorithm"
              value={algorithm}
              onChange={(e) => {
                setAlgorithm(e.target.value);
                if (error) setError(null);
              }}
              placeholder="e.g., OrthoFinder 2.0"
            />
          </div>

          {error && file ? (
            <p className="mt-1 mb-2 text-sm text-destructive">{error}</p>
          ) : null}

          <div className="mt-6 flex justify-end gap-2">
            <Dialog.Close render={<Button variant="outline">Cancel</Button>} />
            <Button variant="default" onClick={handleConfirm}>
              <CloudUpload className="h-4 w-4" />
              Confirm & Upload
            </Button>
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
