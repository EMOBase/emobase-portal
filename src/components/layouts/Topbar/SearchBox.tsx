import { useState, type FormEvent } from "react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Search, CircleHelp } from "lucide-react";

export default function SearchBox() {
  const [query, setQuery] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      window.location.href = `/search/${encodeURIComponent(query.trim())}`;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex-1 max-w-2xl px-8">
      <InputGroup className="h-10 rounded-md bg-slate-100 border-slate-200 shadow-inner px-2">
        <InputGroupAddon align="inline-start">
          <Search className="h-5 w-5 text-slate-400" />
        </InputGroupAddon>
        <InputGroupInput
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="text-sm font-medium mx-1"
          placeholder="Search by species name, NCBI accession (GCA_/GCF_), or gene identifier..."
        />
        <InputGroupAddon align="inline-end">
          <CircleHelp className="h-5 w-5 text-slate-400" />
        </InputGroupAddon>
      </InputGroup>
    </form>
  );
}
