import { useRef, useState } from "react";
import {
  AlertCircle,
  BookOpen,
  Braces,
  Database,
  FileText,
  Hash,
  Microscope,
  RefreshCw,
  Trash2,
  Upload,
} from "lucide-react";

import { cn } from "@/utils/classname";
import { ProgressBar } from "./ProgressBar";
import type { FileStatus } from "../mockData";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  "file-text": FileText,
  hash: Hash,
  microscope: Microscope,
  braces: Braces,
  database: Database,
  "book-open": BookOpen,
};

function FileIcon({ name, className }: { name: string; className?: string }) {
  const Icon = iconMap[name] ?? FileText;
  return <Icon className={className} />;
}

function parseSize(size: string): number {
  const match = /([\d.]+)\s*(B|KB|MB|GB|TB)/i.exec(size);
  if (!match) return 0;
  const value = parseFloat(match[1]);
  const multipliers: Record<string, number> = {
    B: 1,
    KB: 1024,
    MB: 1024 ** 2,
    GB: 1024 ** 3,
    TB: 1024 ** 4,
  };
  return value * (multipliers[match[2].toUpperCase()] ?? 1);
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const value = bytes / Math.pow(1024, i);
  return `${value.toFixed(value >= 10 || i === 0 ? 0 : 2)} ${units[i]}`;
}

export default function FileCard({
  file,
  canDelete = false,
  showStatusBadge = false,
  onDelete,
}: {
  file: FileStatus;
  canDelete?: boolean;
  showStatusBadge?: boolean;
  onDelete?: () => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  const isReady = !isUploading && file.status === "READY";
  const isPending = !isUploading && file.status === "PENDING";
  const isError = !isUploading && file.status === "ERROR";
  const isDisabled = !isUploading && file.status === "DISABLED";

  const effectiveProgress = isUploading ? uploadProgress : file.progress;
  const effectiveProgressTitle = isUploading ? "IN TRANSIT" : file.progressTitle;

  function handleChooseFile() {
    fileInputRef.current?.click();
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0];
    if (!selected) return;
    // TODO: Replace with real upload API when available.
    setIsUploading(true);
    setUploadProgress(0);
    let pct = 0;
    const timer = setInterval(() => {
      pct += 10;
      setUploadProgress(pct);
      if (pct >= 100) {
        clearInterval(timer);
        setIsUploading(false);
        setUploadProgress(0);
      }
    }, 200);
    e.target.value = "";
  }

  function handleDelete() {
    setIsDeleting(true);
    onDelete?.();
    setIsDeleting(false);
  }

  return (
    <div
      className={cn(
        "flex items-center gap-5 rounded-xl border border-slate-200 bg-white p-5 transition-shadow hover:shadow-sm",
        isError && "border-red-100 bg-red-50/30",
      )}
    >
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept=".gz,.bgz"
        onChange={handleFileChange}
      />

      {/* Round icon */}
      <div
        className={cn(
          "flex size-11 shrink-0 items-center justify-center rounded-full",
          isReady || isUploading
            ? "bg-blue-50 text-blue-600"
            : isPending || isDisabled
              ? "bg-slate-100 text-slate-400"
              : isError
                ? "bg-red-100 text-red-500"
                : "bg-orange-50 text-orange-500",
        )}
      >
        <FileIcon name={file.icon} className="size-5" />
      </div>

      {/* File info */}
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2">
          <h3 className="truncate font-bold text-slate-900">{file.name}</h3>
          {file.size && !isUploading && (
            <span className="shrink-0 text-sm text-slate-400">
              {parseSize(file.size) > 0
                ? formatBytes(parseSize(file.size))
                : file.size}
            </span>
          )}
          {isError && file.error && (
            <span title={file.error} className="text-red-500">
              <AlertCircle className="size-4 cursor-help" />
            </span>
          )}
        </div>
        <p className="mt-0.5 text-xs font-bold uppercase tracking-widest text-slate-400">
          {file.category}
        </p>
      </div>

      {/* Progress / action area */}
      <div className="flex w-1/2 items-center gap-4">
        {isUploading || (!isPending && !isDisabled && effectiveProgress !== undefined) ? (
          <ProgressBar
            progress={effectiveProgress ?? 0}
            title={effectiveProgressTitle || ""}
            theme={file.theme}
            showComplete={isReady}
          />
        ) : isError ? (
          <button
            onClick={handleChooseFile}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg border-2 border-dashed border-red-200 py-2 text-xs font-bold tracking-widest text-red-600 transition-all hover:border-red-300 hover:bg-red-50"
          >
            <RefreshCw className="size-4" />
            RE-UPLOAD
          </button>
        ) : isPending ? (
          <button
            onClick={handleChooseFile}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg border-2 border-dashed border-slate-200 py-2 text-xs font-bold tracking-widest text-slate-400 transition-all hover:border-slate-300 hover:bg-slate-50"
          >
            <Upload className="size-4" />
            CHOOSE FILE
          </button>
        ) : isDisabled ? (
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold uppercase tracking-widest text-slate-400">
            DISABLED
          </span>
        ) : null}

        {/* Delete button (optional sections) */}
        {canDelete && !isUploading && !isDisabled && (isReady || isError) && (
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="shrink-0 text-slate-300 transition-colors hover:text-red-500 disabled:opacity-50"
            title="Delete file"
          >
            <Trash2 className="size-5" />
          </button>
        )}

        {/* READY status pill — shown on main required files */}
        {showStatusBadge && isReady && (
          <span className="shrink-0 rounded-full bg-blue-700 px-4 py-1 text-xs font-bold uppercase tracking-widest text-white">
            READY
          </span>
        )}
      </div>
    </div>
  );
}
