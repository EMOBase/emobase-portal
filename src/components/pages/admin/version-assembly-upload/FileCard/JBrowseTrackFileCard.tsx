import { FileListItem } from "@/components/pages/admin/_shared/FileCard";

export const JBrowseTrackFileCard = ({
  file,
  versionName,
  assemblyId,
  trackName,
  category,
  selectInDefaultSession,
  onComplete,
  size = "sm",
}: {
  file: File;
  versionName: string;
  assemblyId: string | number;
  trackName: string;
  category?: string;
  selectInDefaultSession?: boolean;
  onComplete: () => void;
  size?: "sm" | "md";
}) => (
  <FileListItem
    file={file}
    uploadArgs={{
      version: versionName,
      assembly: assemblyId,
      fileType: "jbrowse.track",
      trackName,
      category,
      selectInDefaultSession,
    }}
    category={trackName}
    icon="database"
    onComplete={onComplete}
    size={size}
  />
);
