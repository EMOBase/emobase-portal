import { useEffect } from "react";

import { upload } from "@/utils/upload";

function uploadIdFromUrl(url?: string) {
  if (!url) return null;
  const path = url.split(/[?#]/)[0];
  return path.split("/").filter(Boolean).pop() ?? null;
}

// Runs a bundle's tus upload without rendering anything: the floating
// BundleProcessingPanel owns the whole lifecycle, so there is no inline
// FileCard for the archive at any point (not even while it is in transit).
export const OrthologyBundleUpload = ({
  file,
  versionName,
  onProgress,
  onUploaded,
  onFailed,
}: {
  file: File;
  versionName: string;
  onProgress: (progress: number) => void;
  onUploaded: (fileId: string | null) => void;
  onFailed: (error: string) => void;
}) => {
  useEffect(() => {
    let cancelled = false;

    upload({
      file,
      version: versionName,
      fileType: "orthology.bundle",
      onProgress: (percentage) => {
        if (!cancelled) onProgress(Math.round(percentage));
      },
    })
      .then((response) => {
        if (!cancelled) onUploaded(uploadIdFromUrl(response.uploadUrl));
      })
      .catch((err: any) => {
        if (!cancelled) {
          console.error("Bundle upload failed:", err);
          onFailed(err?.message || "Upload failed");
        }
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
};
