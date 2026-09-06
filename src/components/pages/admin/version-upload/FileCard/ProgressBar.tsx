import { cn } from "@/utils/classname";

export function ProgressBar({
  progress,
  title,
  theme = "blue",
  showComplete = false,
}: {
  progress: number;
  title: string;
  theme?: "orange" | "blue";
  showComplete?: boolean;
}) {
  const barColor = theme === "blue" ? "bg-blue-700" : "bg-orange-500";
  const completeColor = theme === "blue" ? "text-blue-700" : "text-orange-500";
  const progressColor = theme === "blue" ? "text-blue-700" : "text-orange-500";

  const isComplete = showComplete && progress === 100;

  return (
    <div className="w-full space-y-1.5">
      <div className="flex items-center justify-between text-xs font-bold uppercase tracking-widest">
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
          className={cn("h-full rounded-full transition-all duration-500", barColor)}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
