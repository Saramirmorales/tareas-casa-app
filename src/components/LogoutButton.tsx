"use client";

import { logout } from "@/actions/auth";
import { useRouter } from "next/navigation";

export function LogoutButton() {
  const router = useRouter();

  return (
    <button
      type="button"
      className="text-sm text-slate-600 hover:text-slate-900"
      onClick={async () => {
        await logout();
        router.push("/");
        router.refresh();
      }}
    >
      Salir
    </button>
  );
}
