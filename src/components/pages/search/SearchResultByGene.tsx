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
  const getAssemblyForGene = (gene: string) => {
    if (gene.startsWith("TC") || gene.toLowerCase().includes("tcas")) {
      return (
        assemblies.find((a) =>
          (a.speciesCode || a.speciesName)?.toLowerCase().includes("tribolium"),
        ) || assemblies[0]
      );
    }
    if (
      gene.startsWith("Ptep") ||
      gene.toLowerCase().includes("parasteatoda")
    ) {
      return (
        assemblies.find((a) =>
          (a.speciesCode || a.speciesName)?.toLowerCase().includes("parasteatoda"),
        ) || assemblies.find((a) => a.name?.includes("Ptep"))
      );
    }
    if (gene.startsWith("Lyst") || gene.toLowerCase().includes("lymnaea")) {
      return (
        assemblies.find((a) => (a.speciesCode || a.speciesName)?.toLowerCase().includes("lymnaea")) ||
        assemblies.find((a) => a.name?.includes("Lyst"))
      );
    }
    if (gene.startsWith("FBgn") || gene.toLowerCase().includes("dmel")) {
      return (
        assemblies.find((a) =>
          (a.speciesCode || a.speciesName)?.toLowerCase().includes("drosophila"),
        ) || assemblies.find((a) => a.name?.includes("Dmel"))
      );
    }
    return assemblies[0];
  };

  if (genes.length === 0) {
    return (
      <div className="w-full bg-white rounded-xl border border-slate-200 shadow-sm min-h-[400px] flex items-center justify-center">
        <p className="text-slate-400 font-medium">No genes found</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-slate-200">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50/50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Gene
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Species
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Assembly
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-100">
            {genes.map((gene) => {
              const assembly = getAssemblyForGene(gene);
              const infoUrl = assembly?.infoUrl || undefined;
              return (
                <tr
                  key={gene}
                  className="hover:bg-slate-50/50 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <ExternalGeneLink gene={gene} assemblyInfoUrl={infoUrl} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                    {(assembly?.speciesCode || assembly?.speciesName) || "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                    {assembly?.name || "-"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex items-center justify-between">
        <span className="text-xs text-slate-500">
          Showing {genes.length} gene{genes.length !== 1 ? "s" : ""} based on
          gene search.
        </span>
      </div>
    </div>
  );
};

export default SearchResultByGene;
