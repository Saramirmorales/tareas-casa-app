"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { addHouseMember } from "@/actions/house";

export function AddMemberForm({ houseId }: { houseId: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  return (
    <form
      className="flex flex-col gap-2 sm:flex-row sm:items-end"
      action={async (formData) => {
        setError(null);
        setPending(true);
        const res = await addHouseMember(houseId, formData);
        setPending(false);
        if (res && "error" in res) setError(res.error ?? null);
        else router.refresh();
      }}
    >
      <div className="flex-1">
        <label htmlFor={`member-email-${houseId}`} className="mb-1 block text-xs font-medium text-slate-600">
          Email del miembro
        </label>
        <input
          id={`member-email-${houseId}`}
          name="email"
          type="email"
          required
          placeholder="otra@persona.com"
          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
        />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50 disabled:opacity-60"
      >
        {pending ? "Añadiendo…" : "Añadir"}
      </button>
      {error ? <p className="w-full text-sm text-red-600">{error}</p> : null}
    </form>
  );
}
