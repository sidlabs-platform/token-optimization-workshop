export function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}
export function stableId(prefix: string, parts: Array<string | number>): string {
  return `${prefix}-${slugify(parts.join('-'))}`;
}
export function fingerprint(parts: Array<string | number | undefined>): string {
  return slugify(parts.filter(Boolean).join('|')).slice(0, 96);
}
