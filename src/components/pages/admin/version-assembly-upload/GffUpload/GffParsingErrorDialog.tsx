import * as React from "react";
import { Dialog } from "@base-ui/react/dialog";
import { CircleAlert, Upload, X } from "lucide-react";

import { Button } from "@/components/ui/button";

type GffParsingErrorDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  error: string;
  onUploadDifferentFile: () => void;
};

export const GffParsingErrorDialog: React.FC<GffParsingErrorDialogProps> = ({
  isOpen,
  onClose,
  error,
  onUploadDifferentFile,
}) => {
  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-slate-900/40" />
        <Dialog.Popup className="fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg outline-none">
          <div className="flex items-center justify-between border-b border-slate-200/60 bg-slate-100/80 px-6 py-4">
            <Dialog.Title className="font-display text-sm font-bold tracking-tight text-blue-700">
              GFF File Parsing Error
            </Dialog.Title>
            <Dialog.Close className="flex cursor-pointer rounded-sm text-slate-400 transition-opacity hover:text-slate-600 focus:outline-none">
              <X className="size-5" />
              <span className="sr-only">Close</span>
            </Dialog.Close>
          </div>

          <div className="flex flex-col items-center px-8 py-8 text-center">
            <div className="mb-5 flex size-14 items-center justify-center rounded-2xl bg-red-50">
              <CircleAlert className="size-6 text-red-600" />
            </div>

            <h3 className="mb-3 font-display text-2xl font-bold tracking-tight text-slate-900">
              Unable to Parse GFF File
            </h3>

            <p className="mb-8 max-w-lg text-sm leading-relaxed text-slate-500">
              We were unable to extract valid attributes from your file. The
              genomic structure provided does not align with the required
              specification for parsing.
            </p>

            <div className="flex w-full gap-3 rounded-r-2xl border-l-4 border-red-600 bg-blue-50/40 p-5 text-left">
              <div className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded bg-red-100 text-red-600">
                <CircleAlert className="size-3.5" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Error Details
                </span>
                <code className="block whitespace-pre-wrap break-words font-mono text-xs leading-relaxed text-slate-800">
                  {error}
                </code>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-slate-100 px-8 py-5">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="button" onClick={onUploadDifferentFile}>
              <Upload className="size-4" />
              Upload Different File
            </Button>
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
