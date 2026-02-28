"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Search, X, User, Building2, AlertCircle, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface Suggestion {
  employees: { name: string; slug: string; agency: string }[];
  agencies: { name: string; slug: string }[];
}

interface SearchBarProps {
  size?: "default" | "large";
  placeholder?: string;
  className?: string;
}

export function SearchBar({
  size = "default",
  placeholder = "Search employees, agencies, or job titles...",
  className = "",
}: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [fetchError, setFetchError] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [hasGlowed, setHasGlowed] = useState(false);
  const router = useRouter();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);

  const totalItems =
    (suggestions?.agencies.length ?? 0) + (suggestions?.employees.length ?? 0);

  const fetchSuggestions = useCallback(async (term: string) => {
    if (term.trim().length < 2) {
      setSuggestions(null);
      setShowDropdown(false);
      setFetchError(false);
      return;
    }
    try {
      setFetchError(false);
      const res = await fetch(
        `/api/search/suggest?q=${encodeURIComponent(term)}`
      );
      if (!res.ok) throw new Error("Search failed");
      const data: Suggestion = await res.json();
      setSuggestions(data);
      setShowDropdown(true);
      setActiveIndex(-1);
    } catch {
      setSuggestions(null);
      setFetchError(true);
      setShowDropdown(true);
    }
  }, []);

  const handleChange = (value: string) => {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSuggestions(value), 200);
  };

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (query.trim()) {
      setShowDropdown(false);
      setIsSearching(true);
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  const navigateTo = (href: string) => {
    setShowDropdown(false);
    setQuery("");
    router.push(href);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showDropdown || totalItems === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) => (prev < totalItems - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) => (prev > 0 ? prev - 1 : totalItems - 1));
    } else if (e.key === "Enter" && activeIndex >= 0 && suggestions) {
      e.preventDefault();
      const agencyCount = suggestions.agencies.length;
      if (activeIndex < agencyCount) {
        navigateTo(`/agencies/${suggestions.agencies[activeIndex].slug}`);
      } else {
        const empIdx = activeIndex - agencyCount;
        navigateTo(`/employees/${suggestions.employees[empIdx].slug}`);
      }
    } else if (e.key === "Escape") {
      setShowDropdown(false);
    }
  };

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Reset searching spinner once the component mounts/re-mounts after navigation
  useEffect(() => {
    setIsSearching(false);
  }, []);

  return (
    <div ref={wrapperRef} className={`relative ${className}`}>
      <form onSubmit={handleSubmit}>
        <div className="relative">
          {isSearching ? (
            <Loader2
              size={size === "large" ? 20 : 16}
              className="absolute left-4 top-1/2 -translate-y-1/2 animate-spin text-accent-blue"
            />
          ) : (
            <Search
              size={size === "large" ? 20 : 16}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-navy-500"
            />
          )}
          <input
            type="text"
            value={query}
            onChange={(e) => handleChange(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => {
              if (!hasGlowed) setHasGlowed(true);
              if (
                query.trim().length >= 2 &&
                (totalItems > 0 || fetchError)
              )
                setShowDropdown(true);
            }}
            placeholder={placeholder}
            aria-label="Search employees, agencies, or job titles"
            role="combobox"
            aria-expanded={showDropdown}
            aria-autocomplete="list"
            aria-controls="search-suggestions"
            aria-activedescendant={
              activeIndex >= 0 ? `suggestion-${activeIndex}` : undefined
            }
            className={`w-full rounded-xl border border-navy-700 bg-navy-900 text-navy-100 placeholder-navy-500 transition-all focus:border-accent-blue focus:outline-none focus:ring-1 focus:ring-accent-blue ${
              size === "large"
                ? "py-4 pl-12 pr-12 text-lg"
                : "py-2.5 pl-10 pr-10 text-sm"
            } ${hasGlowed && size === "large" ? "animate-focus-glow" : ""}`}
          />
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setSuggestions(null);
                setShowDropdown(false);
                setFetchError(false);
              }}
              aria-label="Clear search"
              className="absolute right-4 top-1/2 -translate-y-1/2 text-navy-500 hover:text-navy-300"
            >
              <X size={size === "large" ? 20 : 16} />
            </button>
          )}
        </div>
      </form>

      {/* Autocomplete dropdown */}
      {showDropdown && (
        <div
          id="search-suggestions"
          role="listbox"
          className="absolute left-0 right-0 z-50 mt-2 animate-slide-down overflow-hidden rounded-xl border border-navy-700 bg-navy-900 shadow-xl"
        >
          {/* Error state */}
          {fetchError && (
            <div className="flex items-center gap-2 px-4 py-3 text-sm text-navy-400">
              <AlertCircle size={14} className="shrink-0 text-accent-red" />
              Search unavailable. Press Enter to search.
            </div>
          )}

          {/* No results state */}
          {!fetchError && suggestions && totalItems === 0 && (
            <div className="px-4 py-3 text-sm text-navy-400">
              No results found for &ldquo;{query}&rdquo;
            </div>
          )}

          {/* Results */}
          {!fetchError && suggestions && suggestions.agencies.length > 0 && (
            <div>
              <p className="px-4 py-2 text-xs font-medium text-navy-500">
                Agencies
              </p>
              {suggestions.agencies.map((agency, i) => (
                <button
                  key={agency.slug}
                  id={`suggestion-${i}`}
                  role="option"
                  aria-selected={activeIndex === i}
                  onClick={() => navigateTo(`/agencies/${agency.slug}`)}
                  className={`flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors ${
                    activeIndex === i
                      ? "bg-navy-800 text-accent-blue"
                      : "text-navy-200 hover:bg-navy-800"
                  }`}
                >
                  <Building2 size={14} className="shrink-0 text-accent-blue" />
                  <span className="truncate">{agency.name}</span>
                </button>
              ))}
            </div>
          )}
          {!fetchError && suggestions && suggestions.employees.length > 0 && (
            <div>
              <p className="px-4 py-2 text-xs font-medium text-navy-500">
                Employees
              </p>
              {suggestions.employees.map((emp, i) => {
                const idx = i + (suggestions.agencies?.length ?? 0);
                return (
                  <button
                    key={emp.slug}
                    id={`suggestion-${idx}`}
                    role="option"
                    aria-selected={activeIndex === idx}
                    onClick={() => navigateTo(`/employees/${emp.slug}`)}
                    className={`flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors ${
                      activeIndex === idx
                        ? "bg-navy-800 text-accent-blue"
                        : "text-navy-200 hover:bg-navy-800"
                    }`}
                  >
                    <User size={14} className="shrink-0 text-accent-green" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate">{emp.name}</p>
                      {emp.agency && (
                        <p className="truncate text-xs text-navy-500">
                          {emp.agency}
                        </p>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
          <button
            onClick={() => handleSubmit()}
            className="flex w-full items-center gap-2 border-t border-navy-700 px-4 py-2.5 text-left text-xs text-navy-400 transition-colors hover:bg-navy-800 hover:text-accent-blue"
          >
            <Search size={12} />
            Search for &ldquo;{query}&rdquo;
          </button>
        </div>
      )}
    </div>
  );
}
