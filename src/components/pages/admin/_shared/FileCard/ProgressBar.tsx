import type { ReactNode } from "react";

import { cn } from "@/utils/classname";

export function ProgressBar({
  progress,
  title,
  theme = "orange",
  showComplete = false,
  showError = false,
  size = "md",
  leftSlot,
}: {
  progress: number;
  title: string;
  theme?: "orange" | "blue" | "gray" | "red" | "green";
  showComplete?: boolean;
  showError?: boolean;
  size?: "sm" | "md";
  /** Rendered at the start of the label row (e.g. an error icon with a
      tooltip) without affecting the track width. */
  leftSlot?: ReactNode;
}) {
  const barColor =
    theme === "blue"
      ? "bg-blue-700"
      : theme === "gray"
        ? "bg-slate-400"
        : theme === "red"
          ? "bg-red-500"
          : theme === "green"
            ? "bg-green-500"
            : "bg-orange-500";
  const accentColor =
    theme === "blue"
      ? "text-blue-700"
      : theme === "gray"
        ? "text-slate-500"
        : theme === "red"
          ? "text-red-500"
          : theme === "green"
            ? "text-green-600"
            : "text-orange-500";

  const isComplete = showComplete && progress === 100;

  return (
    <div className="w-full space-y-1.5">
      <div
        className={cn(
          "flex items-center justify-between font-bold uppercase tracking-widest",
          size === "sm" ? "text-[10px]" : "text-xs",
        )}
      >
        {/* Left label: only shown when in-progress */}
        {leftSlot ? (
          <span className="flex shrink-0 items-center">{leftSlot}</span>
        ) : null}
        <span className={cn(title && !showError ? accentColor : "invisible")}>
          {title || "·"}
        </span>
        {/* Right label: ERROR, COMPLETE, or blank */}
        <span
          className={cn(
            showError
              ? "text-red-500"
              : isComplete
                ? accentColor
                : "text-slate-400",
          )}
        >
          {showError
            ? "ERROR"
            : isComplete
              ? "COMPLETE"
              : title
                ? `${progress}%`
                : ""}
        </span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500",
            barColor,
          )}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
