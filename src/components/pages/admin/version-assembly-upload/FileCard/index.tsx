import { useRef, useState } from "react";

import useService from "@/hooks/useService";
import useUpload from "@/hooks/useUpload";
import genomicsService from "@/utils/services/genomics";
import { toastManager } from "@/components/ui/toaster";
import { ALLOWED_UPLOAD_FILE_TYPES, FileCardBase } from "./base";
import type { FileStatus } from "./base";

export type { FileStatus };
export { ALLOWED_UPLOAD_FILE_TYPES } from "./base";

export { GffFileCard } from "./gff";
export { JBrowseTrackFileCard } from "./jbrowseTrack";
export { SynonymFileCard } from "./synonym";

export const FileCard = ({
  file,
  versionName,
  assemblyId,
  canDelete,
  onRefresh,
  size = "md",
}: {
  file: FileStatus;
  versionName?: string;
  assemblyId?: string | number;
  canDelete?: boolean;
  onRefresh?: () => void;
  size?: "sm" | "md";
}) => {
  const { deleteUploadFile } = useService(genomicsService);
  const { upload, progress: uploadProgress, isUploading } = useUpload();
  const [isDeleting, setIsDeleting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const canUpload = !!versionName && assemblyId !== undefined;

  const handleChooseFile = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    if (!ALLOWED_UPLOAD_FILE_TYPES.has(file.name)) {
      toastManager.add({
        type: "error",
        title: `Unsupported upload type: ${file.name}`,
      });
      event.target.value = "";
      return;
    }

    if (
      !selectedFile.name.endsWith(".gz") &&
      !selectedFile.name.endsWith(".bgz")
    ) {
      toastManager.add({
        type: "error",
        title: "Only .gz or .bgz files are accepted",
      });
      event.target.value = "";
      return;
    }

    if (!canUpload) return;

    try {
      await upload({
        file: selectedFile,
        version: versionName as string,
        assembly: assemblyId as string | number,
        fileType: file.name,
        shouldResume: file.status === "PAUSED",
      });
      toastManager.add({
        type: "success",
        title: `Uploaded ${selectedFile.name}`,
      });
      onRefresh?.();
    } catch (error) {
      console.error("Upload failed:", error);
      toastManager.add({
        type: "error",
        title: `Failed to upload ${selectedFile.name}`,
      });
    } finally {
      event.target.value = "";
    }
  };

  const handleDelete = async () => {
    if (!file.id) return;

    setIsDeleting(true);

    try {
      await deleteUploadFile(file.id);
      toastManager.add({ type: "success", title: "File deletion initiated" });
      onRefresh?.();
    } catch (error: any) {
      console.error("Delete failed:", error);
      toastManager.add({
        type: "error",
        title: error?.message || "Failed to delete file",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <FileCardBase
      file={file}
      isUploading={isUploading}
      uploadProgress={uploadProgress}
      canUpload={canUpload}
      onChooseFile={handleChooseFile}
      onDelete={canDelete && file.id ? handleDelete : undefined}
      isDeleting={isDeleting}
      cardSize={size}
    >
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept=".gz,.bgz"
        onChange={handleFileChange}
      />
    </FileCardBase>
  );
};
