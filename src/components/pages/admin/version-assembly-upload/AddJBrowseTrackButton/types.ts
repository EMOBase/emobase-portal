export type OnConfirm = (
  file: File,
  trackName: string,
  category?: string,
  selectInDefaultSession?: boolean,
) => void;

export type OnBatchConfirm = (bundleFile: File) => void;
