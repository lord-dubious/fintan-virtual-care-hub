export const safeParseDate = (v: unknown): Date | null =>
  (typeof v === 'string' || typeof v === 'number' || v instanceof Date)
    ? new Date(v as any)
    : null;
