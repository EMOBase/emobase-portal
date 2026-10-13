// TODO: Replace with real genomics API when available.

import triboliumImage from "@/assets/species/500px-Tribolium_castaneum.jpg?url";
import spiderImage from "@/assets/species/Common_House_Spider.jpg?url";
import lymnaeaImage from "@/assets/species/Lymnaea-stagnalis.jpg?url";

export type SpeciesItem = {
  id: string;
  name: string;
  species: string;
  image?: string;
  size: string;
  siteUrl: string;
};

export const mockSpecies: SpeciesItem[] = [
  {
    id: "1",
    name: "Tcas 5.2",
    species: "Tribolium castaneum",
    image: triboliumImage,
    size: "241.8 MB",
    siteUrl: "https://ibeetle-base.uni-goettingen.de/",
  },
  {
    id: "2",
    name: "Lyst 1.0",
    species: "Lymnaea stagnalis",
    image: lymnaeaImage,
    size: "943.0 MB",
    siteUrl: "https://ibb-test.vm19002.virt.gwdg.de/",
  },
  {
    id: "3",
    name: "Ptep 1.0",
    species: "Parasteatoda tepidariorum",
    image: spiderImage,
    size: "1.1 GB",
    siteUrl: "https://ptep.emobase.uni-goettingen.de/",
  },
  {
    id: "4",
    name: "Dmel r6.59",
    species: "Drosophila melanogaster",
    size: "143.7 MB",
    siteUrl: "https://dmel.emobase.uni-goettingen.de/",
  },
];
