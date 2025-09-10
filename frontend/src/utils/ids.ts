export function slugifyName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

export function makeZoneId(name: string): string {
  const s = slugifyName(name);
  if (!s) return "";
  if (s === "zone" || s.startsWith("zone")) return s;
  return `zone_${s}`;
}

export function makeCategoryId(name: string): string {
  const s = slugifyName(name);
  if (!s) return "";
  if (s === "cat" || s.startsWith("cat")) return s;
  return `cat_${s}`;
}
