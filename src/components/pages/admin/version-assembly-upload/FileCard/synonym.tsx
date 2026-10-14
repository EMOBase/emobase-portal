import { useEffect } from "react";

import useUpload from "@/hooks/useUpload";
import { toastManager } from "@/components/ui/toaster";
import { FileCardBase } from "./base";

export const SynonymFileCard = ({
  file,
  versionName,
  assemblyId,
  species,
  onComplete,
}: {
  file: File;
  versionName: string;
  assemblyId: string | number;
  species: string;
  onComplete: () => void;
}) => {
  const { upload, progress, isUploading, error } = useUpload();

  useEffect(() => {
    let cancelled = false;

    upload({
      file,
      version: versionName,
      assembly: assemblyId,
      fileType: "species.synonym",
      species,
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
        category: "Synonyms",
        icon: "book-open",
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
