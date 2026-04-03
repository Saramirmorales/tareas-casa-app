import Link from "next/link";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export function WeekNav({
  houseId,
  weekOffset,
  weekNumber,
  rangeStart,
  rangeEnd,
}: {
  houseId: string;
  weekOffset: number;
  weekNumber: number;
  rangeStart: Date;
  rangeEnd: Date;
}) {
  const sameMonth =
    rangeStart.getMonth() === rangeEnd.getMonth() &&
    rangeStart.getFullYear() === rangeEnd.getFullYear();
  const monthLabel = sameMonth
    ? format(rangeStart, "MMMM yyyy", { locale: es })
    : `${format(rangeStart, "d MMM", { locale: es })} – ${format(rangeEnd, "d MMM yyyy", { locale: es })}`;

  const prev = weekOffset - 1;
  const next = weekOffset + 1;

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
      <div className="flex flex-wrap items-center gap-2">
        <Link
          href={`/houses/${houseId}?w=${prev}`}
          className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          ← Anterior
        </Link>
        <Link
          href={`/houses/${houseId}?w=${next}`}
          className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Siguiente →
        </Link>
        <Link
          href={`/houses/${houseId}?w=0`}
          className="rounded-lg px-2 py-1.5 text-sm text-blue-700 hover:underline"
        >
          Esta semana
        </Link>
      </div>
      <div className="text-right text-sm text-slate-600">
        <p className="font-semibold text-slate-900">Semana {weekNumber}</p>
        <p className="capitalize">{monthLabel}</p>
      </div>
    </div>
  );
}
