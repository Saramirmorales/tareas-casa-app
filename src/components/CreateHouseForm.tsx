"use client";

import { useState } from "react";
import { createHouse } from "@/actions/house";

export function CreateHouseForm() {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  return (
    <form
      className="flex flex-col gap-3 sm:flex-row sm:items-end"
      action={async (formData) => {
        setError(null);
        setPending(true);
        try {
          const res = await createHouse(formData);
          if (res && "error" in res) setError(res.error ?? null);
        } finally {
          setPending(false);
        }
      }}
    >
      <div className="flex-1">
        <label htmlFor="house-name" className="mb-1 block text-xs font-medium text-slate-600">
          Nombre de la casa
        </label>
        <input
          id="house-name"
          name="name"
          required
          placeholder="Ej. Piso centro"
          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
        />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
      >
        {pending ? "Creando…" : "Crear casa"}
      </button>
      {error ? <p className="w-full text-sm text-red-600 sm:col-span-full">{error}</p> : null}
    </form>
  );
}
