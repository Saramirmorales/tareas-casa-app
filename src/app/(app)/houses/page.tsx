import Link from "next/link";
import { CreateHouseForm } from "@/components/CreateHouseForm";
import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/session";

export default async function HousesPage() {
  const userId = await getSessionUserId();
  if (!userId) return null;

  const houses = await prisma.house.findMany({
    where: { members: { some: { userId } } },
    orderBy: { name: "asc" },
    include: {
      _count: { select: { members: true, tasks: true } },
    },
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Tus casas</h1>
        <p className="mt-1 text-sm text-slate-600">
          Cada casa agrupa miembros y tareas. Puedes pertenecer a varias.
        </p>
      </div>

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-900">Nueva casa</h2>
        <p className="mt-1 text-xs text-slate-500">Te añadimos como miembro automáticamente.</p>
        <div className="mt-4">
          <CreateHouseForm />
        </div>
      </section>

      {houses.length === 0 ? (
        <p className="text-sm text-slate-500">Aún no tienes casas. Crea una arriba.</p>
      ) : (
        <ul className="space-y-2">
          {houses.map((h) => (
            <li key={h.id}>
              <Link
                href={`/houses/${h.id}`}
                className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm transition hover:border-teal-200 hover:bg-teal-50/40"
              >
                <span className="font-medium text-slate-900">{h.name}</span>
                <span className="text-xs text-slate-500">
                  {h._count.members} miembros · {h._count.tasks} tareas
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
