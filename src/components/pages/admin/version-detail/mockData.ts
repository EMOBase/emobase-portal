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
