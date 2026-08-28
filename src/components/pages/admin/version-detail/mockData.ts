// TODO: Replace with real genomics API when available.

export type SpeciesStatus = "complete" | "processing" | "failed";

export type SpeciesItem = {
  id: string;
  shorthand: string;
  scientificName: string;
  status: SpeciesStatus;
  progress: number;
  tags: string[];
};

export type OrthologyFileStatus = "synced" | "failed";

export type OrthologyFile = {
  id: string;
  name: string;
  updatedAt: string;
  status: OrthologyFileStatus;
};

export const mockSpecies: SpeciesItem[] = [
  {
    id: "1",
    shorthand: "Tcas",
    scientificName: "Tribolium castaneum",
    status: "complete",
    progress: 100,
    tags: ["Phylum: Arthropoda"],
  },
  {
    id: "2",
    shorthand: "Lyst",
    scientificName: "Lymnaea stagnalis",
    status: "processing",
    progress: 78,
    tags: ["Class: Gastropoda"],
  },
  {
    id: "3",
    shorthand: "Ptep",
    scientificName: "Parasteatoda tepidariorum",
    status: "complete",
    progress: 100,
    tags: ["Order: Araneae"],
  },
  {
    id: "4",
    shorthand: "Dmel",
    scientificName: "Drosophila melanogaster",
    status: "failed",
    progress: 45,
    tags: ["Order: Diptera"],
  },
];

export const mockOrthologyFiles: OrthologyFile[] = [
  {
    id: "1",
    name: "Tiger_Whale_v2.ortho",
    updatedAt: "Updated 2 hrs ago",
    status: "synced",
  },
  {
    id: "2",
    name: "Mammalia_Core_Consensus.ortho",
    updatedAt: "Updated yesterday",
    status: "synced",
  },
  {
    id: "3",
    name: "Insecta_Draft_Map.ortho",
    updatedAt: "Sync Failed",
    status: "failed",
  },
];
