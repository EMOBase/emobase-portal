import * as React from "react";
import { Dialog } from "@base-ui/react/dialog";
import { Loader2, Trash2, Upload } from "lucide-react";

import { Button } from "@/components/ui/button";
import { FileInput } from "@/components/ui/file-input";
import placeholderImage from "@/assets/placeholder.svg?url";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = ["image/png", "image/jpeg", "image/webp"];

type AssemblyImageModalProps = {
  trigger: React.ReactElement;
  title: string;
  description?: React.ReactNode;
  currentImageUrl?: string | null;
  onSubmit: (file: File) => Promise<unknown> | void;
  onRemove?: () => Promise<unknown> | void;
};

export default function AssemblyImageModal({
  trigger,
  title,
  description,
  currentImageUrl,
  onSubmit,
  onRemove,
}: AssemblyImageModalProps) {
  const [open, setOpen] = React.useState(false);
  const [file, setFile] = React.useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);
  const [submitting, setSubmitting] = React.useState(false);
  const [removing, setRemoving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const busy = submitting || removing;
  const hasImage = Boolean(currentImageUrl);

  function revokePreview() {
    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
  }

  function reset() {
    revokePreview();
    setFile(null);
    setError(null);
    setSubmitting(false);
    setRemoving(false);
  }

  function handleOpenChange(next: boolean) {
    if (busy) return;
    setOpen(next);
    if (!next) reset();
  }

  function handleFiles(files: File[]) {
    const selected = files[0] ?? null;
    revokePreview();
    setFile(null);
    if (!selected) return;
    if (!ACCEPTED_IMAGE_TYPES.includes(selected.type)) {
      setError("Image must be a PNG, JPEG or WebP file");
      return;
    }
    if (selected.size > MAX_IMAGE_SIZE) {
      setError("Image must be at most 5 MiB");
      return;
    }
    setFile(selected);
    setPreviewUrl(URL.createObjectURL(selected));
    setError(null);
  }

  async function handleSubmit() {
    if (!file) {
      setError("Please choose an image");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await onSubmit(file);
      setOpen(false);
      reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setSubmitting(false);
    }
  }

  async function handleRemove() {
    setRemoving(true);
    setError(null);
    try {
      await onRemove?.();
      setOpen(false);
      reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setRemoving(false);
    }
  }

  const shownImage = previewUrl ?? currentImageUrl ?? placeholderImage;

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Trigger render={trigger} />
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-slate-900/40" />
        <Dialog.Popup className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-md border border-slate-200 bg-white p-6 shadow-lg outline-none">
          <Dialog.Title className="text-xl font-bold text-slate-900 mb-1.5">
            {title}
          </Dialog.Title>
          {description ? (
            <Dialog.Description className="text-sm text-slate-500 mb-6">
              {description}
            </Dialog.Description>
          ) : null}

          <div className="mb-4 overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
            <img src={shownImage} alt="" className="h-48 w-full object-cover" />
          </div>

          <div className="mb-4">
            <label
              htmlFor="assembly-image"
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              Image
            </label>
            <FileInput
              id="assembly-image"
              accept="image/png,image/jpeg,image/webp"
              value={file}
              onFiles={handleFiles}
              disabled={busy}
              placeholder="Choose an image…"
              aria-invalid={error ? true : undefined}
            />
            <p className="mt-1 text-xs text-slate-500">
              PNG, JPEG or WebP, up to 5 MiB.
            </p>
          </div>

          {error ? (
            <p className="mb-4 text-sm text-destructive">{error}</p>
          ) : null}

          <div className="flex items-center justify-between gap-2">
            {hasImage && onRemove ? (
              <Button
                variant="destructive"
                onClick={handleRemove}
                disabled={busy}
              >
                {removing ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <Trash2 className="size-4" />
                )}
                Remove
              </Button>
            ) : (
              <span />
            )}

            <div className="flex gap-2">
              <Dialog.Close
                render={
                  <Button variant="outline" disabled={busy}>
                    Cancel
                  </Button>
                }
              />
              <Button
                variant="default"
                onClick={handleSubmit}
                disabled={busy || !file}
              >
                {submitting ? (
                  <>
                    <Loader2 className="animate-spin" />
                    Uploading
                  </>
                ) : (
                  <>
                    <Upload className="size-4" />
                    {hasImage ? "Replace" : "Upload"}
                  </>
                )}
              </Button>
            </div>
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
