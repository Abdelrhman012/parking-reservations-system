export function formatGateLabel(id?: string) {
  if (!id) return "Gate";
  const m = id.match(/^gate[_-]?(\d+)$/i);
  if (m) return `Gate ${m[1]}`;
  // Fallback: humanize any other id
  return id.replace(/[_-]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}
