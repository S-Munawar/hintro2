"use client";

import { useToastStore } from "@/store/useToastStore";
import { X, CheckCircle, AlertCircle, Info } from "lucide-react";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <ToastContainer />
    </>
  );
}

const TOAST_CONFIG = {
  success: { icon: CheckCircle, bg: "bg-emerald-600", bar: "bg-emerald-400" },
  error: { icon: AlertCircle, bg: "bg-red-600", bar: "bg-red-400" },
  info: { icon: Info, bg: "bg-indigo-600", bar: "bg-indigo-400" },
} as const;

function ToastContainer() {
  const { toasts, removeToast } = useToastStore();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2.5 max-w-sm">
      {toasts.map((t) => {
        const config = TOAST_CONFIG[t.type];
        const Icon = config.icon;
        return (
          <div
            key={t.id}
            className={`flex items-start gap-3 rounded-xl px-4 py-3.5 shadow-xl text-sm text-white animate-toast-in ${config.bg}`}
            style={{ backdropFilter: 'blur(8px)' }}
          >
            <Icon size={18} className="shrink-0 mt-0.5 opacity-90" />
            <span className="flex-1 leading-snug">{t.message}</span>
            <button
              onClick={() => removeToast(t.id)}
              className="shrink-0 mt-0.5 p-0.5 rounded-md hover:bg-white/20 transition-colors"
              type="button"
            >
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
