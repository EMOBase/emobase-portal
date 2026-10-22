import { useState, type FormEvent } from "react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupButton,
} from "@/components/ui/input-group";
import { Search } from "lucide-react";

export default function SearchBar() {
  const [query, setQuery] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      window.location.href = `/search/${encodeURIComponent(query.trim())}`;
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <form onSubmit={handleSubmit}>
        <InputGroup className="h-16 rounded-lg bg-white shadow-md hover:shadow-lg transition-shadow px-3">
          <InputGroupAddon align="inline-start">
            <Search className="h-6 w-6 ml-2 text-slate-500" />
          </InputGroupAddon>
          <InputGroupInput
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="text-lg font-medium pl-2 h-full placeholder:text-slate-500 mx-2"
            placeholder="e.g., GCA_000003055.4, Tribolium castaneum, gene identifier..."
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
      </form>
    </div>
  );
}
