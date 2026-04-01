"use client";

import { useEffect, useRef } from "react";
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
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open) el.showModal();
    else el.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      className={cn(
        "max-w-md rounded-xl border border-slate-200 bg-white p-0 shadow-xl backdrop:bg-slate-900/40",
        "open:flex open:flex-col",
      )}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
    >
      <div className="border-b border-slate-100 px-5 py-4">
        <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
        <p className="mt-1 text-sm text-slate-600">{message}</p>
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
            danger ? "bg-red-600 hover:bg-red-700" : "bg-teal-600 hover:bg-teal-700",
          )}
          onClick={() => {
            void Promise.resolve(onConfirm());
          }}
        >
          {confirmLabel}
        </button>
      </div>
    </dialog>
  );
}
