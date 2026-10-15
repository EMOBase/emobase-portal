import { useEffect } from "react";

import useUpload from "@/hooks/useUpload";
import { toastManager } from "@/components/ui/toaster";
import { FileCardBase } from "@/components/pages/admin/version-assembly-upload/FileCard/base";

export const OrthologyFileCard = ({
  file,
  versionName,
  order,
  algorithm,
  onComplete,
  size = "sm",
}: {
  file: File;
  versionName: string;
  order: number;
  algorithm: string;
  onComplete: () => void;
  size?: "sm" | "md";
}) => {
  const { upload, progress, isUploading, error } = useUpload();

  useEffect(() => {
    let cancelled = false;

    upload({
      file,
      version: versionName,
      fileType: "orthology.tsv",
      order,
      algorithm,
    })
      .then(() => {
        if (!cancelled) {
          toastManager.add({
            type: "success",
            title: `Uploaded ${file.name}`,
          });
          onComplete();
        }
      })
      .catch((err: any) => {
        if (!cancelled) {
          console.error("Upload failed:", err);
          toastManager.add({
            type: "error",
            title: `Failed to upload ${file.name}`,
          });
        }
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <FileCardBase
      file={{
        name: file.name,
        category: "Orthology Mapping",
        icon: "tsv",
        status: error ? "ERROR" : "UPLOADING",
        progress,
        progressTitle: "IN TRANSIT",
        error: error ?? "",
      }}
      isUploading={isUploading}
      uploadProgress={progress}
      cardSize={size}
    />
  );
};
