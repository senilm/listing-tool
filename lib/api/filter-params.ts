// Parses the multi-select status filter (?status=a&status=b) against an enum.
// Values outside the enum are dropped; no enum (endpoints without a status
// filter) yields an empty list.
export const parseStatusFilter = <S extends string>(
  params: URLSearchParams,
  statusEnum?: Record<string, S>,
): S[] => {
  if (!statusEnum) return [];
  const allowed = Object.values(statusEnum);
  return params
    .getAll("status")
    .filter((value): value is S => allowed.includes(value as S));
};
