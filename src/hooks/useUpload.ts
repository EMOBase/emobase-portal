import { useCallback, useState } from "react";

import { upload, type UploadInput } from "@/utils/upload";

const useUpload = () => {
  const [progress, setProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runUpload = useCallback(async (input: UploadInput) => {
    setIsUploading(true);
    setProgress(0);
    setError(null);

    const wrappedOnProgress: UploadInput["onProgress"] = (
      percentage,
      bytesUploaded,
      bytesTotal,
    ) => {
      setProgress(Math.round(percentage));
      input.onProgress?.(percentage, bytesUploaded, bytesTotal);
    };

    try {
      return await upload({ ...input, onProgress: wrappedOnProgress });
    } catch (err: any) {
      setError(err?.message || "Upload failed");
      throw err;
    } finally {
      setIsUploading(false);
    }
  }, []);

  return { upload: runUpload, progress, isUploading, error };
};

export default useUpload;
