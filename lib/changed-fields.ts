export const getChangedFields = <T extends Record<string, unknown>>(
  before: Partial<Record<keyof T, unknown>>,
  after: T,
): (keyof T)[] =>
  (Object.keys(after) as (keyof T)[]).filter(
    (key) => JSON.stringify(before[key]) !== JSON.stringify(after[key]),
  );
