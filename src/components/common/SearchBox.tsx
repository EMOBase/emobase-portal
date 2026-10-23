import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type SyntheticEvent,
} from "react";
import { ArrowRight, LoaderCircle, Search } from "lucide-react";

import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { cn } from "@/utils/classname";
import { searchNavigation } from "@/utils/searchNavigation";
import genomicsService from "@/utils/services/genomics";

type SearchBoxProps = {
  variant?: "hero" | "topbar";
  className?: string;
  inputClassName?: string;
  placeholder?: string;
};

const SUGGEST_DEBOUNCE_MS = 250;
const DEFAULT_PLACEHOLDER = "Search by gene ID (e.g. TC006123)";

export default function SearchBox({
  variant = "hero",
  className,
  inputClassName,
  placeholder,
}: SearchBoxProps) {
  const isTopbar = variant === "topbar";
  const listId = useId();

  const service = useMemo(() => genomicsService(), []);
  const { suggest } = service;

  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(-1);
  const [loading, setLoading] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const requestIdRef = useRef(0);

  useEffect(() => {
    const trimmed = query.trim();

    if (!trimmed) {
      requestIdRef.current += 1;
      setSuggestions([]);
      setOpen(false);
      setHighlighted(-1);
      setLoading(false);
      return;
    }

    const requestId = ++requestIdRef.current;
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setLoading(true);
      try {
        const data = await suggest(trimmed, controller.signal);
        if (requestId !== requestIdRef.current) return;
        const nextSuggestions = Array.isArray(data) ? data : [];
        setSuggestions(nextSuggestions);
        setOpen(nextSuggestions.length > 0);
        setHighlighted(-1);
      } catch {
        if (requestId !== requestIdRef.current) return;
        setSuggestions([]);
        setOpen(false);
      } finally {
        if (requestId === requestIdRef.current) setLoading(false);
      }
    }, SUGGEST_DEBOUNCE_MS);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [query, suggest]);

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
        setHighlighted(-1);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, []);

  const goToSearch = (term: string) => searchNavigation.goToSearch(term);

  const selectSuggestion = (suggestion: string) => {
    setQuery(suggestion);
    setOpen(false);
    setHighlighted(-1);
    goToSearch(suggestion);
  };

  const handleSubmit = (event: SyntheticEvent) => {
    event.preventDefault();
    const term = highlighted >= 0 ? suggestions[highlighted] : query;
    goToSearch(term);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      if (!suggestions.length) return;
      setOpen(true);
      setHighlighted((current) =>
        Math.min(current + 1, suggestions.length - 1),
      );
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      if (!suggestions.length) return;
      setOpen(true);
      setHighlighted((current) => Math.max(current - 1, 0));
      return;
    }

    if (event.key === "Escape") {
      setOpen(false);
      setHighlighted(-1);
    }
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative",
        isTopbar ? "flex-1 max-w-2xl px-8" : "max-w-3xl mx-auto",
        className,
      )}
    >
      <form onSubmit={handleSubmit}>
        <InputGroup
          className={cn(
            isTopbar
              ? "h-10 rounded-md bg-slate-100 border-slate-200 shadow-inner px-2"
              : "h-16 rounded-lg bg-white shadow-md hover:shadow-lg transition-shadow px-3",
          )}
        >
          <InputGroupAddon align="inline-start">
            <Search
              className={cn(
                isTopbar
                  ? "h-5 w-5 text-slate-400"
                  : "h-6 w-6 ml-2 text-slate-500",
              )}
            />
          </InputGroupAddon>
          <InputGroupInput
            type="text"
            value={query}
            autoComplete="off"
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={handleKeyDown}
            role="combobox"
            aria-autocomplete="list"
            aria-expanded={open}
            aria-controls={listId}
            aria-activedescendant={
              open && highlighted >= 0
                ? `${listId}-option-${highlighted}`
                : undefined
            }
            className={cn(
              isTopbar
                ? "text-sm font-medium mx-1"
                : "text-lg font-medium pl-2 h-full placeholder:text-slate-500 mx-2",
              inputClassName,
            )}
            placeholder={placeholder ?? DEFAULT_PLACEHOLDER}
          />
          {!isTopbar && (
            <InputGroupAddon align="inline-end">
              <InputGroupButton
                type="submit"
                variant="default"
                className="h-12 px-8 font-semibold rounded-lg shadow-sm text-base"
              >
                Search
              </InputGroupButton>
            </InputGroupAddon>
          )}
          {isTopbar && (
            <InputGroupAddon
              align="inline-end"
              className="w-7 shrink-0 justify-center"
            >
              {loading && (
                <LoaderCircle
                  aria-hidden="true"
                  className="h-5 w-5 animate-spin text-slate-400"
                />
              )}
            </InputGroupAddon>
          )}
          {loading && !isTopbar && (
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 bottom-0 h-0.5 overflow-hidden rounded-b-(--radius-control)"
            >
              <span className="block h-full w-2/5 animate-[search-loading-line_1.1s_ease-in-out_infinite] rounded-full bg-blue-700" />
            </span>
          )}
        </InputGroup>
      </form>

      {open && suggestions.length > 0 && (
        <div
          id={listId}
          role="listbox"
          className={cn(
            "absolute top-full z-50 mt-2 max-h-80 overflow-y-auto rounded-lg border border-slate-200 bg-white py-1 text-left shadow-lg",
            isTopbar ? "left-8 right-8" : "left-0 right-0",
          )}
        >
          {suggestions.map((suggestion, index) => (
            <button
              key={`${suggestion}-${index}`}
              id={`${listId}-option-${index}`}
              type="button"
              role="option"
              aria-selected={index === highlighted}
              onMouseEnter={() => setHighlighted(index)}
              onClick={() => selectSuggestion(suggestion)}
              className={cn(
                "flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-slate-700 transition-colors",
                index === highlighted && "bg-blue-50 text-blue-700",
              )}
            >
              <ArrowRight
                aria-hidden="true"
                className={cn(
                  "h-4 w-4 shrink-0 text-slate-400 transition-transform",
                  index === highlighted && "translate-x-0.5 text-blue-600",
                )}
              />
              <span className="truncate">{suggestion}</span>
            </button>
          ))}
        </div>
      )}

      {loading && !open && (
        <span className="sr-only" role="status">
          Loading suggestions
        </span>
      )}
    </div>
  );
}
