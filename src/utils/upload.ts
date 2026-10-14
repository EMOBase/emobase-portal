import { Upload as TusUpload } from "tus-js-client";

import { getApiBaseUrl } from "@/utils/apiFetch";
import { useSessionStore } from "@/states/sessionStore";

export type UploadInput = {
  file: File;
  version: string;
  assembly: string | number;
  fileType: string;
  fileName?: string;
  order?: number;
  algorithm?: string;
  trackName?: string;
  category?: string;
  selectInDefaultSession?: boolean;
  species?: string;
  geneIDKey?: string;
  trimPrefixChars?: number;
  trimSuffixChars?: number;
  oldGeneIDKeys?: string;
  onProgress?: (
    percentage: number,
    bytesUploaded: number,
    bytesTotal: number,
  ) => void;
  shouldResume?: boolean;
};

export type UploadResponse = {
  uploadUrl?: string;
};

export const upload = async (input: UploadInput): Promise<UploadResponse> => {
  const {
    file,
    version,
    assembly,
    fileType,
    fileName,
    order,
    algorithm,
    trackName,
    category,
    selectInDefaultSession,
    species,
    geneIDKey,
    trimPrefixChars,
    trimSuffixChars,
    oldGeneIDKeys,
    onProgress,
    shouldResume = false,
  } = input;

  return await new Promise((resolve, reject) => {
    const tusUpload = new TusUpload(file, {
      // Trailing slash avoids nginx/tusd redirect on preflight.
      endpoint: `${getApiBaseUrl("genomicsservice")}/uploads/`,
      retryDelays: [0, 1000, 3000, 5000],
      headers: {
        Authorization: `Bearer ${useSessionStore.getState().session?.user?.accessToken}`,
      },
      chunkSize: 5 * 1024 * 1024, // 5 MB
      metadata: {
        fileType,
        fileName: fileName ?? file.name,
        version,
        assembly: assembly.toString(),
        ...(order ? { order: order.toString() } : {}),
        ...(algorithm ? { algorithm } : {}),
        ...(trackName ? { trackName } : {}),
        ...(category ? { category } : {}),
        ...(selectInDefaultSession !== undefined
          ? { selectInDefaultSession: selectInDefaultSession.toString() }
          : {}),
        ...(species ? { species } : {}),
        ...(geneIDKey ? { geneIDKey } : {}),
        ...(trimPrefixChars !== undefined
          ? { trimPrefixChars: trimPrefixChars.toString() }
          : {}),
        ...(trimSuffixChars !== undefined
          ? { trimSuffixChars: trimSuffixChars.toString() }
          : {}),
        ...(oldGeneIDKeys ? { oldGeneIDKeys } : {}),
      },
      removeFingerprintOnSuccess: true,
      onError: (error) => {
        reject(error);
      },
      onProgress: (bytesUploaded, bytesTotal) => {
        const percentage =
          bytesTotal > 0 ? (bytesUploaded / bytesTotal) * 100 : 0;
        onProgress?.(percentage, bytesUploaded, bytesTotal);
      },
      onSuccess: () => {
        resolve({ uploadUrl: tusUpload.url ?? undefined });
      },
    });

    if (shouldResume) {
      tusUpload
        .findPreviousUploads()
        .then((uploads) => {
          if (uploads.length > 0) {
            tusUpload.resumeFromPreviousUpload(uploads[0]);
          }
          tusUpload.start();
        })
        .catch(() => {
          tusUpload.start();
        });
    } else {
      tusUpload.start();
    }
  });
};
