import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import Logo from "@/components/layouts/Logo";
import { Search, CircleHelp } from "lucide-react";

export default function Topbar() {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-end gap-2">
          <Logo className="w-8 h-8 text-blue-500" />
          <span className="font-display font-bold text-xl tracking-tight text-slate-900">
            EMOBase
          </span>
        </div>

        {/* Header Search */}
        <div className="flex-1 max-w-2xl px-8">
          <InputGroup className="h-10 rounded-lg bg-slate-100 border-slate-200 shadow-inner px-2">
            <InputGroupAddon align="inline-start">
              <Search className="h-5 w-5 text-slate-400" />
            </InputGroupAddon>
            <InputGroupInput
              type="text"
              className="text-sm font-medium mx-1"
              placeholder="Search by species name, NCBI accession (GCA_/GCF_), or gene identifier..."
            />
            <InputGroupAddon align="inline-end">
              <CircleHelp className="h-5 w-5 text-slate-400" />
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
