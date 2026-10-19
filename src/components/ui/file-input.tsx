import * as React from "react";
import { Upload } from "lucide-react";

import { cn } from "@/utils/classname";

type FileInputProps = Omit<
  React.ComponentProps<"input">,
  "type" | "value" | "defaultValue" | "onChange"
> & {
  value?: File | null;
  defaultValue?: File | null;
  onFiles?: (files: File[]) => void;
  placeholder?: string;
};

function FileInput({
  className,
  value,
  defaultValue = null,
  onFiles,
  placeholder = "Choose a file…",
  disabled,
  ...props
}: FileInputProps) {
  const [internalValue, setInternalValue] = React.useState<File | null>(
    defaultValue,
  );
  const inputRef = React.useRef<HTMLInputElement>(null);
  const file = value !== undefined ? value : internalValue;
  const invalid =
    props["aria-invalid"] === true || props["aria-invalid"] === "true";

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    if (value === undefined) {
      setInternalValue(files[0] ?? null);
    }
    onFiles?.(files);
    event.target.value = "";
  }

  return (
    <div
      data-slot="file-input"
      onClick={() => {
        if (!disabled) inputRef.current?.click();
      }}
      className={cn(
        "relative flex h-10 w-full min-w-0 cursor-pointer items-center gap-3 rounded-(--radius-control) border border-input bg-transparent pl-3 pr-2.5 text-base transition-colors outline-none md:text-sm dark:bg-input/30",
        "focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50",
        invalid &&
          "border-destructive ring-3 ring-destructive/20 dark:border-destructive/50 dark:ring-destructive/40",
        disabled &&
          "pointer-events-none cursor-not-allowed bg-input/50 opacity-50 dark:bg-input/80",
        className,
      )}
    >
      <Upload className="pointer-events-none size-4 shrink-0 text-muted-foreground" />
      <span
        className={cn(
          "min-w-0 truncate",
          file ? "text-foreground" : "text-muted-foreground",
        )}
      >
        {file ? file.name : placeholder}
      </span>
      <input
        ref={inputRef}
        type="file"
        data-slot="file-input-native"
        disabled={disabled}
        onChange={handleChange}
        className="pointer-events-none absolute inset-0 opacity-0"
        {...props}
      />
    </div>
  );
}

export { FileInput };
