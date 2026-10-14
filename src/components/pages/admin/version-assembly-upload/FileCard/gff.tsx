import { useRef, useState } from "react";

import useService from "@/hooks/useService";
import useUpload from "@/hooks/useUpload";
import genomicsService from "@/utils/services/genomics";
import { toastManager } from "@/components/ui/toaster";
import { ALLOWED_UPLOAD_FILE_TYPES, FileCardBase } from "./base";
import type { FileStatus } from "./base";
import GffUpload, { type GffMappingConfirmData } from "../GffUpload";

export const GffFileCard = ({
  file,
  versionName,
  assemblyId,
  canDelete,
  onRefresh,
  showStatusBadge = false,
}: {
  file: FileStatus;
  versionName?: string;
  assemblyId?: string | number;
  canDelete?: boolean;
  onRefresh?: () => void;
  showStatusBadge?: boolean;
}) => {
  const { deleteUploadFile } = useService(genomicsService);
  const { upload, progress: uploadProgress, isUploading } = useUpload();
  const [isDeleting, setIsDeleting] = useState(false);
  const [gffFileToUpload, setGffFileToUpload] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const canUpload = !!versionName && assemblyId !== undefined;

  const handleChooseFile = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
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

    setGffFileToUpload(selectedFile);
  };

  const handleGffMappingConfirm = async (
    mappingData: GffMappingConfirmData,
  ) => {
    if (!gffFileToUpload || !canUpload) return;

    try {
      await upload({
        file: gffFileToUpload,
        version: versionName as string,
        assembly: assemblyId as string | number,
        fileType: file.name,
        geneIDKey: mappingData.geneIDKey,
        trimPrefixChars: mappingData.trimPrefixChars,
        trimSuffixChars: mappingData.trimSuffixChars,
        oldGeneIDKeys: mappingData.oldGeneIDKeys.join(","),
        shouldResume: file.status === "PAUSED",
      });
      toastManager.add({
        type: "success",
        title: `Uploaded ${gffFileToUpload.name}`,
      });
      onRefresh?.();
    } catch (error) {
      console.error("GFF Upload failed:", error);
      toastManager.add({
        type: "error",
        title: `Failed to upload ${gffFileToUpload.name}`,
      });
    } finally {
      setGffFileToUpload(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
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
      showStatusBadge={showStatusBadge}
    >
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept=".gz,.bgz"
        onChange={handleFileChange}
      />
      <GffUpload
        file={gffFileToUpload}
        isOpen={gffFileToUpload !== null}
        onConfirm={handleGffMappingConfirm}
        onClose={() => {
          setGffFileToUpload(null);
          if (fileInputRef.current) fileInputRef.current.value = "";
        }}
        onUploadDifferentFile={() => {
          setGffFileToUpload(null);
          if (fileInputRef.current) {
            fileInputRef.current.value = "";
            fileInputRef.current.click();
          }
        }}
      />
    </FileCardBase>
  );
};
