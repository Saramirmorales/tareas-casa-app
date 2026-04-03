import { AddMemberForm } from "@/components/AddMemberForm";
import { CopyInviteLinkButton } from "@/components/CopyInviteLinkButton";
import { DeleteHouseButton } from "@/components/DeleteHouseButton";
import { PointsHeader } from "@/components/PointsHeader";
import { StatsPanel } from "@/components/StatsPanel";
import { TaskManager } from "@/components/TaskManager";
import { WeekNav } from "@/components/WeekNav";
import { WeekTasks } from "@/components/WeekTasks";
import { prisma } from "@/lib/prisma";
import { firstSearchParam } from "@/lib/searchParams";
import { getSessionUserId } from "@/lib/session";
import { dayKey, getWeekDays } from "@/lib/week";
import { endOfDay, format, startOfDay } from "date-fns";
import { es } from "date-fns/locale";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function HousePage({
  params,
  searchParams,
}: {
  params: Promise<{ houseId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { houseId } = await params;
  const sp = await searchParams;
  const w = parseInt(firstSearchParam(sp.w) ?? "0", 10);
  const weekOffset = Number.isFinite(w) ? w : 0;

  const userId = await getSessionUserId();
  if (!userId) return null;

  const house = await prisma.house.findFirst({
    where: { id: houseId, members: { some: { userId } } },
    include: {
      members: { include: { user: true } },
      tasks: { orderBy: { title: "asc" } },
    },
  });

  if (!house) notFound();

  const { days, weekNumber, start, end } = getWeekDays(new Date(), weekOffset);

  const completionsRaw = await prisma.taskCompletion.findMany({
    where: {
      task: { houseId },
      completedAt: { gte: startOfDay(start), lte: endOfDay(end) },
    },
    include: { user: true, task: true },
  });

  const completions = completionsRaw.map((c) => ({
    id: c.id,
    taskId: c.taskId,
    dayKey: format(c.completedAt, "yyyy-MM-dd"),
    userId: c.userId,
    userEmail: c.user.email,
  }));

  const pointsByUser = new Map<string, number>();
  for (const m of house.members) {
    pointsByUser.set(m.user.id, 0);
  }
  for (const c of completionsRaw) {
    pointsByUser.set(
      c.userId,
      (pointsByUser.get(c.userId) ?? 0) + c.task.points,
    );
  }

  const pointsHeader = house.members
    .map((m) => ({
      userId: m.user.id,
      email: m.user.email,
      points: pointsByUser.get(m.user.id) ?? 0,
    }))
    .sort((a, b) => b.points - a.points);

  const taskCounts = new Map<string, number>();
  for (const m of house.members) {
    taskCounts.set(m.user.id, 0);
  }
  for (const c of completionsRaw) {
    taskCounts.set(c.userId, (taskCounts.get(c.userId) ?? 0) + 1);
  }

  const tasksPerUser = house.members
    .map((m) => ({
      label: m.user.email,
      value: taskCounts.get(m.user.id) ?? 0,
    }))
    .sort((a, b) => Number(b.value) - Number(a.value));

  const pointsPerUser = house.members
    .map((m) => ({
      label: m.user.email,
      value: pointsByUser.get(m.user.id) ?? 0,
    }))
    .sort((a, b) => Number(b.value) - Number(a.value));

  const typePoints = new Map<string, number>();
  for (const c of completionsRaw) {
    const t = c.task.type;
    typePoints.set(t, (typePoints.get(t) ?? 0) + c.task.points);
  }
  const byType = [...typePoints.entries()]
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value);

  const dayCols = days.map((d) => ({
    key: dayKey(d),
    label: format(d, "EEE d", { locale: es }),
  }));

  const tasks = house.tasks.map((t) => ({
    id: t.id,
    title: t.title,
    points: t.points,
    type: t.type,
  }));

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link href="/houses" className="text-xs font-medium text-blue-700 hover:underline">
            ← Casas
          </Link>
          <h1 className="mt-1 text-2xl font-semibold text-slate-900">{house.name}</h1>
        </div>
        <CopyInviteLinkButton inviteCode={house.inviteCode} />
      </div>

      {house.members.length < 2 ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
          Añade el email de otra persona para que haya al menos 2 miembros en esta casa (así
          refleja mejor un hogar compartido).
        </div>
      ) : null}

      <PointsHeader members={pointsHeader} />

      <WeekNav
        houseId={house.id}
        weekOffset={weekOffset}
        weekNumber={weekNumber}
        rangeStart={start}
        rangeEnd={end}
      />

      <TaskManager houseId={house.id} tasks={tasks} />

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-slate-900">Semana</h2>
        <WeekTasks
          houseId={house.id}
          days={dayCols}
          tasks={tasks}
          completions={completions}
          disabled={house.members.length < 2}
        />
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
        <h2 className="text-sm font-semibold text-slate-900">Miembros</h2>
        <ul className="mt-3 space-y-1 text-sm text-slate-700">
          {house.members.map((m) => (
            <li key={m.userId}>{m.user.email}</li>
          ))}
        </ul>
        <div className="mt-4">
          <AddMemberForm houseId={house.id} />
        </div>
      </section>

      <StatsPanel
        tasksPerUser={tasksPerUser}
        pointsPerUser={pointsPerUser}
        byType={byType}
      />

      <DeleteHouseButton houseId={house.id} houseName={house.name} />
    </div>
  );
}
