export function slugifyName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

export function makeZoneId(name: string): string {
  const s = slugifyName(name);
  return s ? `zone_${s}` : "";
}

export function makeCategoryId(name: string): string {
  const s = slugifyName(name);
  return s ? `cat_${s}` : "";
}
