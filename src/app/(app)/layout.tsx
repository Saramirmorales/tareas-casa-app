import { LogoutButton } from "@/components/LogoutButton";
import { getSessionUserId } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const id = await getSessionUserId();
  if (!id) redirect("/");

  const user = await prisma.user.findUnique({
    where: { id },
    select: { email: true },
  });

  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3">
          <Link href="/houses" className="text-sm font-semibold text-blue-800 hover:underline">
            Tareas en casa
          </Link>
          <div className="flex items-center gap-3 text-sm text-slate-600">
            <span className="max-w-[14rem] truncate" title={user?.email}>
              {user?.email}
            </span>
            <LogoutButton />
          </div>
        </div>
      </header>
      <div className="mx-auto max-w-5xl px-4 py-8">{children}</div>
    </div>
  );
}
