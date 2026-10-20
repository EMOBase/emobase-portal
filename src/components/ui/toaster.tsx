import { Toast } from "@base-ui/react/toast";
import { CheckCircle2, X, XCircle } from "lucide-react";

export const toastManager = Toast.createToastManager();

const typeStyles = {
  success: "text-green-600",
  error: "text-red-600",
} as const;

function ToastList() {
  const { toasts } = Toast.useToastManager();

  return toasts.map((toast) => {
    const type = toast.type as keyof typeof typeStyles | undefined;
    const Icon =
      type === "error" ? XCircle : type === "success" ? CheckCircle2 : null;

    return (
      <Toast.Root
        key={toast.id}
        toast={toast}
        className="rounded-lg border border-slate-200 bg-white p-3 shadow-lg transition-all duration-200 data-[starting-style]:translate-y-2 data-[starting-style]:opacity-0 data-[ending-style]:opacity-0"
      >
        <Toast.Content className="flex items-start gap-3">
          {Icon ? (
            <Icon
              className={`mt-0.5 size-5 shrink-0 ${type ? typeStyles[type] : ""}`}
            />
          ) : null}
          <div className="min-w-0 flex-1">
            <Toast.Title className="break-words text-sm font-semibold text-slate-900" />
            <Toast.Description className="mt-0.5 break-words text-sm text-slate-600" />
          </div>
          <Toast.Close
            aria-label="Dismiss"
            className="shrink-0 rounded-lg p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
          >
            <X className="size-4" />
          </Toast.Close>
        </Toast.Content>
      </Toast.Root>
    );
  });
}

export default function Toaster() {
  return (
    <Toast.Provider toastManager={toastManager}>
      <Toast.Portal>
        {/* bottom is driven by --corner-stack-bottom so persistent corner
            panels (e.g. BundleProcessingPanel) can reserve space below us */}
        <Toast.Viewport
          style={{ bottom: "var(--corner-stack-bottom, 1rem)" }}
          className="fixed right-4 z-[100] flex w-[22.5rem] max-w-[calc(100vw-2rem)] flex-col gap-2 outline-none transition-[bottom] duration-200"
        >
          <ToastList />
        </Toast.Viewport>
      </Toast.Portal>
    </Toast.Provider>
  );
}
