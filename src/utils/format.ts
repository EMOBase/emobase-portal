/**
 * Formats a number of bytes into a human-readable string (e.g., "133 MB").
 * Uses adaptive precision — one decimal below 10, otherwise whole numbers —
 * and returns "0 B" for empty sizes rather than a placeholder.
 * @param bytes The number of bytes to format
 * @returns A formatted string
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const value = bytes / Math.pow(1024, i);
  return `${value.toFixed(value >= 10 || i === 0 ? 0 : 1)} ${units[i]}`;
}
