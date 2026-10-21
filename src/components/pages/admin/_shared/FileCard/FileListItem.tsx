import { useEffect } from "react";

import useUpload from "@/hooks/useUpload";
import type { UploadInput } from "@/utils/upload";
import { toastManager } from "@/components/ui/toaster";
import { FileCardBase } from "./FileCardBase";

export const FileListItem = ({
  file,
  uploadArgs,
  category,
  icon,
  onComplete,
  size = "sm",
}: {
  file: File;
  uploadArgs: Omit<UploadInput, "file" | "onProgress">;
  category: string;
  icon: string;
  onComplete: () => void;
  size?: "sm" | "md";
}) => {
  const { upload, progress, isUploading, error } = useUpload();

  useEffect(() => {
    let cancelled = false;

    upload({ file, ...uploadArgs })
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
        category,
        icon,
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
