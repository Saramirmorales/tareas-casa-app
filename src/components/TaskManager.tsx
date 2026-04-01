"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createTask, deleteTask, updateTask } from "@/actions/task";
import { ConfirmDialog } from "@/components/ConfirmDialog";

type Task = {
  id: string;
  title: string;
  points: number;
  type: string;
};

export function TaskManager({ houseId, tasks }: { houseId: string; tasks: Task[] }) {
  const router = useRouter();
  const [openCreate, setOpenCreate] = useState(false);
  const [editing, setEditing] = useState<Task | null>(null);
  const [deleting, setDeleting] = useState<Task | null>(null);
  const [busy, setBusy] = useState(false);

  async function onCreate(formData: FormData) {
    setBusy(true);
    const res = await createTask(houseId, formData);
    setBusy(false);
    if ("error" in res && res.error) {
      alert(res.error);
      return;
    }
    setOpenCreate(false);
    router.refresh();
  }

  async function onUpdate(formData: FormData) {
    if (!editing) return;
    setBusy(true);
    const res = await updateTask(editing.id, houseId, formData);
    setBusy(false);
    if ("error" in res && res.error) {
      alert(res.error);
      return;
    }
    setEditing(null);
    router.refresh();
  }

  async function onDelete() {
    if (!deleting) return;
    setBusy(true);
    const res = await deleteTask(deleting.id, houseId);
    setBusy(false);
    setDeleting(null);
    if ("error" in res && res.error) {
      alert(res.error);
      return;
    }
    router.refresh();
  }

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-slate-900">Tareas</h2>
        <button
          type="button"
          className="rounded-lg bg-teal-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-teal-700"
          onClick={() => setOpenCreate(true)}
        >
          Nueva tarea
        </button>
      </div>

      {tasks.length === 0 ? (
        <p className="text-sm text-slate-500">Aún no hay tareas. Crea la primera.</p>
      ) : (
        <ul className="divide-y divide-slate-100">
          {tasks.map((t) => (
            <li
              key={t.id}
              className="flex flex-wrap items-center justify-between gap-2 py-2 first:pt-0 last:pb-0"
            >
              <div>
                <p className="font-medium text-slate-900">{t.title}</p>
                <p className="text-xs text-slate-500">
                  {t.points} pts · tipo: {t.type}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  className="text-xs font-medium text-teal-700 hover:underline"
                  onClick={() => setEditing(t)}
                >
                  Editar
                </button>
                <button
                  type="button"
                  className="text-xs font-medium text-red-600 hover:underline"
                  onClick={() => setDeleting(t)}
                >
                  Borrar
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <TaskModal
        title="Nueva tarea"
        open={openCreate}
        onClose={() => !busy && setOpenCreate(false)}
        onSubmit={onCreate}
        busy={busy}
      />

      <TaskModal
        title="Editar tarea"
        open={!!editing}
        initial={editing ?? undefined}
        onClose={() => !busy && setEditing(null)}
        onSubmit={onUpdate}
        busy={busy}
      />

      <ConfirmDialog
        open={!!deleting}
        title="Borrar tarea"
        message={
          deleting
            ? `¿Seguro que quieres borrar «${deleting.title}»? Se perderán los registros asociados.`
            : ""
        }
        confirmLabel="Borrar"
        danger
        onConfirm={onDelete}
        onClose={() => !busy && setDeleting(null)}
      />
    </section>
  );
}

function TaskModal({
  title,
  open,
  initial,
  onClose,
  onSubmit,
  busy,
}: {
  title: string;
  open: boolean;
  initial?: Task;
  onClose: () => void;
  onSubmit: (fd: FormData) => Promise<void>;
  busy: boolean;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
      <div
        className="absolute inset-0"
        aria-hidden
        onClick={() => !busy && onClose()}
      />
      <div className="relative w-full max-w-md rounded-xl border border-slate-200 bg-white shadow-xl">
        <form
          className="flex flex-col"
          action={async (fd) => {
            await onSubmit(fd);
          }}
        >
          <div className="border-b border-slate-100 px-5 py-4">
            <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
          </div>
          <div className="space-y-3 px-5 py-4">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">Título</label>
              <input
                key={initial?.id ?? "new"}
                name="title"
                required
                defaultValue={initial?.title}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">Puntos</label>
                <input
                  key={`${initial?.id ?? "new"}-pts`}
                  name="points"
                  type="number"
                  min={0}
                  required
                  defaultValue={initial?.points ?? 1}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">Tipo</label>
                <input
                  key={`${initial?.id ?? "new"}-type`}
                  name="type"
                  placeholder="general"
                  defaultValue={initial?.type ?? "general"}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                />
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2 border-t border-slate-100 px-5 py-4">
            <button
              type="button"
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
              onClick={onClose}
              disabled={busy}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={busy}
              className="rounded-lg bg-teal-600 px-3 py-2 text-sm font-medium text-white hover:bg-teal-700 disabled:opacity-60"
            >
              {busy ? "Guardando…" : "Guardar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
