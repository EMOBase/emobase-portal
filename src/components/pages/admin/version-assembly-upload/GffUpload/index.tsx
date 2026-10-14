import { GffMappingDialog } from "./GffMappingDialog";
import type { GffMappingConfirmData } from "./GffMappingDialog";
import { GffParsingErrorDialog } from "./GffParsingErrorDialog";
import { useGffFileParse } from "./useGffFileParse";

export type { GffMappingConfirmData };

type GffUploadProps = {
  isOpen: boolean;
  file: File | null;
  onClose: () => void;
  onConfirm: (data: GffMappingConfirmData) => void;
  onUploadDifferentFile: () => void;
};

const GffUpload = ({
  isOpen,
  file,
  onClose,
  onConfirm,
  onUploadDifferentFile,
}: GffUploadProps) => {
  const { isParsing, parseError, attributes, subAttributesMap } =
    useGffFileParse({
      file,
      enabled: file !== null,
    });

  return (
    <>
      <GffParsingErrorDialog
        isOpen={isOpen && !!parseError}
        onClose={onClose}
        error={parseError ?? ""}
        onUploadDifferentFile={onUploadDifferentFile}
      />
      <GffMappingDialog
        isOpen={isOpen && !parseError}
        onClose={onClose}
        isParsing={isParsing}
        attributes={attributes}
        subAttributesMap={subAttributesMap}
        onConfirm={onConfirm}
      />
    </>
  );
};

export default GffUpload;
