export function makeZoneId(name: string): string {
  const base = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_") // non-alphanumerics -> _
    .replace(/^_+|_+$/g, ""); // trim underscores

  if (!base) return "";
  // ensure it starts with "zone_" (e.g. "Zone 3" -> "zone_3")
  return base.startsWith("zone_") ? base : `zone_${base}`;
}
