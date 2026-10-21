import { FileListItem } from "@/components/pages/admin/_shared/FileCard";

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
  order?: number;
  algorithm?: string;
  onComplete: () => void;
  size?: "sm" | "md";
}) => (
  <FileListItem
    file={file}
    uploadArgs={{
      version: versionName,
      fileType: "orthology.tsv",
      order,
      algorithm,
    }}
    category="Orthology Mapping"
    icon="tsv"
    onComplete={onComplete}
    size={size}
  />
);
