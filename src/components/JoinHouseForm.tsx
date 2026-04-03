"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { loginWithEmailAndInvite } from "@/actions/auth";

type Props = {
  inviteCode: string;
  houseName: string;
};

export function JoinHouseForm({ inviteCode, houseName }: Props) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(formData: FormData) {
    setError(null);
    setPending(true);
    const res = await loginWithEmailAndInvite(formData);
    setPending(false);

    if (!res) {
      setError("No se pudo conectar. Prueba de nuevo.");
      return;
    }
    if ("error" in res && res.error) {
      setError(res.error);
      return;
    }
    router.push(`/houses/${res.houseId}`);
  }

  return (
    <form action={onSubmit} className="flex w-full flex-col gap-4">
      <input type="hidden" name="inviteCode" value={inviteCode} />
      <p className="text-sm text-slate-600">
        Te han invitado a <span className="font-semibold text-slate-900">{houseName}</span>.
      </p>
      <div>
        <label htmlFor="email" className="mb-1 block text-sm font-medium text-slate-700">
          Tu email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="tu@email.com"
          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-900 shadow-xs outline-hidden ring-blue-500/30 focus:border-blue-500 focus:ring-2"
        />
      </div>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:opacity-60"
      >
        {pending ? "Uniendo…" : "Entrar y unirme"}
      </button>
    </form>
  );
}
