import { useEffect } from "react";

import useUpload from "@/hooks/useUpload";
import { toastManager } from "@/components/ui/toaster";
import { FileCardBase } from "@/components/pages/admin/version-assembly-upload/FileCard/base";

export const OrthologyFileCard = ({
  file,
  versionName,
  fileType = "orthology.tsv",
  order,
  algorithm,
  onComplete,
  size = "sm",
}: {
  file: File;
  versionName: string;
  fileType?: "orthology.tsv" | "orthology.bundle";
  order?: number;
  algorithm?: string;
  onComplete: () => void;
  size?: "sm" | "md";
}) => {
  const { upload, progress, isUploading, error } = useUpload();
  const isBundle = fileType === "orthology.bundle";

  useEffect(() => {
    let cancelled = false;

    upload({
      file,
      version: versionName,
      fileType,
      order,
      algorithm,
    })
      .then(() => {
        if (!cancelled) {
          // For bundles, the floating processing panel appearing is the
          // success signal — a toast would be redundant noise on top of it.
          if (!isBundle) {
            toastManager.add({
              type: "success",
              title: `Uploaded ${file.name}`,
            });
          }
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
        category: isBundle ? "Orthology Bundle" : "Orthology Mapping",
        icon: isBundle ? "zip" : "tsv",
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
