"use client";

import { useEffect } from "react";
import { cn } from "@/lib/cn";

type Props = {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  onConfirm: () => void | Promise<void>;
  onClose: () => void;
};

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  danger,
  onConfirm,
  onClose,
}: Props) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 p-4"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="confirm-title"
      aria-describedby="confirm-desc"
    >
      <button
        type="button"
        className="absolute inset-0 cursor-default"
        aria-label="Cerrar"
        onClick={onClose}
      />
      <div
        className={cn(
          "relative z-[1] flex w-full max-w-md flex-col rounded-xl border border-slate-200 bg-white p-0 shadow-xl",
        )}
      >
        <div className="border-b border-slate-100 px-5 py-4">
          <h2 id="confirm-title" className="text-lg font-semibold text-slate-900">
            {title}
          </h2>
          <p id="confirm-desc" className="mt-1 text-sm text-slate-600">
            {message}
          </p>
        </div>
        <div className="flex justify-end gap-2 px-5 py-4">
          <button
            type="button"
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            onClick={onClose}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            className={cn(
              "rounded-lg px-3 py-2 text-sm font-medium text-white",
              danger ? "bg-red-600 hover:bg-red-700" : "bg-blue-600 hover:bg-blue-700",
            )}
            onClick={() => {
              void Promise.resolve(onConfirm());
            }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
