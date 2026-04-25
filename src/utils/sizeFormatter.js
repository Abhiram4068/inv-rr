export const sizeFormatter = (value) => {
  if (value === null || value === undefined) return "-";
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return "-";
    if (trimmed.includes("MB") || trimmed.includes("KB") || trimmed.includes("GB") || trimmed.includes(" B")) return trimmed;
    const parsed = Number(trimmed);
    if (Number.isFinite(parsed)) return sizeFormatter(parsed);
    return trimmed;
  }
  if (typeof value !== "number" || !Number.isFinite(value)) return "-";

  const mb = value / (1024 * 1024);
  if (mb >= 1024) return `${(mb / 1024).toFixed(2)} GB`;
  if (mb >= 1) return `${mb.toFixed(1)} MB`;
  
  const kb = value / 1024;
  if (kb < 1) return `${value} B`;
  return `${kb.toFixed(1)} KB`;
};