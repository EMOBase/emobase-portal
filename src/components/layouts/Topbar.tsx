import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";

export default function Topbar() {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="flex flex-col relative w-8 h-8 items-center justify-center">
            <svg
              className="w-8 h-8 text-blue-500"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M7 4v16M17 4v16M3 8h18M3 16h18" />
              <path
                d="M7 4l10 16M17 4L7 20"
                className="text-blue-300"
                strokeWidth="1.5"
              />
            </svg>
          </div>
          <span className="font-extrabold text-xl tracking-tight text-slate-900">
            EMOBase
          </span>
        </div>

        {/* Header Search */}
        <div className="flex-1 max-w-2xl px-8">
          <InputGroup className="h-10 rounded-lg bg-slate-100 border-slate-200 shadow-inner px-2">
            <InputGroupAddon align="inline-start">
              <svg className="h-5 w-5 text-slate-400" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z"
                  clipRule="evenodd"
                />
              </svg>
            </InputGroupAddon>
            <InputGroupInput
              type="text"
              className="text-sm font-medium"
              placeholder="Search genomic sequences, species, or accession numbers..."
            />
            <InputGroupAddon align="inline-end">
              <svg
                className="h-5 w-5 text-slate-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <circle cx="12" cy="12" r="10" strokeWidth="2" />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 16v-4m0-4h.01"
                />
              </svg>
            </InputGroupAddon>
          </InputGroup>
        </div>

        {/* Avatar */}
        <div className="flex items-center">
          <img
            className="h-9 w-9 rounded-full object-cover border border-slate-200 shadow-sm"
            src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
            alt="User avatar"
          />
        </div>
      </div>
    </header>
  );
}
