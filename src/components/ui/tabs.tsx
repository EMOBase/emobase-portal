import { Tabs as TabsPrimitive } from "@base-ui/react/tabs";

import { cn } from "@/utils/classname";

function Tabs({
  className,
  ...props
}: TabsPrimitive.Root.Props) {
  return (
    <TabsPrimitive.Root
      className={cn("flex flex-col gap-8", className)}
      {...props}
    />
  );
}

function TabsList({
  className,
  ...props
}: TabsPrimitive.List.Props) {
  return (
    <div className="border-b border-slate-200">
      <TabsPrimitive.List
        className={cn("flex gap-8 -mb-px", className)}
        {...props}
      />
    </div>
  );
}

function TabsTrigger({
  className,
  children,
  badge,
  ...props
}: TabsPrimitive.Tab.Props & {
  badge?: number;
}) {
  return (
    <TabsPrimitive.Tab
      className={cn(
        "group/trigger whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 cursor-pointer transition-all border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 data-[selected]:border-blue-700 data-[selected]:text-blue-700",
        className,
      )}
      {...props}
    >
      {children}
      {badge !== undefined && (
        <span
          className={
            "py-0.5 px-2.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 group-data-[selected]/trigger:bg-blue-100 group-data-[selected]/trigger:text-blue-700"
          }
        >
          {badge}
        </span>
      )}
    </TabsPrimitive.Tab>
  );
}

function TabsContent({
  className,
  ...props
}: TabsPrimitive.Panel.Props) {
  return (
    <TabsPrimitive.Panel
      className={cn("flex-1 outline-none", className)}
      {...props}
    />
  );
}

export { Tabs, TabsList, TabsTrigger, TabsContent };
