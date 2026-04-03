"use client";

import { useState } from "react";

type Props = {
  inviteCode: string;
};

export function CopyInviteLinkButton({ inviteCode }: Props) {
  const [copied, setCopied] = useState(false);

  async function onCopy() {
    const url = `${window.location.origin}/join?code=${encodeURIComponent(inviteCode)}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  }

  return (
    <button
      type="button"
      onClick={onCopy}
      className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
    >
      {copied ? "Enlace copiado" : "Copiar enlace de invitación"}
    </button>
  );
}
