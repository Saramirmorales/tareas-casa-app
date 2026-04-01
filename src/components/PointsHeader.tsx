type MemberPoints = { userId: string; email: string; points: number };

export function PointsHeader({ members }: { members: MemberPoints[] }) {
  if (members.length === 0) return null;
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
      <span className="text-sm font-medium text-slate-500">Puntos (esta semana)</span>
      <div className="flex flex-wrap gap-2">
        {members.map((m) => (
          <span
            key={m.userId}
            className="inline-flex items-center gap-1 rounded-full bg-teal-50 px-3 py-1 text-sm text-teal-900"
          >
            <span className="max-w-[10rem] truncate">{m.email}</span>
            <span className="font-semibold tabular-nums">{m.points}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
