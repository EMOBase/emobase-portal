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
  // Get all unique species from orthologs
  const allSpecies = Array.from(
    new Set(orthologies.flatMap((o) => o.orthologs.map((og) => og.species))),
  ).sort();

  const getAssemblyInfoUrl = (species: string) => {
    const assembly = assemblies.find(
      (a) => a.species === species || a.name === species,
    );
    return assembly?.infoUrl || undefined;
  };

  const getSpeciesDisplayName = (species: string) => {
    const assembly = assemblies.find(
      (a) => a.species === species || a.name === species,
    );
    if (assembly?.species) return assembly.species;
    return species;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-slate-200">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50/50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Algorithm
              </th>
              {allSpecies.map((s) => (
                <th
                  key={s}
                  className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider"
                >
                  {getSpeciesDisplayName(s)} homologs
                </th>
              ))}
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Link to tree
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-100">
            {orthologies.map(({ group, source, orthologs }, index) => (
              <tr
                key={index}
                className="hover:bg-slate-50/50 transition-colors group [&>td]:align-top"
              >
                <td className="px-6 py-5 whitespace-nowrap text-sm font-medium text-slate-900">
                  {source}
                </td>
                {allSpecies.map((species) => {
                  const ortholog = orthologs.find((o) => o.species === species);
                  const genes = ortholog?.genes || [];
                  const infoUrl = getAssemblyInfoUrl(species);

                  return (
                    <td key={species} className="px-6 py-5 text-sm">
                      <div className="flex flex-col gap-2">
                        {genes.map(({ gene, synonyms }) => (
                          <div
                            key={gene}
                            className="flex items-center gap-1 flex-wrap"
                          >
                            <ExternalGeneLink
                              gene={gene}
                              species={species}
                              assemblyInfoUrl={infoUrl}
                            />
                            {synonyms.length > 0 && (
                              <span className="text-slate-500">
                                ({synonyms.join(", ")})
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </td>
                  );
                })}
                <td className="px-6 py-5 whitespace-nowrap text-sm text-slate-500">
                  {source.toLowerCase() === "eggnog6" ? (
                    <div className="flex items-center gap-1">
                      <a
                        href={`http://eggnog6.embl.de/search/ogs/${group}/`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-slate-700 hover:text-slate-900 transition-colors flex items-center gap-1 font-mono text-xs bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded cursor-pointer"
                      >
                        {group}
                        <ExternalLink className="size-3.5" />
                      </a>
                    </div>
                  ) : (
                    <span className="text-slate-300 italic">
                      No tree available
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex items-center justify-between">
        <span className="text-xs text-slate-500">
          Showing {orthologies.length} results based on orthology search.
        </span>
      </div>
    </div>
  );
};

export default SearchResultByOrthology;
