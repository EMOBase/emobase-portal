export type OnConfirm = (file: File, order: number, algorithm: string) => void;

export type OnBatchConfirm = (bundleFile: File) => void;
