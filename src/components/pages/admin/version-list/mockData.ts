// TODO: Replace with real genomics API when available.

export type VersionItem = {
  id: string;
  name: string;
  createdAt: string;
  isDefault: boolean;
  status: "DRAFT" | "PROCESSING" | "ERROR" | "READY" | "MISSING_REQUIRED_FILE";
  totalFileSize: number;
};

export const mockVersions: VersionItem[] = [
  {
    id: "1",
    name: "v3.5.0",
    createdAt: "2026-07-28T09:00:00Z",
    isDefault: false,
    status: "PROCESSING",
    totalFileSize: 1284976640,
  },
  {
    id: "2",
    name: "v3.4.2",
    createdAt: "2026-04-15T12:30:00Z",
    isDefault: true,
    status: "READY",
    totalFileSize: 241817600,
  },
  {
    id: "3",
    name: "v3.4.1",
    createdAt: "2026-01-09T15:20:00Z",
    isDefault: false,
    status: "READY",
    totalFileSize: 239861760,
  },
  {
    id: "4",
    name: "v3.4.0",
    createdAt: "2025-11-22T08:45:00Z",
    isDefault: false,
    status: "MISSING_REQUIRED_FILE",
    totalFileSize: 54353920,
  },
  {
    id: "5",
    name: "v3.3.0",
    createdAt: "2025-08-01T10:00:00Z",
    isDefault: false,
    status: "ERROR",
    totalFileSize: 102760448,
  },
  {
    id: "6",
    name: "draft-wip",
    createdAt: "2025-07-20T18:10:00Z",
    isDefault: false,
    status: "DRAFT",
    totalFileSize: 0,
  },
];

export function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const value = bytes / Math.pow(1024, i);
  return `${value.toFixed(value >= 10 || i === 0 ? 0 : 1)} ${units[i]}`;
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
