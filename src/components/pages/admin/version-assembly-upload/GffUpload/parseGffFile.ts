export type GffParseResult = {
  attributes: Record<string, string[]>;
  subAttributesMap: Record<string, string[]>;
};

export async function parseAllGeneLinesFromGffGz(
  file: File,
): Promise<GffParseResult | null> {
  if (typeof DecompressionStream === "undefined") {
    throw new Error(
      "Your browser does not support DecompressionStream. Please use a modern browser like Chrome, Firefox, or Safari.",
    );
  }

  const decompressionStream = new DecompressionStream("gzip");
  const decompressedStream = file.stream().pipeThrough(decompressionStream);
  const reader = decompressedStream.getReader();
  const decoder = new TextDecoder("utf-8");

  let buffer = "";
  const attributesMap = new Map<string, Set<string>>();
  let geneCount = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (value) {
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split(/\r?\n/);
        buffer = lines.pop() || "";

        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];
          const trimmed = line.trim();
          if (!trimmed || trimmed.startsWith("#")) {
            continue;
          }
          const cols = trimmed.split("\t");
          if (cols.length < 9) {
            continue;
          }
          if (cols[2].toLowerCase() !== "gene") {
            continue;
          }

          geneCount++;
          const attributesStr = cols[8];
          const attrPairs = attributesStr.split(";");

          for (let j = 0; j < attrPairs.length; j++) {
            const pair = attrPairs[j];
            const trimmedPair = pair.trim();
            if (!trimmedPair) continue;
            const eqIdx = trimmedPair.indexOf("=");
            if (eqIdx === -1) continue;
            const key = trimmedPair.substring(0, eqIdx).trim();
            const valStr = trimmedPair.substring(eqIdx + 1).trim();
            if (!key || !valStr) continue;

            const values = valStr.split(",");
            if (!attributesMap.has(key)) {
              attributesMap.set(key, new Set<string>());
            }
            const valueSet = attributesMap.get(key)!;
            for (let k = 0; k < values.length; k++) {
              const v = values[k].trim();
              if (v) {
                valueSet.add(v);
              }
            }
          }

          if (geneCount % 5000 === 0) {
            await new Promise((resolve) => setTimeout(resolve, 0));
          }
        }
      }
      if (done) {
        break;
      }
    }
  } finally {
    try {
      await reader.cancel();
    } catch {
      // Ignore reader cancel errors
    }
  }

  if (geneCount === 0 || attributesMap.size === 0) {
    return null;
  }

  const attributes: Record<string, string[]> = {};
  for (const [key, valueSet] of attributesMap.entries()) {
    attributes[key] = Array.from(valueSet);
  }

  const subAttributesMap: Record<string, string[]> = {};
  for (const [key, values] of Object.entries(attributes)) {
    const subsSet = new Set<string>();
    for (let i = 0; i < values.length; i++) {
      const val = values[i];
      const colonIdx = val.indexOf(":");
      if (colonIdx !== -1) {
        const subName = val.substring(0, colonIdx).trim();
        if (subName) {
          subsSet.add(subName);
        }
      }
    }
    if (subsSet.size > 0) {
      subAttributesMap[key] = Array.from(subsSet);
    }
  }

  return { attributes, subAttributesMap };
}

export const GFF_NO_GENE_ERROR =
  "Could not find any 'gene' features in the GFF file. Please verify that this is a valid GFF3 file and contains features of type 'gene'.";
