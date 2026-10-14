import { useEffect, useState } from "react";

import {
  GFF_NO_GENE_ERROR,
  parseAllGeneLinesFromGffGz,
  type GffParseResult,
} from "./parseGffFile";

type UseGffFileParseOptions = {
  file: File | null;
  enabled: boolean;
};

type UseGffFileParseResult = {
  isParsing: boolean;
  parseError: string | null;
  attributes: GffParseResult["attributes"];
  subAttributesMap: GffParseResult["subAttributesMap"];
};

const emptyParseResult: GffParseResult = {
  attributes: {},
  subAttributesMap: {},
};

export function useGffFileParse({
  file,
  enabled,
}: UseGffFileParseOptions): UseGffFileParseResult {
  const [isParsing, setIsParsing] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);
  const [parseResult, setParseResult] =
    useState<GffParseResult>(emptyParseResult);

  useEffect(() => {
    if (!enabled || !file) {
      setIsParsing(false);
      setParseError(null);
      setParseResult(emptyParseResult);
      return;
    }

    let cancelled = false;

    setIsParsing(true);
    setParseError(null);
    setParseResult(emptyParseResult);

    parseAllGeneLinesFromGffGz(file)
      .then((result) => {
        if (cancelled) return;
        if (result) {
          setParseResult(result);
        } else {
          setParseError(GFF_NO_GENE_ERROR);
        }
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        console.error("Failed to parse GFF:", err);
        const message =
          err instanceof Error
            ? err.message
            : "Failed to decompress and parse GFF file.";
        setParseError(message);
      })
      .finally(() => {
        if (!cancelled) {
          setIsParsing(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [file, enabled]);

  return {
    isParsing,
    parseError,
    attributes: parseResult.attributes,
    subAttributesMap: parseResult.subAttributesMap,
  };
}
