import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupButton,
} from "@/components/ui/input-group";

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
  },
];

export default function HomePage() {
  return (
    <>
      <main className="flex-grow">
        {/* Hero Section */}
        <div className="max-w-4xl mx-auto px-4 pt-20 pb-16 text-center">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-5 font-display">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-blue-400">
              Emerging Model Organism
            </span>
            <br />
            <span className="text-slate-900">Genomic Database</span>
          </h1>
          <p className="max-w-3xl text-slate-500 mx-auto mb-10 leading-relaxed">
            A centralized repository for specific model organism genome
            assemblies. Search by species or accessions, browse chromosomal
            structures, and download high-quality genomic data.
          </p>

          {/* Large Search Bar */}
          <div className="max-w-3xl mx-auto">
            <InputGroup className="h-16 rounded-xl bg-white shadow-md hover:shadow-lg transition-shadow px-3">
              <InputGroupAddon align="inline-start">
                <svg
                  className="h-6 w-6 ml-2 text-slate-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
                  />
                </svg>
              </InputGroupAddon>
              <InputGroupInput
                type="text"
                className="text-lg font-medium pl-2 h-full placeholder:text-slate-500 mx-2"
                placeholder="e.g., GCA_000001405.15, Homo sapiens, BRCA1..."
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
              <svg
                className="w-4 h-4 stroke-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 12h14M12 5l7 7-7 7"
                />
              </svg>
            </a>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {speciesCards.map((card) => (
              <div
                key={card.name}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow group flex flex-col"
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
                  <h3 className="text-xl font-bold text-gray-900 mb-1">
                    {card.name}
                  </h3>
                  <p className="text-slate-500 italic mb-8 font-serif">
                    {card.common}
                  </p>

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
        <p className="text-slate-600 text-sm font-medium">
          &copy; 2026 Universitätsmedizin Göttingen. All rights reserved.
        </p>
      </footer>
    </>
  );
}
