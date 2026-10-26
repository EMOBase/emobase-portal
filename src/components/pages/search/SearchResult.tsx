import React from "react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { type GeneSearchResult } from "@/utils/services/genomics";
import type { AssemblyVersionDetail } from "@/utils/services/genomics";

import NothingFound from "./NothingFound";
import SearchResultByOrthology from "./SearchResultByOrthology";
import SearchResultByGene from "./SearchResultByGene";

import ExternalGeneLink from "@/components/common/ExternalGeneLink";
const EmptyContent = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="w-full bg-white rounded-xl border border-slate-200 shadow-sm min-h-[400px] flex items-center justify-center">
      <p className="text-slate-400 font-medium">{children}</p>
    </div>
  );
};

type SearchResultProps = {
  term: string;
  searchData: GeneSearchResult;
  assemblies?: AssemblyVersionDetail[];
};

const SearchResult: React.FC<SearchResultProps> = ({
  term,
  searchData,
  assemblies = [],
}) => {
  const orthologies = searchData.orthologies;
  const otherGenes = searchData.otherGenes;
  const genes = searchData.genes;

  const orthologyBadge = (orthologies?.length || 0) + (otherGenes?.length || 0);
  const geneBadge = genes?.length || 0;

  if (geneBadge === 0 && orthologyBadge === 0) {
    return <NothingFound term={term} />;
  }

  // Default to gene tab if genes found, else orthology
  const defaultTab = geneBadge > 0 ? "gene" : "orthology";

  return (
    <Tabs defaultValue={defaultTab}>
      <TabsList>
        <TabsTrigger value="gene" badge={geneBadge || undefined}>
          Search by Gene
        </TabsTrigger>
        <TabsTrigger value="orthology" badge={orthologyBadge || undefined}>
          Search by Orthology
        </TabsTrigger>
      </TabsList>

      <TabsContent value="gene">
        {genes && genes.length > 0 ? (
          <SearchResultByGene genes={genes} assemblies={assemblies} />
        ) : (
          <EmptyContent>No results found searching by gene</EmptyContent>
        )}
      </TabsContent>
      <TabsContent value="orthology">
        {orthologies && orthologies.length ? (
          <SearchResultByOrthology
            orthologies={orthologies}
            assemblies={assemblies}
          />
        ) : otherGenes && otherGenes.length ? (
          <div className="flex flex-col gap-3 text-slate-700 bg-white rounded-xl p-6 border border-slate-200">
            <p>Found genes:</p>
            <div className="flex flex-wrap items-center gap-3">
              {otherGenes.map(({ gene, species }) => {
                const assembly = assemblies.find(
                  (a) =>
                    (a.speciesCode || a.speciesName) === species ||
                    a.name === species,
                );
                return (
                  <ExternalGeneLink
                    key={`${species}:${gene}`}
                    gene={gene}
                    species={species}
                    assemblyInfoUrl={assembly?.infoUrl || undefined}
                  />
                );
              })}
            </div>
            <p>which may have orthologous relationships.</p>
          </div>
        ) : (
          <EmptyContent>No results found searching by orthology</EmptyContent>
        )}
      </TabsContent>
    </Tabs>
  );
};

export default SearchResult;
