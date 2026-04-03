"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteHouse } from "@/actions/house";
import { ConfirmDialog } from "@/components/ConfirmDialog";

type Props = {
  houseId: string;
  houseName: string;
};

export function DeleteHouseButton({ houseId, houseName }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleConfirm() {
    setError(null);
    setPending(true);
    const res = await deleteHouse(houseId);
    setPending(false);
    if (res && "error" in res) {
      setError(res.error ?? "No se pudo eliminar.");
      return;
    }
    setOpen(false);
    router.push("/houses");
    router.refresh();
  }

  return (
    <>
      <div className="rounded-xl border border-red-200 bg-red-50/50 p-5">
        <h2 className="text-sm font-semibold text-red-900">Eliminar casa</h2>
        <p className="mt-1 text-xs text-red-800/90">
          Se borran tareas, registros y miembros de esta casa. Cualquier miembro puede hacerlo.
        </p>
        {error ? <p className="mt-2 text-sm text-red-700">{error}</p> : null}
        <button
          type="button"
          disabled={pending}
          onClick={() => setOpen(true)}
          className="mt-3 rounded-lg border border-red-300 bg-white px-3 py-2 text-sm font-semibold text-red-800 hover:bg-red-100 disabled:opacity-60"
        >
          Eliminar esta casa…
        </button>
      </div>
      <ConfirmDialog
        open={open}
        title="¿Eliminar esta casa?"
        message={`Vas a eliminar «${houseName}» para todos. Esta acción no se puede deshacer.`}
        confirmLabel={pending ? "Eliminando…" : "Sí, eliminar"}
        cancelLabel="Cancelar"
        danger
        onClose={() => !pending && setOpen(false)}
        onConfirm={handleConfirm}
      />
    </>
  );
}
