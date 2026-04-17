const YYYY_MM = /^(\d{4})-(\d{2})/;

export function formatMonth(input: string): string {
  const m = YYYY_MM.exec(input);
  if (!m) return input;
  return `${m[1]}-${m[2]}`;
}
