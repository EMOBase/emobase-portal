import { FileArchive } from "lucide-react";

import { cn } from "@/utils/classname";
import { panelThemeClasses, type PanelTheme } from "./theme";

/**
 * The line under the title says what the panel is doing right now.
 */
export function panelSubtitle({
  serverActiveCount,
  clientActiveCount,
  activeCount,
  completingCount,
  uploadFailed,
}: {
  serverActiveCount: number;
  clientActiveCount: number;
  activeCount: number;
  completingCount: number;
  uploadFailed: boolean;
}) {
  if (serverActiveCount > 0 && clientActiveCount > 0) {
    return `Uploading & extracting bundles · ${activeCount} active`;
  }
  if (serverActiveCount > 0) {
    return `Extracting bundles · ${serverActiveCount} active`;
  }
  if (clientActiveCount > 0) {
    return `Uploading bundles · ${clientActiveCount} active`;
  }
  if (completingCount > 0) return "Finishing up";
  if (uploadFailed) return "Review failed bundle uploads";
  return "Review failed bundle extractions";
}

export function PanelHeader({
  theme,
  subtitle,
  count,
}: {
  theme: PanelTheme;
  subtitle: string;
  count: number;
}) {
  const themeClasses = panelThemeClasses[theme];

  return (
    <header
      className={cn(
        "flex items-center gap-3 border-b px-4 py-3",
        themeClasses.header,
      )}
    >
      <span className={cn("rounded-lg p-1.5", themeClasses.icon)}>
        <FileArchive className="size-4" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="text-sm font-semibold text-slate-900">
          Bundle processing
        </div>
        <div className="text-xs text-slate-500">{subtitle}</div>
      </div>
      <span className="rounded-full bg-white px-2 py-0.5 text-xs font-bold text-slate-500 shadow-sm">
        {count}
      </span>
    </header>
  );
}
