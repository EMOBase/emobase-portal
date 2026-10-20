import type * as React from "react";
import { Tooltip } from "@base-ui/react/tooltip";
import {
  AlertCircle,
  ArrowLeftRight,
  BookOpen,
  Braces,
  ChartLine,
  Database,
  Dna,
  FileArchive,
  FileText,
  Hash,
  Microscope,
  RefreshCw,
  Syringe,
  Table,
  Trash2,
  Upload,
} from "lucide-react";

import { cn } from "@/utils/classname";
import { ProgressBar } from "./ProgressBar";

export interface FileStatus {
  id?: string;
  name: string;
  category: string;
  status:
    | "PENDING"
    | "UPLOADING"
    | "PAUSED"
    | "PROCESSING"
    | "READY"
    | "ERROR"
    | "DISABLED";
  progress?: number;
  progressTitle?: string;
  size?: string;
  error?: string;
  icon: string;
  theme?: "orange" | "blue";
}

export const ALLOWED_UPLOAD_FILE_TYPES = new Set([
  "genomic.fna",
  "genomic.gff",
  "rna.fna",
  "cds.fna",
  "protein.faa",
  "dsrna.csv",
  "jbrowse.track",
  "species.synonym",
]);

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  "file-text": FileText,
  hash: Hash,
  microscope: Microscope,
  braces: Braces,
  database: Database,
  "book-open": BookOpen,
  dna: Dna,
  syringe: Syringe,
  "chart-line": ChartLine,
  "arrow-left-right": ArrowLeftRight,
  tsv: Table,
  zip: FileArchive,
};

function FileIcon({ name, className }: { name: string; className?: string }) {
  const Icon = iconMap[name] ?? FileText;
  return <Icon className={className} />;
}

