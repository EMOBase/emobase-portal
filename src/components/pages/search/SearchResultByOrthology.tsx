import type { GeneSearchResult } from "@/utils/services/genomics";
import ExternalGeneLink from "@/components/common/ExternalGeneLink";
import type { AssemblyVersionDetail } from "@/utils/services/genomics";
import { ExternalLink } from "lucide-react";

type OrthologyList = Exclude<GeneSearchResult["orthologies"], undefined>;

type SearchResultByOrthologyProps = {
  orthologies: OrthologyList;
  assemblies?: AssemblyVersionDetail[];
};

const SearchResultByOrthology: React.FC<SearchResultByOrthologyProps> = ({
  orthologies,
  assemblies = [],
}) => {
  const getAssemblyInfoUrl = (species: string) => {
    const assembly = assemblies.find(
      (a) =>
        a.speciesCode === species ||
        a.speciesName === species ||
        a.name === species,
    );
    return assembly?.infoUrl || undefined;
  };

  const getSpeciesDisplayName = (species: string) => {
    const assembly = assemblies.find(
      (a) =>
        a.speciesCode === species ||
        a.speciesName === species ||
        a.name === species,
    );
    if (assembly?.speciesName) return assembly.speciesName;
    if (assembly?.name) return assembly.name;
    return species;
  };

  const getPreferredSpeciesOrder = () => {
    if (assemblies.length > 0) {
      return assemblies
        .map((a) => a.speciesCode || a.speciesName || a.name)
        .filter(Boolean) as string[];
    }
    return [];
  };

  const sortOrthologsByPreferredSpecies = (
    orthologs: {
      species: string;
      genes: { gene: string; synonyms: string[] }[];
    }[],
  ) => {
    const preferredOrder = getPreferredSpeciesOrder();
    if (preferredOrder.length === 0) {
      return [...orthologs].sort((a, b) => a.species.localeCompare(b.species));
    }

    return [...orthologs].sort((a, b) => {
      const indexA = preferredOrder.findIndex(
        (p) =>
          p === a.species ||
          assemblies.find((asm) => asm.speciesCode === a.species)?.speciesName === p ||
          assemblies.find((asm) => asm.speciesName === a.species)?.speciesCode === p,
      );
      const indexB = preferredOrder.findIndex(
        (p) =>
          p === b.species ||
          assemblies.find((asm) => asm.speciesCode === b.species)?.speciesName === p ||
          assemblies.find((asm) => asm.speciesName === b.species)?.speciesCode === p,
      );
      if (indexA === -1 && indexB === -1) return a.species.localeCompare(b.species);
      if (indexA === -1) return 1;
      if (indexB === -1) return -1;
      return indexA - indexB;
    });
  };

  return (
    <div className="flex flex-col gap-4">
      {orthologies.map(({ group, source, orthologs }, index) => {
        const orderedOrthologs = sortOrthologsByPreferredSpecies(orthologs);
        const totalGenes = orderedOrthologs.reduce(
          (sum, o) => sum + o.genes.length,
          0,
        );
        const totalSpecies = orderedOrthologs.length;

        return (
          <div
            key={index}
            className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-6 py-4 bg-slate-50/50 border-b border-slate-200">
              <div className="flex items-center gap-3 flex-wrap">
                <span className="font-mono text-sm font-medium text-slate-900">
                  {group}
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium">
                  {source}
                </span>
                <span className="text-xs text-slate-500">
                  {totalGenes} {totalGenes === 1 ? "gene" : "genes"} across{" "}
                  {totalSpecies} {totalSpecies === 1 ? "species" : "species"}
                </span>
              </div>
              {source.toLowerCase() === "eggnog6" ? (
                <a
                  href={`http://eggnog6.embl.de/search/ogs/${group}/`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-slate-600 hover:text-slate-900 transition-colors flex items-center gap-1 font-medium"
                >
                  View tree
                  <ExternalLink className="size-3.5" />
                </a>
              ) : null}
            </div>
            <div className="divide-y divide-slate-100">
              {orderedOrthologs.map(({ species, genes }) => (
                <div
                  key={species}
                  className="px-6 py-4 grid grid-cols-1 md:grid-cols-[220px_1fr] gap-3 md:gap-6"
                >
                  <div className="text-sm font-medium text-slate-700">
                    {getSpeciesDisplayName(species)}
                  </div>
                  <div className="flex flex-wrap gap-2 items-center">
                    {genes.length > 0 ? (
                      genes.map(({ gene, synonyms }) => (
                        <div
                          key={gene}
                          className="flex items-center gap-1 flex-wrap"
                        >
                          <ExternalGeneLink
                            gene={gene}
                            species={species}
                            assemblyInfoUrl={getAssemblyInfoUrl(species)}
                          />
                          {synonyms.length > 0 && (
                            <span className="text-slate-500 text-sm">
                              ({synonyms.join(", ")})
                            </span>
                          )}
                        </div>
                      ))
                    ) : (
                      <span className="text-sm text-slate-400 italic">
                        No genes
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
      <div className="bg-slate-50 px-6 py-3 border border-slate-200 rounded-xl flex items-center justify-between">
        <span className="text-xs text-slate-500">
          Showing {orthologies.length}{" "}
          {orthologies.length === 1 ? "orthogroup" : "orthogroups"} based on
          orthology search.
        </span>
      </div>
    </div>
  );
};

export default SearchResultByOrthology;
