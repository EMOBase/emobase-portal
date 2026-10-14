import { useEffect } from "react";

import useUpload from "@/hooks/useUpload";
import { toastManager } from "@/components/ui/toaster";
import { FileCardBase } from "./base";

export const JBrowseTrackFileCard = ({
  file,
  versionName,
  assemblyId,
  trackName,
  category,
  selectInDefaultSession,
  onComplete,
}: {
  file: File;
  versionName: string;
  assemblyId: string | number;
  trackName: string;
  category?: string;
  selectInDefaultSession?: boolean;
  onComplete: () => void;
}) => {
  const { upload, progress, isUploading, error } = useUpload();

  useEffect(() => {
    let cancelled = false;

    upload({
      file,
      version: versionName,
      assembly: assemblyId,
      fileType: "jbrowse.track",
      trackName,
      category,
      selectInDefaultSession,
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
        category: trackName,
        icon: "database",
        status: error ? "ERROR" : "UPLOADING",
        progress,
        progressTitle: "IN TRANSIT",
        error: error ?? "",
      }}
      isUploading={isUploading}
      uploadProgress={progress}
    />
  );
};
