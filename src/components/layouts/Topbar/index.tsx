import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Search, CircleHelp } from "lucide-react";

import type { SessionUser } from "@/auth/session";
import AvatarMenu from "@/components/layouts/Topbar/AvatarMenu";

export default function Topbar({ user }: { user: SessionUser | null }) {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <a
          href="/"
          className="font-display font-bold text-xl tracking-tight text-slate-700"
        >
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-blue-500/80">
            EMO
          </span>
          Base
        </a>

        {/* Header Search */}
        <div className="flex-1 max-w-2xl px-8">
          <InputGroup className="h-10 rounded-md bg-slate-100 border-slate-200 shadow-inner px-2">
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

        {user ? <AvatarMenu email={user.email} name={user.name} /> : null}
      </div>
    </header>
  );
}
