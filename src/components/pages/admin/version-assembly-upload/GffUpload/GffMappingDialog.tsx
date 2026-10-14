import * as React from "react";
import { Dialog } from "@base-ui/react/dialog";
import { ArrowLeft, ArrowRight, Plus, Scissors, Trash2, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toastManager } from "@/components/ui/toaster";
import type { GffParseResult } from "./parseGffFile";

export type GffMappingConfirmData = {
  geneIDKey: string;
  trimPrefixChars: number;
  trimSuffixChars: number;
  oldGeneIDKeys: string[];
};

type GffMappingDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  isParsing: boolean;
  attributes: GffParseResult["attributes"];
  subAttributesMap: GffParseResult["subAttributesMap"];
  onConfirm: (data: GffMappingConfirmData) => void;
};

export const GffMappingDialog: React.FC<GffMappingDialogProps> = ({
  isOpen,
  onClose,
  isParsing,
  attributes,
  subAttributesMap,
  onConfirm,
}) => {
  const [step, setStep] = React.useState<1 | 2>(1);
  const [primaryKey, setPrimaryKey] = React.useState("");
  const [subKey, setSubKey] = React.useState("");
  const [trimStart, setTrimStart] = React.useState("0");
  const [trimEnd, setTrimEnd] = React.useState("0");
  const [oldGeneIDKeys, setOldGeneIDKeys] = React.useState<string[]>([]);

  const attributeKeys = React.useMemo(
    () => Object.keys(attributes),
    [attributes],
  );

  const oldGeneIDAttributeOptions = React.useMemo(
    () => attributeKeys.filter((key) => key !== primaryKey),
    [attributeKeys, primaryKey],
  );

  React.useEffect(() => {
    if (isOpen) {
      setStep(1);
      setPrimaryKey("");
      setSubKey("");
      setTrimStart("0");
      setTrimEnd("0");
      setOldGeneIDKeys([]);
    }
  }, [isOpen]);

  React.useEffect(() => {
    if (attributeKeys.length === 0) return;

    const defaultPrimary =
      attributeKeys.find((k) => k.toLowerCase() === "dbxref") ||
      attributeKeys[0];
    setPrimaryKey(defaultPrimary);

    const subs = subAttributesMap[defaultPrimary] || [];
    setSubKey(subs.length > 0 ? subs[0] : "");
  }, [attributeKeys, subAttributesMap]);

  React.useEffect(() => {
    setOldGeneIDKeys((prev) =>
      prev.filter(
        (k) => k !== primaryKey && oldGeneIDAttributeOptions.includes(k),
      ),
    );
  }, [primaryKey, oldGeneIDAttributeOptions]);

  const handlePrimaryKeyChange = (key: string) => {
    setPrimaryKey(key);
    const subs = subAttributesMap[key] || [];
    setSubKey(subs.length > 0 ? subs[0] : "");
  };

  const preview = React.useMemo(() => {
    if (!primaryKey || Object.keys(attributes).length === 0) {
      return { original: '""', result: "" };
    }

    const values = attributes[primaryKey] || [];
    if (values.length === 0) {
      return { original: `"${primaryKey}="`, result: "" };
    }

    let originalStr = `${primaryKey}=${values[0]}`;
    let extractedVal = values[0];

    if (subKey && subAttributesMap[primaryKey]?.includes(subKey)) {
      for (const val of values) {
        if (val.startsWith(`${subKey}:`)) {
          extractedVal = val.substring(subKey.length + 1);
          originalStr = `${primaryKey}=${val}`;
          break;
        }
      }
    }

    let trimmedResult = extractedVal;
    const start = Math.max(0, parseInt(trimStart) || 0);
    const end = Math.max(0, parseInt(trimEnd) || 0);

    if (start + end >= trimmedResult.length) {
      trimmedResult = "";
    } else {
      trimmedResult = trimmedResult.substring(
        start,
        trimmedResult.length - end,
      );
    }

    return {
      original: `"${originalStr}"`,
      result: trimmedResult,
    };
  }, [attributes, primaryKey, subKey, subAttributesMap, trimStart, trimEnd]);

  const getOldGeneIDOptionsForRow = (index: number) => {
    const current = oldGeneIDKeys[index];
    const selectedElsewhere = new Set(
      oldGeneIDKeys.filter((_, i) => i !== index),
    );
    const options = oldGeneIDAttributeOptions.filter(
      (key) => !selectedElsewhere.has(key),
    );
    if (current && !options.includes(current)) {
      return [current, ...options];
    }
    return options;
  };

  const availableOldGeneIDKeys = oldGeneIDAttributeOptions.filter(
    (key) => !oldGeneIDKeys.includes(key),
  );

  const handleAddOldGeneIDKey = () => {
    const nextKey = availableOldGeneIDKeys[0];
    if (!nextKey) return;
    setOldGeneIDKeys((prev) => [...prev, nextKey]);
  };

  const handleRemoveOldGeneIDKey = (index: number) => {
    setOldGeneIDKeys((prev) => prev.filter((_, i) => i !== index));
  };

  const handleOldGeneIDKeyChange = (index: number, key: string) => {
    setOldGeneIDKeys((prev) => {
      const next = [...prev];
      next[index] = key;
      return next;
    });
  };

  const handleConfirm = () => {
    if (!primaryKey) {
      toastManager.add({
        type: "error",
        title: "Please select a primary attribute key.",
      });
      return;
    }

    const finalGeneIDKey = subKey ? `${primaryKey}.${subKey}` : primaryKey;
    const finalOldKeys = oldGeneIDKeys.filter((k) => k !== "");

    onConfirm({
      geneIDKey: finalGeneIDKey,
      trimPrefixChars: parseInt(trimStart) || 0,
      trimSuffixChars: parseInt(trimEnd) || 0,
      oldGeneIDKeys: finalOldKeys,
    });
  };

  const hasAttributes = Object.keys(attributes).length > 0;

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-slate-900/40" />
        <Dialog.Popup className="fixed left-1/2 top-1/2 z-50 max-h-[90vh] w-full max-w-xl -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-xl border border-slate-200 bg-white p-8 shadow-lg outline-none">
          <Dialog.Close className="absolute right-6 top-6 rounded-md p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600">
            <X className="size-5" />
            <span className="sr-only">Close</span>
          </Dialog.Close>

          <div className="flex items-center gap-3">
            <span className="rounded-sm bg-blue-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-blue-600">
              Step {step} of 2
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              GFF ID Field Mapping
            </span>
          </div>

          <Dialog.Title className="mt-3 font-display text-2xl font-bold text-slate-900">
            {step === 1 ? "Primary Gene ID Selection" : "Old Gene ID Mapping"}
          </Dialog.Title>

          <Dialog.Description className="mt-1 text-sm leading-relaxed text-slate-500">
            {step === 1
              ? "Define the unique identifier for your genomic entities by mapping specific attributes from your GFF source file."
              : "Map GFF attributes that contain legacy or alternate gene IDs. These values are indexed so researchers can find genes using identifiers from older nomenclature versions."}
          </Dialog.Description>

          {isParsing && (
            <div className="flex flex-col items-center justify-center space-y-4 py-16">
              <div className="size-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
              <p className="text-sm font-medium text-slate-500">
                Scanning GFF file for gene attributes...
              </p>
            </div>
          )}

          {!isParsing && hasAttributes && (
            <div className="mt-6 space-y-6">
              {step === 1 ? (
                <>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                        Primary Attribute Key
                      </label>
                      <Select
                        value={primaryKey}
                        onValueChange={(value) =>
                          handlePrimaryKeyChange(value as string)
                        }
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select attribute" />
                        </SelectTrigger>
                        <SelectContent>
                          {attributeKeys.map((key) => (
                            <SelectItem key={key} value={key}>
                              {key}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                        Select Sub-attribute
                      </label>
                      <Select
                        value={subKey}
                        onValueChange={(value) => setSubKey(value as string)}
                        disabled={
                          !subAttributesMap[primaryKey] ||
                          subAttributesMap[primaryKey].length === 0
                        }
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="No sub-attributes available" />
                        </SelectTrigger>
                        <SelectContent>
                          {(subAttributesMap[primaryKey] || []).map((sub) => (
                            <SelectItem key={sub} value={sub}>
                              {sub}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
                      <Scissors className="size-4 text-blue-600" />
                      <span>Value Trimming</span>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-medium text-slate-500">
                          Trim from Start (Chars)
                        </label>
                        <Input
                          type="number"
                          min="0"
                          value={trimStart}
                          onChange={(e) => setTrimStart(e.target.value)}
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-medium text-slate-500">
                          Trim from End (Chars)
                        </label>
                        <Input
                          type="number"
                          min="0"
                          value={trimEnd}
                          onChange={(e) => setTrimEnd(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 rounded-r-md border-l-4 border-blue-600 bg-slate-50 p-5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
                        Extraction Preview
                      </span>
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-700">
                        <span className="size-1.5 animate-pulse rounded-full bg-amber-600" />
                        Live Parser
                      </span>
                    </div>

                    <div className="mt-2 flex items-center gap-3">
                      <code className="block min-w-0 flex-1 break-all rounded-sm border border-slate-200/50 bg-slate-100/80 px-3 py-2 font-mono text-[11px] leading-normal text-slate-600">
                        {preview.original}
                      </code>
                      <ArrowRight className="size-4 shrink-0 text-blue-600/80" />
                      <div className="min-w-0 flex-1 break-all rounded-sm border border-slate-200/60 bg-white px-4 py-2 font-mono text-xs font-semibold leading-normal text-slate-800">
                        {preview.result || (
                          <span className="font-normal italic text-slate-300">
                            empty
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="max-h-[300px] space-y-4 overflow-y-auto pr-1">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                    Old Gene ID Attribute Key
                  </label>
                  {oldGeneIDAttributeOptions.length === 0 ? (
                    <p className="text-sm text-slate-500">
                      No additional attribute keys are available in this GFF
                      file.
                    </p>
                  ) : (
                    <>
                      {oldGeneIDKeys.map((key, idx) => (
                        <div key={idx} className="flex items-center gap-3">
                          <Select
                            value={key}
                            onValueChange={(value) =>
                              handleOldGeneIDKeyChange(idx, value as string)
                            }
                          >
                            <SelectTrigger className="flex-1">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {getOldGeneIDOptionsForRow(idx).map((attrKey) => (
                                <SelectItem key={attrKey} value={attrKey}>
                                  {attrKey}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveOldGeneIDKey(idx)}
                            className="shrink-0 text-slate-400 hover:bg-red-50 hover:text-red-500"
                          >
                            <Trash2 className="size-5" />
                          </Button>
                        </div>
                      ))}

                      <button
                        type="button"
                        onClick={handleAddOldGeneIDKey}
                        disabled={availableOldGeneIDKeys.length === 0}
                        className="mt-2 inline-flex items-center gap-2 text-xs font-bold text-blue-600 transition-colors hover:text-blue-700 disabled:pointer-events-none disabled:opacity-40"
                      >
                        <Plus className="size-4" />
                        {oldGeneIDKeys.length === 0
                          ? "Add gene ID field"
                          : "Add another old gene ID field"}
                      </button>
                    </>
                  )}
                </div>
              )}

              <div className="mt-8 flex items-center justify-between border-t border-slate-100 pt-6">
                {step === 1 ? (
                  <>
                    <Button type="button" variant="outline" onClick={onClose}>
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      onClick={() => setStep(2)}
                      disabled={!preview.result}
                    >
                      Old Gene ID Mapping
                      <ArrowRight className="size-4" />
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setStep(1)}
                    >
                      <ArrowLeft className="size-4" />
                      Back
                    </Button>
                    <Button type="button" onClick={handleConfirm}>
                      Confirm Mapping
                      <ArrowRight className="size-4" />
                    </Button>
                  </>
                )}
              </div>
            </div>
          )}
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
