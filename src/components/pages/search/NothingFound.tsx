import { SearchX } from "lucide-react";

const NothingFound = ({ term }: { term: string }) => {
  return (
    <div className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border-2 border-slate-100 border-dashed gap-8 animate-in zoom-in-95 duration-700">
      <div className="size-24 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 shadow-inner">
        <SearchX className="size-12" />
      </div>

      <div className="text-center max-w-lg px-6">
        <h2 className="text-2xl font-bold text-slate-900 mb-3 tracking-tight">
          No matches found for "{term}"
        </h2>
        <p className="text-slate-500 text-base leading-relaxed mb-8">
          We couldn't find any genes or orthology groups matching your query.
        </p>

        <div className="flex flex-col gap-4 text-left bg-slate-50/80 backdrop-blur-sm p-6 rounded-2xl border border-slate-100 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mb-1">
            Suggestions:
          </p>
          <ul className="space-y-3">
            <li className="flex items-start gap-3 text-sm text-slate-600">
              <span className="size-5 rounded-full bg-white border border-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-400 flex-shrink-0">
                1
              </span>
              <span>Check for typos in the Gene ID or name.</span>
            </li>
            <li className="flex items-start gap-3 text-sm text-slate-600">
              <span className="size-5 rounded-full bg-white border border-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-400 flex-shrink-0">
                2
              </span>
              <span>Try a different search term.</span>
            </li>
          </ul>
        </div>

        <div className="mt-10">
          <a
            href="/"
            className="text-blue-700 text-sm font-bold hover:text-blue-800 transition-all flex items-center justify-center gap-2 group"
          >
            Return to Dashboard
          </a>
        </div>
      </div>
    </div>
  );
};

export default NothingFound;
