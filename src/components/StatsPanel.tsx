type Row = { label: string; value: string | number };

export function StatsPanel({
  tasksPerUser,
  pointsPerUser,
  byType,
}: {
  tasksPerUser: Row[];
  pointsPerUser: Row[];
  byType: Row[];
}) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
      <h2 className="mb-3 text-sm font-semibold text-slate-900">Estadísticas (esta semana)</h2>
      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <h3 className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">
            Completados por persona
          </h3>
          <ul className="space-y-1 text-sm">
            {tasksPerUser.length === 0 ? (
              <li className="text-slate-400">Sin datos</li>
            ) : (
              tasksPerUser.map((r) => (
                <li key={r.label} className="flex justify-between gap-2 text-slate-700">
                  <span className="truncate">{r.label}</span>
                  <span className="tabular-nums font-medium">{r.value}</span>
                </li>
              ))
            )}
          </ul>
        </div>
        <div>
          <h3 className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">
            Puntos por persona
          </h3>
          <ul className="space-y-1 text-sm">
            {pointsPerUser.length === 0 ? (
              <li className="text-slate-400">Sin datos</li>
            ) : (
              pointsPerUser.map((r) => (
                <li key={r.label} className="flex justify-between gap-2 text-slate-700">
                  <span className="truncate">{r.label}</span>
                  <span className="tabular-nums font-medium">{r.value}</span>
                </li>
              ))
            )}
          </ul>
        </div>
        <div>
          <h3 className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">
            Por tipo de tarea
          </h3>
          <ul className="space-y-1 text-sm">
            {byType.length === 0 ? (
              <li className="text-slate-400">Sin datos</li>
            ) : (
              byType.map((r) => (
                <li key={r.label} className="flex justify-between gap-2 text-slate-700">
                  <span className="truncate">{r.label}</span>
                  <span className="tabular-nums font-medium">{r.value}</span>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>
    </section>
  );
}
