import SearchBox from "@/components/common/SearchBox";
import { ExternalLink } from "lucide-react";
import type { AssemblyVersionDetail } from "@/utils/services/genomics";
import placeholderImage from "@/assets/placeholder.svg?url";

type AssemblyCardData = {
  image?: string | null;
  alt: string;
  name: string;
  common: string;
  siteUrl?: string | null;
};

type HomePageProps = {
  assemblies?: AssemblyVersionDetail[];
};

export default function HomePage({ assemblies = [] }: HomePageProps) {
  const assemblyCards: AssemblyCardData[] = assemblies.map((assembly) => ({
    image: assembly.imagePath,
    alt: assembly.speciesName || assembly.speciesCode || assembly.name,
    name: assembly.name,
    common: assembly.speciesName || assembly.speciesCode || "",
    siteUrl: assembly.infoUrl,
  }));
  return (
    <main className="flex-grow">
      {/* Hero Section */}
      <div className="max-w-4xl mx-auto px-4 pt-20 pb-16 text-center">
        <h1 className="text-4xl md:text-5xl font-display font-bold tracking-tight mb-5">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-blue-500/80">
            Emerging Model Organism
          </span>
          <br />
          <span className="text-slate-700">Genomic Database</span>
        </h1>
        <p className="max-w-2xl text-slate-500 mx-auto mb-10 leading-relaxed">
          A centralized repository for specific model organism genome
          assemblies. Search for genes and their orthologs across species, and
          download high-quality genomic data.
        </p>

        {/* Large Search Bar */}
        <SearchBox />
      </div>

      <div className="max-w-6xl mx-auto px-4 pb-24">
        <div className="flex items-end justify-between mb-6">
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
            Assemblies
          </h2>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {assemblyCards.map((card) => (
            <div
              key={card.name}
              className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow group flex flex-col"
            >
              <div className="relative h-52 overflow-hidden bg-slate-100 border-b border-slate-200">
                <img
                  src={card.image ?? placeholderImage}
                  alt={card.alt}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="flex flex-grow flex-col">
                <div className="flex-grow p-6">
                  <h3 className="text-xl font-bold text-gray-900">
                    {card.name}
                  </h3>
                  <p className="text-slate-500 italic">{card.common}</p>
                </div>
                <a
                  href={card.siteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group/link relative flex items-center justify-between gap-2 px-6 pt-4 pb-6 text-sm font-medium text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800"
                >
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-x-6 top-0 h-px bg-slate-200 transition-all duration-200 group-hover/link:inset-x-0"
                  />
                  Visit site
                  <ExternalLink className="size-4" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
