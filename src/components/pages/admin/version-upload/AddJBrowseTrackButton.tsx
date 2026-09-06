import * as React from "react";
import { Dialog } from "@base-ui/react/dialog";
import { CloudUpload, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function AddJBrowseTrackButton({
  onConfirm,
}: {
  onConfirm?: (
    file: File,
    trackName: string,
    category?: string,
    selectInDefaultSession?: boolean,
  ) => void;
}) {
  const [open, setOpen] = React.useState(false);
  const [file, setFile] = React.useState<File | null>(null);
  const [trackName, setTrackName] = React.useState("");
  const [category, setCategory] = React.useState("");
  const [selectInDefaultSession, setSelectInDefaultSession] =
    React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  function handleConfirm() {
    if (!file) {
      setError("Please choose a track file");
      return;
    }
    if (!trackName.trim()) {
      setError("Track name is required");
      return;
    }
    onConfirm?.(
      file,
      trackName.trim(),
      category.trim() || undefined,
      selectInDefaultSession,
    );
    setOpen(false);
    setFile(null);
    setTrackName("");
    setCategory("");
    setSelectInDefaultSession(false);
    setError(null);
  }

  return (
    <Dialog.Root open={open} onOpenChange={(next) => setOpen(next)}>
      <Dialog.Trigger
        render={
          <button
            type="button"
            className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-800 hover:bg-slate-50"
          >
            <Plus className="size-4" strokeWidth={2.5} />
            Add Track
          </button>
        }
      />
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-slate-900/40" />
        <Dialog.Popup className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg border border-slate-200 bg-white p-6 shadow-lg outline-none">
          <Dialog.Title className="text-xl font-bold text-slate-900 mb-1.5">
            Add JBrowse2 Track
          </Dialog.Title>
          <Dialog.Description className="text-sm text-slate-500 mb-6">
            Upload a visualisation track for the JBrowse2 genome browser.
          </Dialog.Description>

          <div className="mb-4">
            <label
              className="mb-1.5 block text-sm font-medium text-slate-700"
              htmlFor="jbrowse-track-file"
            >
              Track File
            </label>
            <Input
              id="jbrowse-track-file"
              type="file"
              accept=".bw,.bgz,.gz"
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
              htmlFor="jbrowse-track-name"
            >
              Track Name
            </label>
            <Input
              id="jbrowse-track-name"
              value={trackName}
              onChange={(e) => {
                setTrackName(e.target.value);
                if (error) setError(null);
              }}
              placeholder="e.g., Coverage track"
            />
          </div>

          <div className="mb-4">
            <label
              className="mb-1.5 block text-sm font-medium text-slate-700"
              htmlFor="jbrowse-track-category"
            >
              Category <span className="text-slate-400">(optional)</span>
            </label>
            <Input
              id="jbrowse-track-category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="e.g., Functional annotation"
            />
          </div>

          <label className="flex items-center gap-2 text-sm text-slate-600">
            <input
              type="checkbox"
              checked={selectInDefaultSession}
              onChange={(e) => setSelectInDefaultSession(e.target.checked)}
              className="size-4 rounded border-slate-300"
            />
            Select this track in default session
          </label>

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
