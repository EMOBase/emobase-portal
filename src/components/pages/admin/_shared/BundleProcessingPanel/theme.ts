export type PanelTheme = "orange" | "gray" | "red" | "green";

/**
 * The panel wears the color of the work that matters right now. Fully
 * class-mapped (no dynamic Tailwind names) so the JIT keeps the classes.
 */
export const panelThemeClasses: Record<
  PanelTheme,
  { root: string; header: string; icon: string }
> = {
  orange: {
    root: "border-orange-200",
    header: "border-orange-100 bg-orange-50/70",
    icon: "bg-orange-100 text-orange-600",
  },
  gray: {
    root: "border-slate-200",
    header: "border-slate-200 bg-slate-50",
    icon: "bg-slate-100 text-slate-500",
  },
  red: {
    root: "border-red-200",
    header: "border-red-100 bg-red-50/70",
    icon: "bg-red-100 text-red-600",
  },
  green: {
    // One ramp step deeper than red/orange: Tailwind green is far more
    // luminous than they are at the same level, so green-50/100 read as
    // washed out next to them in the same header slot.
    root: "border-green-300",
    header: "border-green-200 bg-green-100/70",
    icon: "bg-green-200 text-green-700",
  },
};

/**
 * Panel theme follows the dominant state, priority processing > error >
 * complete: while anything is in flight the panel stays orange (it is the
 * processing panel), otherwise green when every visible row is completing
 * (no failures alongside), red when failures are on screen. While the only
 * thing in flight is a client-side upload (or the hand-off wait for its
 * job), the panel stays gray: only work the system does is orange.
 */
export function resolvePanelTheme({
  serverActiveCount,
  clientActiveCount,
  completingCount,
  anyFailed,
}: {
  serverActiveCount: number;
  clientActiveCount: number;
  completingCount: number;
  anyFailed: boolean;
}): PanelTheme {
  if (serverActiveCount > 0) return "orange";
  if (clientActiveCount > 0) return "gray";
  if (completingCount > 0 && !anyFailed) return "green";
  return "red";
}
