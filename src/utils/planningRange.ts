// src/utils/planningRange.ts

export type PlanningMode = '24H' | 'DAY' | 'WEEK';

export function getRangeForMode(
  mode: PlanningMode,
  selectedDate: Date,
): { from: Date; to: Date } {
  const now = new Date();

  if (mode === '24H') {
    const from = now;
    const to = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    return { from, to };
  }

  if (mode === 'DAY') {
    const from = new Date(
      selectedDate.getFullYear(),
      selectedDate.getMonth(),
      selectedDate.getDate(),
      0,
      0,
      0,
      0,
    );
    const to = new Date(from.getTime() + 24 * 60 * 60 * 1000);
    return { from, to };
  }

  // WEEK
  const from = new Date(
    selectedDate.getFullYear(),
    selectedDate.getMonth(),
    selectedDate.getDate(),
    0,
    0,
    0,
    0,
  );
  const to = new Date(from.getTime() + 7 * 24 * 60 * 60 * 1000);
  return { from, to };
}
