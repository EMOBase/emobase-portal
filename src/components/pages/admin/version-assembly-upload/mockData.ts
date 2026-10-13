// TODO: Replace with real genomics API when available.

export type FileStatus = {
  id?: string;
  name: string;
  category: string;
  status:
    | "PENDING"
    | "UPLOADING"
    | "PAUSED"
    | "PROCESSING"
    | "READY"
    | "ERROR"
    | "DISABLED";
  progress?: number;
  progressTitle?: string;
  size?: string;
  error?: string;
  icon: string;
  theme?: "orange" | "blue";
};

export const mockVersion = {
  name: "v2.1.0",
  isDefault: false,
  status: "READY",
};

export const mockSpecies = {
  code: "Tcas",
  name: "Tribolium castaneum",
};

export const mockMainFiles: FileStatus[] = [
  {
    name: "genomic.fna",
    category: "Genome Sequence",
    status: "READY",
    progress: 100,
    size: "48.68 MB",
    icon: "file-text",
    theme: "blue",
  },
  {
    name: "genomic.gff",
    category: "Genome Annotation",
    status: "READY",
    progress: 100,
    size: "3.47 MB",
    icon: "hash",
    theme: "blue",
  },
  {
    name: "rna.fna",
    category: "RNA Sequences",
    status: "READY",
    progress: 100,
    size: "10.49 MB",
    icon: "microscope",
    theme: "blue",
  },
  {
    name: "cds.fna",
    category: "Coding Sequences",
    status: "READY",
    progress: 100,
    size: "8.05 MB",
    icon: "braces",
    theme: "blue",
  },
];

export const mockJBrowseTracks: FileStatus[] = [
  {
    id: "jb1",
    name: "au4.liftover.sorted.gff.gz",
    category: "JBrowse2 Track",
    status: "READY",
    progress: 100,
    size: "3.72 MB",
    icon: "database",
    theme: "blue",
  },
  {
    id: "jb2",
    name: "OGS2.track.gff.gz",
    category: "JBrowse2 Track",
    status: "READY",
    progress: 100,
    size: "1.29 MB",
    icon: "database",
    theme: "blue",
  },
];

export const mockSynonyms: FileStatus[] = [
  {
    id: "syn1",
    name: "iB_TC.csv.gz",
    category: "Synonyms",
    status: "READY",
    progress: 100,
    size: "78.73 KB",
    icon: "book-open",
    theme: "blue",
  },
];
