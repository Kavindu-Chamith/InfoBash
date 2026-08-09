"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ShieldAlert, CheckCircle2, AlertTriangle, Info, X } from "lucide-react";

export type ToastType = "error" | "success" | "warning" | "info";

export interface ToastMessage {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  duration?: number;
}

interface ToastContextType {
  showToast: (toast: Omit<ToastMessage, "id">) => void;
  showError: (message: string, title?: string) => void;
  showSuccess: (message: string, title?: string) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    ({ type, title, message, duration = 8000 }: Omit<ToastMessage, "id">) => {
      const id = Math.random().toString(36).substring(2, 9);
      const newToast: ToastMessage = { id, type, title, message, duration };

      setToasts((prev) => [newToast, ...prev].slice(0, 4));

      setTimeout(() => {
        removeToast(id);
      }, duration);
    },
    [removeToast]
  );

  const showError = useCallback(
    (message: string, title: string = "Validation Error") => {
      showToast({ type: "error", title, message, duration: 8000 });
    },
    [showToast]
  );

  const showSuccess = useCallback(
    (message: string, title: string = "Success") => {
      showToast({ type: "success", title, message, duration: 8000 });
    },
    [showToast]
  );

  return (
    <ToastContext.Provider value={{ showToast, showError, showSuccess, removeToast }}>
      {children}
      {/* Sleek, compact toast container in top right corner under navbar */}
      <div className="fixed top-20 right-4 sm:right-6 z-[9999] flex flex-col gap-2.5 max-w-sm w-[calc(100vw-2rem)] sm:w-80 pointer-events-none">
        <AnimatePresence mode="sync">
          {toasts.map((toast) => (
            <ToastItem key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

function ToastItem({ toast, onClose }: { toast: ToastMessage; onClose: () => void }) {
  const isError = toast.type === "error";
  const isSuccess = toast.type === "success";
  const isWarning = toast.type === "warning";
  const duration = toast.duration ?? 8000;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 24, y: 0 }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      exit={{ opacity: 0, x: 28, y: 0 }}
      transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
      className={`pointer-events-auto relative overflow-hidden rounded-xl border backdrop-blur-xl px-3.5 py-3 shadow-xl transition-all ${
        isError
          ? "bg-navy-950/95 border-red-500/40 text-ivory-50 shadow-red-950/40"
          : isSuccess
          ? "bg-navy-950/95 border-emerald-500/40 text-ivory-50 shadow-emerald-950/40"
          : isWarning
          ? "bg-navy-950/95 border-amber-500/40 text-ivory-50 shadow-amber-950/40"
          : "bg-navy-950/95 border-cyan-500/40 text-ivory-50 shadow-cyan-950/40"
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Compact Icon Badge */}
        <div
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border ${
            isError
              ? "bg-red-500/20 text-red-400 border-red-500/30"
              : isSuccess
              ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
              : isWarning
              ? "bg-amber-500/20 text-amber-400 border-amber-500/30"
              : "bg-cyan-500/20 text-cyan-400 border-cyan-500/30"
          }`}
        >
          {isError && <ShieldAlert size={16} />}
          {isSuccess && <CheckCircle2 size={16} />}
          {isWarning && <AlertTriangle size={16} />}
          {!isError && !isSuccess && !isWarning && <Info size={16} />}
        </div>

        {/* Content */}
        <div className="flex-1 pr-4">
          {toast.title && (
            <h4
              className={`text-[11px] font-bold uppercase tracking-wider ${
                isError
                  ? "text-red-400"
                  : isSuccess
                  ? "text-emerald-400"
                  : isWarning
                  ? "text-amber-400"
                  : "text-cyan-400"
              }`}
            >
              {toast.title}
            </h4>
          )}
          <p className="mt-0.5 text-xs text-ivory-200 leading-snug">
            {toast.message}
          </p>
        </div>

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-2.5 right-2 text-ivory-400 hover:text-white transition-colors p-1 rounded hover:bg-white/10"
          aria-label="Close notification"
        >
          <X size={14} />
        </button>
      </div>

      {/* Thin Progress Bar (8 seconds countdown) */}
      <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-white/5">
        <motion.div
          initial={{ width: "100%" }}
          animate={{ width: "0%" }}
          transition={{ duration: duration / 1000, ease: "linear" }}
          className={`h-full ${
            isError
              ? "bg-gradient-to-r from-red-500 to-rose-400"
              : isSuccess
              ? "bg-gradient-to-r from-emerald-500 to-teal-400"
              : isWarning
              ? "bg-gradient-to-r from-amber-500 to-yellow-400"
              : "bg-gradient-to-r from-cyan-500 to-blue-400"
          }`}
        />
      </div>
    </motion.div>
  );
}
