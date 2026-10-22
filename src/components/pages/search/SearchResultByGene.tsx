import type { GeneSearchResult } from "@/utils/services/genomics";
import type { AssemblyVersionDetail } from "@/utils/services/genomics";
import ExternalGeneLink from "@/components/common/ExternalGeneLink";

type SearchResultByGeneProps = {
  genes: string[];
  assemblies?: AssemblyVersionDetail[];
};

const SearchResultByGene: React.FC<SearchResultByGeneProps> = ({
  genes,
  assemblies = [],
}) => {
  // For genes found in main/primary species, link to their respective species sites
  // Use the first assembly with infoUrl or all assemblies
  const getAssemblyInfoUrl = () => {
    // Prefer assemblies that have infoUrl
    const assemblyWithUrl = assemblies.find((a) => a.infoUrl);
    return assemblyWithUrl?.infoUrl || assemblies[0]?.infoUrl || undefined;
  };

  const infoUrl = getAssemblyInfoUrl();

  if (genes.length === 0) {
    return (
      <div className="w-full bg-white rounded-xl border border-slate-200 shadow-sm min-h-[400px] flex items-center justify-center">
        <p className="text-slate-400 font-medium">No genes found</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-slate-200">
      <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/50">
        <p className="text-sm font-medium text-slate-700">
          Found {genes.length} gene{genes.length !== 1 ? "s" : ""}
        </p>
      </div>
      <div className="divide-y divide-slate-100">
        {genes.map((gene) => (
          <div
            key={gene}
            className="px-6 py-4 hover:bg-slate-50/50 transition-colors flex items-center justify-between"
          >
            <ExternalGeneLink gene={gene} assemblyInfoUrl={infoUrl} />
            {infoUrl && (
              <span className="text-xs text-slate-400">
                Links to species site
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SearchResultByGene;
