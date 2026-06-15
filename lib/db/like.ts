// Escape LIKE/ILIKE wildcards so user input matches literally (Postgres treats
// %, _ and \ specially; \ is the default escape char).
export const escapeLike = (value: string) =>
  value.replace(/[\\%_]/g, (ch) => `\\${ch}`);

// Build a "contains" pattern for LIKE/ILIKE with the term escaped.
export const likeContains = (value: string) => `%${escapeLike(value)}%`;
