import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupButton,
} from "@/components/ui/input-group";
import { Search, ArrowRight, ExternalLink } from "lucide-react";

import triboliumImage from "@/assets/species/500px-Tribolium_castaneum.jpg?url";
import spiderImage from "@/assets/species/Common_House_Spider.jpg?url";
import lymnaeaImage from "@/assets/species/Lymnaea-stagnalis.jpg?url";

const speciesCards = [
  {
    image: triboliumImage,
    alt: "Beetle",
    tag: "Beetles",
    name: "Tcas",
    common: "Tribolium castaneum",
    genomeSize: "241.8 Mb",
    gcContent: "31.5%",
    assemblyLevel: "Chromosome (92%)",
    siteUrl: "https://ibeetle-base.uni-goettingen.de/",
  },
  {
    image: spiderImage,
    alt: "Spider",
    tag: "Spiders",
    name: "Ptep",
    common: "Parasteatoda tepidariorum",
    genomeSize: "1.1 Gb",
    gcContent: "29.5%",
    assemblyLevel: "Scaffold",
    siteUrl: "https://ptep.emobase.uni-goettingen.de/",
  },
  {
    image: lymnaeaImage,
    alt: "Snail",
    tag: "Snails",
    name: "Lyst",
    common: "Lymnaea stagnalis",
    genomeSize: "943.0 Mb",
    gcContent: "37.55%",
    assemblyLevel: "Scaffold",
    siteUrl: "https://ibb-test.vm19002.virt.gwdg.de/",
  },
];

export default function HomePage() {
  return (
    <>
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
            assemblies. Search by species or accessions, browse chromosomal
            structures, and download high-quality genomic data.
          </p>

          {/* Large Search Bar */}
          <div className="max-w-3xl mx-auto">
            <InputGroup className="h-16 rounded-lg bg-white shadow-md hover:shadow-lg transition-shadow px-3">
              <InputGroupAddon align="inline-start">
                <Search className="h-6 w-6 ml-2 text-slate-500" />
              </InputGroupAddon>
              <InputGroupInput
                type="text"
                className="text-lg font-medium pl-2 h-full placeholder:text-slate-500 mx-2"
                placeholder="e.g., GCA_000003055.4, Tribolium castaneum, Tc-Abda..."
              />
              <InputGroupAddon align="inline-end">
                <InputGroupButton
                  type="submit"
                  variant="default"
                  className="h-12 px-8 font-semibold rounded-lg shadow-sm text-base"
                >
                  Search
                </InputGroupButton>
              </InputGroupAddon>
            </InputGroup>
          </div>
        </div>

        {/* Species Directory Section */}
        <div className="max-w-6xl mx-auto px-4 pb-24">
          <div className="flex items-end justify-between mb-6">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
                Species Directory
              </h2>
              <p className="text-slate-500 mt-1 font-medium">
                Recently updated assemblies
              </p>
            </div>
            <a
              href="#"
              className="text-blue-700 font-bold flex items-center gap-1 hover:text-blue-800 transition-colors mb-1 text-sm"
            >
              View All
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {speciesCards.map((card) => (
              <div
                key={card.name}
                className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow group flex flex-col"
              >
                <div className="relative h-52 overflow-hidden bg-slate-100 border-b border-slate-200">
                  <img
                    src={card.image}
                    alt={card.alt}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 right-3 bg-white px-2.5 py-1 rounded text-xs font-bold text-slate-800 shadow-sm tracking-wide">
                    {card.tag}
                  </div>
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 h-6 bg-gradient-to-t from-black/10 to-transparent" />
                </div>
                <div className="p-6 flex flex-col flex-grow">
                  <a
                    href={card.siteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group/title inline-flex items-center gap-1.5 w-fit hover:text-blue-600 transition-colors"
                  >
                    <h3 className="text-xl font-bold text-gray-900 group-hover/title:text-blue-600 transition-colors">
                      {card.name}
                    </h3>
                    <ExternalLink className="w-4 h-4 opacity-0 group-hover/title:opacity-100 text-blue-600 transition-opacity" />
                  </a>
                  <p className="text-slate-500 italic mb-8">{card.common}</p>

                  <div className="space-y-4 text-sm mt-auto">
                    <div className="flex justify-between border-t border-slate-100 pt-4">
                      <span className="text-slate-500 font-medium">
                        Genome Size:
                      </span>
                      <span className="font-bold text-gray-900">
                        {card.genomeSize}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-medium">
                        GC Content:
                      </span>
                      <span className="font-bold text-gray-900">
                        {card.gcContent}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-medium">
                        Assembly Level:
                      </span>
                      <span className="font-bold text-gray-900">
                        {card.assemblyLevel}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-slate-200 py-10 text-center mt-auto">
        <p className="text-slate-600 text-sm">
          &copy; 2026 Universitätsmedizin Göttingen. All rights reserved.
        </p>
      </footer>
    </>
  );
}
