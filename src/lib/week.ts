import {
  addWeeks,
  eachDayOfInterval,
  endOfDay,
  endOfWeek,
  format,
  getISOWeek,
  startOfDay,
  startOfWeek,
} from "date-fns";

export function getWeekDays(reference: Date, weekOffset: number) {
  const base = addWeeks(reference, weekOffset);
  const start = startOfWeek(base, { weekStartsOn: 1 });
  const end = endOfWeek(base, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start, end });
  return { start, end, days, weekNumber: getISOWeek(start) };
}

export function dayKey(d: Date) {
  return format(d, "yyyy-MM-dd");
}

export function parseDayKey(key: string) {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function dayBoundsLocal(key: string) {
  const d = parseDayKey(key);
  return { start: startOfDay(d), end: endOfDay(d) };
}
