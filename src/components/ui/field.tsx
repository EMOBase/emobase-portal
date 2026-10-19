import * as React from "react";

import { cn } from "@/utils/classname";

type FieldProps = {
  label?: React.ReactNode;
  htmlFor?: string;
  optional?: boolean;
  /** Field-level error message, rendered below the control. */
  error?: string;
  className?: string;
  children: React.ReactNode;
};

/**
 * Standard label + control + inline error layout used by the portal forms.
 * Pair with `useForm` and pass the matching `form.errors.<field>` as `error`.
 */
export function Field({
  label,
  htmlFor,
  optional,
  error,
  className,
  children,
}: FieldProps) {
  return (
    <div className={cn("mb-4", className)}>
      {label ? (
        <label
          htmlFor={htmlFor}
          className="mb-1.5 block text-sm font-medium text-slate-700"
        >
          {label}
          {optional ? (
            <span className="ml-1 font-normal text-slate-400">(optional)</span>
          ) : null}
        </label>
      ) : null}
      {children}
      {error ? <p className="mt-1 text-sm text-destructive">{error}</p> : null}
    </div>
  );
}