export const FileCardBase = ({
  file,
  isUploading,
  uploadProgress,
  canUpload = false,
  onChooseFile,
  onDelete,
  isDeleting = false,
  cardSize = "md",
  children,
}: {
  file: FileStatus;
  isUploading: boolean;
  uploadProgress: number;
  canUpload?: boolean;
  onChooseFile?: () => void;
  onDelete?: () => void;
  isDeleting?: boolean;
  cardSize?: "sm" | "md";
  children?: React.ReactNode;
}) => {
  const isReady = !isUploading && file.status === "READY";
  const isPending = !isUploading && file.status === "PENDING";
  const isError = !isUploading && file.status === "ERROR";
  const isDisabled = !isUploading && file.status === "DISABLED";
  const isPaused = !isUploading && file.status === "PAUSED";

  const effectiveProgress = isUploading ? uploadProgress : file.progress;
  const effectiveProgressTitle = isUploading
    ? "IN TRANSIT"
    : file.progressTitle;

  const effectiveStatus = isUploading ? "UPLOADING" : file.status;

  return (
    <div
      className={cn(
        "flex items-center border border-slate-200 bg-white transition-shadow hover:shadow-sm",
        cardSize === "sm" ? "gap-4 rounded-lg p-4" : "gap-5 rounded-xl p-5",
        isError && "border-red-100 bg-red-50/30",
      )}
    >
      {children}

      {/* Round icon */}
      <div
        className={cn(
          "flex shrink-0 items-center justify-center",
          cardSize === "sm" ? "size-9 rounded-lg" : "size-11 rounded-full",
          isReady
            ? "bg-blue-50 text-blue-600"
            : isUploading || isPending || isPaused || isDisabled
              ? "bg-slate-100 text-slate-400"
              : isError
                ? "bg-red-100 text-red-500"
                : "bg-orange-50 text-orange-500",
        )}
      >
        <FileIcon
          name={file.icon}
          className={cardSize === "sm" ? "size-4" : "size-5"}
        />
      </div>

      {/* File info */}
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2">
          <h3
            className={cn(
              "truncate font-bold text-slate-900",
              cardSize === "sm" && "text-sm",
            )}
          >
            {file.name}
          </h3>
          {file.size && !isUploading && (
            <span
              className={cn(
                "shrink-0 text-slate-400",
                cardSize === "sm" ? "text-xs" : "text-sm",
              )}
            >
              {file.size}
            </span>
          )}
          {isError && file.error && (
            <Tooltip.Provider>
              <Tooltip.Root>
                <Tooltip.Trigger
                  type="button"
                  aria-label="Upload error"
                  className="relative shrink-0 cursor-help self-center text-red-500"
                >
                  <AlertCircle
                    className={cardSize === "sm" ? "size-3.5" : "size-4"}
                  />
                </Tooltip.Trigger>
                <Tooltip.Portal>
                  <Tooltip.Positioner
                    side="top"
                    sideOffset={6}
                    className="z-50"
                  >
                    <Tooltip.Popup className="max-w-xs break-words rounded-md bg-slate-900 px-2 py-1 text-xs font-medium text-white shadow-md outline-none">
                      {file.error}
                    </Tooltip.Popup>
                  </Tooltip.Positioner>
                </Tooltip.Portal>
              </Tooltip.Root>
            </Tooltip.Provider>
          )}
        </div>
        <p
          className={cn(
            "mt-0.5 font-bold uppercase tracking-widest text-slate-400",
            cardSize === "sm" ? "text-[10px]" : "text-xs",
          )}
        >
          {file.category}
        </p>
      </div>

      {/* Progress / action area */}
      <div
        className={cn(
          "flex w-1/2 items-center",
          cardSize === "sm" ? "gap-3" : "gap-4",
        )}
      >
        {isUploading ? (
          <ProgressBar
            progress={effectiveProgress ?? 0}
            title={effectiveProgressTitle || ""}
            theme="gray"
            showComplete={isReady}
            size={cardSize}
          />
        ) : isError && canUpload ? (
          <button
            onClick={onChooseFile}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg border-2 border-dashed border-red-200 py-2 text-xs font-bold tracking-widest text-red-600 transition-all hover:border-red-300 hover:bg-red-50"
          >
            <RefreshCw className="size-4" />
            RE-UPLOAD
          </button>
        ) : isPaused && canUpload ? (
          <button
            onClick={onChooseFile}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg border-2 border-dashed border-orange-200 py-2 text-xs font-bold tracking-widest text-orange-700 transition-all hover:border-orange-300 hover:bg-orange-50"
          >
            <Upload className="size-4" />
            RESUME UPLOAD
          </button>
        ) : isDisabled ? (
          <div className="ml-auto flex w-32 shrink-0 justify-end">
            <span className="rounded-sm bg-slate-100 px-3 py-1 text-xs font-bold uppercase tracking-widest text-slate-400">
              DISABLED
            </span>
          </div>
        ) : !isPending && effectiveProgress !== undefined ? (
          <ProgressBar
            progress={effectiveProgress}
            title={effectiveProgressTitle || ""}
            theme={isError ? "red" : isPaused ? "gray" : file.theme}
            showComplete={isReady}
            showError={isError}
            size={cardSize}
          />
        ) : isPending && canUpload ? (
          <button
            onClick={onChooseFile}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg border-2 border-dashed border-slate-200 py-2 text-xs font-bold tracking-widest text-slate-400 transition-all hover:border-slate-300 hover:bg-slate-50"
          >
            <Upload className="size-4" />
            CHOOSE FILE
          </button>
        ) : null}

        {/* Small cards always reserve a fixed-width trailing slot (for the
            delete button) so the progress bar keeps the same width across every
            state — including while uploading, before the file is listed. */}
        {cardSize === "sm" ? (
          <div className="flex w-8 shrink-0 justify-center">
            {onDelete &&
              !isUploading &&
              !isDisabled &&
              (isReady ||
                isError ||
                isPaused ||
                file.status === "UPLOADING") && (
                <button
                  onClick={onDelete}
                  disabled={isDeleting}
                  className="text-slate-300 transition-colors hover:text-red-500 disabled:opacity-50"
                  title="Delete file"
                >
                  <Trash2 className="size-4" />
                </button>
              )}
          </div>
        ) : (
          !isDisabled && (
            <div className="flex w-32 shrink-0 justify-end">
              <span
                className={cn(
                  "rounded-sm px-4 py-1 text-xs font-bold whitespace-nowrap uppercase tracking-widest",
                  isReady
                    ? "bg-blue-700 text-white"
                    : isPending || isPaused
                      ? "bg-slate-100 text-slate-400"
                      : isError
                        ? "bg-red-100 text-red-600"
                        : "bg-orange-100 text-orange-600",
                )}
              >
                {effectiveStatus}
              </span>
            </div>
          )
        )}
      </div>
    </div>
  );
};
