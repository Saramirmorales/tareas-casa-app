/** Next.js `searchParams` values can be `string | string[]`. */
export function firstSearchParam(
  value: string | string[] | undefined,
): string | undefined {
  if (value === undefined) return undefined;
  const s = Array.isArray(value) ? value[0] : value;
  return s === "" ? undefined : s;
}
