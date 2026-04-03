import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/session";
import { firstSearchParam } from "@/lib/searchParams";
import { JoinHouseForm } from "@/components/JoinHouseForm";

export default async function JoinPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const inviteCode = firstSearchParam(sp.code)?.trim();

  if (!inviteCode) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-linear-to-b from-slate-50 to-white px-4 py-16">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-xs">
          <h1 className="text-xl font-semibold text-slate-900">Invitación inválida</h1>
          <p className="mt-2 text-sm text-slate-600">Falta el código de invitación.</p>
        </div>
      </main>
    );
  }

  const house = await prisma.house.findUnique({
    where: { inviteCode },
    select: { id: true, name: true },
  });

  if (!house) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-linear-to-b from-slate-50 to-white px-4 py-16">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-xs">
          <h1 className="text-xl font-semibold text-slate-900">Invitación inválida</h1>
          <p className="mt-2 text-sm text-slate-600">
            El enlace no existe o ya no está disponible.
          </p>
        </div>
      </main>
    );
  }

  const userId = await getSessionUserId();
  if (userId) {
    await prisma.houseMember.upsert({
      where: { userId_houseId: { userId, houseId: house.id } },
      create: { userId, houseId: house.id },
      update: {},
    });
    redirect(`/houses/${house.id}`);
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-linear-to-b from-slate-50 to-white px-4 py-16">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-xs">
        <h1 className="text-center text-2xl font-semibold tracking-tight text-slate-900">
          Unirte a una casa
        </h1>
        <div className="mt-6">
          <JoinHouseForm inviteCode={inviteCode} houseName={house.name} />
        </div>
      </div>
    </main>
  );
}
