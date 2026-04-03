"use client";

import { Fragment, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { addCompletion, deleteCompletion } from "@/actions/task";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { cn } from "@/lib/cn";

export type WeekTask = {
  id: string;
  title: string;
  points: number;
  type: string;
};

export type WeekCompletion = {
  id: string;
  taskId: string;
  dayKey: string;
  userId: string;
  userEmail: string;
};

export type WeekDayCol = { key: string; label: string };

type Props = {
  houseId: string;
  days: WeekDayCol[];
  tasks: WeekTask[];
  completions: WeekCompletion[];
  disabled?: boolean;
};

type PendingAdd = { taskId: string; dayKey: string };
type PendingDelete = { id: string };
type UndoState = { id: string; expires: number };

export function WeekTasks({ houseId, days, tasks, completions, disabled }: Props) {
  const router = useRouter();
  const [pendingAdd, setPendingAdd] = useState<PendingAdd | null>(null);
  const [pendingDelete, setPendingDelete] = useState<PendingDelete | null>(null);
  const [busy, setBusy] = useState(false);
  const [undo, setUndo] = useState<UndoState | null>(null);

  useEffect(() => {
    if (!undo) return;
    const t = setTimeout(() => setUndo(null), 12_000);
    return () => clearTimeout(t);
  }, [undo]);

  const byTaskDay = useMemo(() => {
    const map = new Map<string, WeekCompletion[]>();
    for (const c of completions) {
      const k = `${c.taskId}:${c.dayKey}`;
      const arr = map.get(k) ?? [];
      arr.push(c);
      map.set(k, arr);
    }
    return map;
  }, [completions]);

  async function confirmAdd() {
    if (!pendingAdd) return;
    setBusy(true);
    const res = await addCompletion(pendingAdd.taskId, houseId, pendingAdd.dayKey);
    setBusy(false);
    if (res && "error" in res && res.error) {
      alert(res.error);
      return;
    }
    setPendingAdd(null);
    if ("completionId" in res && res.completionId) {
      setUndo({ id: res.completionId, expires: Date.now() + 12_000 });
    }
    router.refresh();
  }

  async function confirmDelete() {
    if (!pendingDelete) return;
    setBusy(true);
    const res = await deleteCompletion(pendingDelete.id, houseId);
    setBusy(false);
    if (res && "error" in res && res.error) {
      alert(res.error);
      return;
    }
    setPendingDelete(null);
    router.refresh();
  }

  async function doUndo() {
    if (!undo) return;
    setBusy(true);
    await deleteCompletion(undo.id, houseId);
    setBusy(false);
    setUndo(null);
    router.refresh();
  }

  if (tasks.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/80 p-8 text-center text-sm text-slate-600">
        No hay tareas. Crea la primera en la sección «Tareas» para rellenar la tabla semanal.
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-xs">
        <div
          className="grid min-w-[720px] gap-px bg-slate-200"
          style={{
            gridTemplateColumns: `minmax(9rem, 1.4fr) repeat(${days.length}, minmax(0, 1fr))`,
          }}
        >
          <div className="bg-slate-50 px-2 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Tarea
          </div>
          {days.map((d) => (
            <div
              key={d.key}
              className="bg-slate-50 px-1 py-2 text-center text-xs font-semibold capitalize text-slate-600"
            >
              {d.label}
            </div>
          ))}

          {tasks.map((task) => (
            <Fragment key={task.id}>
              <div className="flex flex-col justify-center bg-white px-2 py-2">
                <span className="font-medium text-slate-900">{task.title}</span>
                <span className="text-xs text-slate-500">
                  {task.points} pts · {task.type}
                </span>
              </div>
              {days.map((d) => {
                const key = `${task.id}:${d.key}`;
                const list = byTaskDay.get(key) ?? [];
                return (
                  <div
                    key={key}
                    className="flex min-h-[4.5rem] flex-col gap-1 bg-white p-1.5"
                  >
                    <div className="flex flex-wrap gap-1">
                      {list.map((c) => (
                        <button
                          key={c.id}
                          type="button"
                          disabled={disabled || busy}
                          title="Quitar"
                          className={cn(
                            "max-w-full truncate rounded-md border border-blue-100 bg-blue-50 px-1.5 py-0.5 text-left text-[11px] text-blue-900",
                            "hover:border-red-200 hover:bg-red-50 hover:text-red-800",
                            disabled && "opacity-50",
                          )}
                          onClick={() => setPendingDelete({ id: c.id })}
                        >
                          {c.userEmail.split("@")[0]}
                        </button>
                      ))}
                    </div>
                    <button
                      type="button"
                      disabled={disabled || busy}
                      className="mt-auto rounded-md border border-dashed border-slate-200 py-1 text-[11px] text-slate-500 hover:border-blue-300 hover:text-blue-700 disabled:opacity-50"
                      onClick={() => setPendingAdd({ taskId: task.id, dayKey: d.key })}
                    >
                      + Añadir
                    </button>
                  </div>
                );
              })}
            </Fragment>
          ))}
        </div>
      </div>

      <ConfirmDialog
        open={!!pendingAdd}
        title="Registrar completado"
        message={
          pendingAdd
            ? "¿Añadir un completado para esta tarea en el día seleccionado?"
            : ""
        }
        confirmLabel="Sí, registrar"
        onConfirm={confirmAdd}
        onClose={() => !busy && setPendingAdd(null)}
      />

      <ConfirmDialog
        open={!!pendingDelete}
        title="Quitar completado"
        message="¿Eliminar este registro? También puedes usar «Deshacer» justo después de añadir."
        confirmLabel="Eliminar"
        danger
        onConfirm={confirmDelete}
        onClose={() => !busy && setPendingDelete(null)}
      />

      {undo ? (
        <div className="fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-3 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm shadow-lg">
          <span className="text-slate-700">Completado guardado.</span>
          <button
            type="button"
            disabled={busy}
            className="font-medium text-blue-700 hover:underline disabled:opacity-50"
            onClick={doUndo}
          >
            Deshacer
          </button>
          <button
            type="button"
            className="text-slate-400 hover:text-slate-600"
            onClick={() => setUndo(null)}
          >
            ✕
          </button>
        </div>
      ) : null}
    </div>
  );
}
