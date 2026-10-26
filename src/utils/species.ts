export const isBeetleSpecies = (speciesCode?: string | null) =>
  typeof speciesCode === "string" && speciesCode === "Tcas";
