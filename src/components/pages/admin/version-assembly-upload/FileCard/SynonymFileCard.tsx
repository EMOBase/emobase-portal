import { FileListItem } from "@/components/pages/admin/_shared/FileCard";

export const SynonymFileCard = ({
  file,
  versionName,
  assemblyId,
  species,
  onComplete,
  size = "sm",
}: {
  file: File;
  versionName: string;
  assemblyId: string | number;
  species: string;
  onComplete: () => void;
  size?: "sm" | "md";
}) => (
  <FileListItem
    file={file}
    uploadArgs={{
      version: versionName,
      assembly: assemblyId,
      fileType: "species.synonym",
      species,
    }}
    category="Synonyms"
    icon="book-open"
    onComplete={onComplete}
    size={size}
  />
);
