import { cn } from "@/utils/classname";

export function ProgressBar({
  progress,
  title,
  theme = "orange",
  showComplete = false,
  size = "md",
}: {
  progress: number;
  title: string;
  theme?: "orange" | "blue" | "gray";
  showComplete?: boolean;
  size?: "sm" | "md";
}) {
  const barColor =
    theme === "blue"
      ? "bg-blue-700"
      : theme === "gray"
        ? "bg-slate-400"
        : "bg-orange-500";
  const completeColor =
    theme === "blue"
      ? "text-blue-700"
      : theme === "gray"
        ? "text-slate-500"
        : "text-orange-500";
  const progressColor =
    theme === "blue"
      ? "text-blue-700"
      : theme === "gray"
        ? "text-slate-500"
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
        <span className={cn(title ? progressColor : "invisible")}>
          {title || "·"}
        </span>
        {/* Right label: COMPLETE or blank */}
        <span className={isComplete ? completeColor : "text-slate-400"}>
          {isComplete ? "COMPLETE" : title ? `${progress}%` : ""}
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
