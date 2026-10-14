export const isBeetleSpecies = (species: string) =>
  species === "Tcas" || /tribolium\s+castaneum/i.test(species);
