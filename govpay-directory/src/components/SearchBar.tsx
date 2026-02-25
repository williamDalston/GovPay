"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Search, X, User, Building2 } from "lucide-react";
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
  const router = useRouter();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);

  const totalItems =
    (suggestions?.agencies.length ?? 0) + (suggestions?.employees.length ?? 0);

  const fetchSuggestions = useCallback(async (term: string) => {
    if (term.trim().length < 2) {
      setSuggestions(null);
      setShowDropdown(false);
      return;
    }
    try {
      const res = await fetch(
        `/api/search/suggest?q=${encodeURIComponent(term)}`
      );
      const data: Suggestion = await res.json();
      setSuggestions(data);
      setShowDropdown(
        data.employees.length > 0 || data.agencies.length > 0
      );
      setActiveIndex(-1);
    } catch {
      setSuggestions(null);
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
    } else if (e.key === "Enter" && activeIndex >= 0) {
      e.preventDefault();
      const agencyCount = suggestions?.agencies.length ?? 0;
      if (activeIndex < agencyCount) {
        navigateTo(`/agencies/${suggestions!.agencies[activeIndex].slug}`);
      } else {
        const empIdx = activeIndex - agencyCount;
        navigateTo(`/employees/${suggestions!.employees[empIdx].slug}`);
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

  return (
    <div ref={wrapperRef} className={`relative ${className}`}>
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <Search
            size={size === "large" ? 20 : 16}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-navy-500"
          />
          <input
            type="text"
            value={query}
            onChange={(e) => handleChange(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => {
              if (suggestions && totalItems > 0) setShowDropdown(true);
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
            }`}
          />
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setSuggestions(null);
                setShowDropdown(false);
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
      {showDropdown && suggestions && (
        <div
          id="search-suggestions"
          role="listbox"
          className="absolute left-0 right-0 z-50 mt-2 animate-slide-down overflow-hidden rounded-xl border border-navy-700 bg-navy-900 shadow-xl"
        >
          {suggestions.agencies.length > 0 && (
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
          {suggestions.employees.length > 0 && (
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
                    <div className="min-w-0">
                      <span className="truncate">{emp.name}</span>
                      {emp.agency && (
                        <span className="ml-2 text-xs text-navy-500">
                          {emp.agency}
                        </span>
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
