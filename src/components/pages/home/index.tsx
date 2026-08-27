import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupButton,
} from "@/components/ui/input-group";

const speciesCards = [
  {
    image: "https://picsum.photos/seed/beetle123/600/400",
    alt: "Beetle",
    tag: "Insecta",
    name: "Coleoptera",
    common: "Beetles",
    assemblyClass: "bg-blue-50 text-blue-700",
    assemblyDot: "bg-blue-700",
    assembly: "Assmbly: Chromosome",
    genomeSize: "152 Mb - 1.2 Gb",
    gcContent: "32.4%",
  },
  {
    image: "https://picsum.photos/seed/spider456/600/400",
    alt: "Spider",
    tag: "Arachnida",
    name: "Araneae",
    common: "Spiders",
    assemblyClass: "bg-slate-100 text-slate-600",
    assemblyDot: "bg-slate-400",
    assembly: "Assmbly: Scaffold",
    genomeSize: "800 Mb - 3.2 Gb",
    gcContent: "28.1%",
  },
  {
    image: "https://picsum.photos/seed/snail789/600/400",
    alt: "Snail",
    tag: "Mollusca",
    name: "Gastropoda",
    common: "Snails & Slugs",
    assemblyClass: "bg-blue-50 text-blue-700",
    assemblyDot: "bg-blue-700",
    assembly: "Assmbly: Chromosome",
    genomeSize: "450 Mb - 1.8 Gb",
    gcContent: "35.6%",
  },
];

export default function HomePage() {
  return (
    <>
      <main className="flex-grow">
        {/* Hero Section */}
        <div className="max-w-4xl mx-auto px-4 pt-20 pb-16 text-center">
          <h1 className="text-4xl font-bold text-gray-900 tracking-tight mb-5">
            Discover the Blueprint of Life
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed font-medium">
            Access our comprehensive global genomic database. Search across
            verified taxonomies, analyze gene sequences, and visualize complex
            variant maps.
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
                className="text-lg font-medium pl-2 h-full placeholder:text-slate-500"
                placeholder="e.g., GCA_000001405.15, Homo sapiens, BRCA1..."
              />
              <InputGroupAddon align="inline-end">
                <InputGroupButton
                  type="submit"
                  variant="default"
                  className="h-12 px-8 font-semibold rounded-lg shadow-sm text-base"
                >
                  Search Database
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
                <div className="relative h-52 overflow-hidden bg-slate-100 p-3">
                  <img
                    src={card.image}
                    alt={card.alt}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 right-3 bg-white px-2.5 py-1 rounded text-xs font-bold text-slate-800 shadow-sm tracking-wide">
                    {card.tag}
                  </div>
                </div>
                <div className="p-6 flex flex-col flex-grow">
                  <div className="flex justify-between items-center mb-1">
                    <h3 className="text-xl font-bold text-gray-900">
                      {card.name}
                    </h3>
                    <div
                      className={`${card.assemblyClass} px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 whitespace-nowrap`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${card.assemblyDot}`}
                      ></span>
                      {card.assembly}
                    </div>
                  </div>
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
