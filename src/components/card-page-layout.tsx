"use client";

import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { CardDisplay } from "@/components/card-display";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { AdvancedPagination } from "@/components/advanced-pagination";
import { CardSummary, SetSummary } from "@/lib/pokemon-api";
import { useDebounce } from "@/hooks/use-debounce";

interface CardPageLayoutProps {
  title: string;
  cards: CardSummary[];
  isLoading: boolean;
  error?: string | null;
  totalCount: number;
  currentPage: number;
  pageSize: number;
  onPageChange: (newPage: number) => void;

  // Filters, Search, Sort State & Handlers
  searchValue: string; // Controlled search value from parent
  onSearchChange: (value: string) => void; // Callback for raw input change
  onDebouncedSearchChange: (value: string) => void; // Callback after debounce
  selectedSet: string; // Controlled set value from parent ('all' or set ID)
  onSetChange: (value: string) => void;
  selectedSort: string; // Controlled sort value from parent
  onSortChange: (value: string) => void;
  availableSets: SetSummary[];
  isLoadingSets: boolean;
  setFetchError?: string | null;
  sortOptions: { value: string; label: string }[];
  isPending?: boolean; // For transition state indication
}

export function CardPageLayout({
  title,
  cards,
  isLoading,
  error,
  totalCount,
  currentPage,
  pageSize,
  onPageChange,
  searchValue,
  onSearchChange,
  onDebouncedSearchChange,
  selectedSet,
  onSetChange,
  selectedSort,
  onSortChange,
  availableSets,
  isLoadingSets,
  setFetchError,
  sortOptions,
  isPending = false,
}: CardPageLayoutProps) {
  // Internal state for the search input to allow typing before debounce
  const [searchInput, setSearchInput] = useState<string>(searchValue);
  const debouncedSearchTerm = useDebounce(searchInput, 500);

  // Effect to sync internal input state when the controlled searchValue prop changes
  // (e.g., on initial load from URL or parent state reset)
  useEffect(() => {
    if (searchInput !== searchValue) {
      setSearchInput(searchValue);
    }
    // Intentionally only reacting to external searchValue changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchValue]);

  // Effect to call the debounced change handler when the debounced term changes
  useEffect(() => {
    // Prevent calling on initial mount if debounced term matches initial searchValue
    if (debouncedSearchTerm !== searchValue) {
      onDebouncedSearchChange(debouncedSearchTerm);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearchTerm]);

  // Handler for the actual input element change
  const handleLocalSearchInputChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const newValue = event.target.value;
    setSearchInput(newValue); // Update local state immediately for responsiveness
    onSearchChange(newValue); // Inform parent about the raw change immediately if needed
  };

  // Skeleton Rendering
  const renderSkeletons = (count: number) => {
    return Array.from({ length: count }).map((_, index) => (
      <div
        key={`skeleton-${index}-${title}`}
        className="flex flex-col space-y-2"
      >
        <Skeleton className="aspect-[2.5/3.5] w-full max-w-48 mx-auto" />
      </div>
    ));
  };

  const showInitialLoading = isLoading && cards.length === 0 && !error;
  const showLoadingOverlay = (isLoading || isPending) && cards.length > 0;

  return (
    <div className="flex flex-1 flex-col h-full">
      {/* Shared Header */}
      <div className="flex flex-col md:flex-row h-auto md:h-16 shrink-0 items-center justify-between gap-3 border-b bg-background px-4 py-2 md:py-0 sticky top-0 z-10">
        <div className="flex items-center gap-2 w-full md:w-auto self-start md:self-center">
          <SidebarTrigger className="-ml-1 md:hidden" />
          <h1 className="text-lg font-semibold ml-2 md:ml-0 flex-1 md:flex-initial truncate">
            {title}
          </h1>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          {/* Set Filter */}
          <Select
            value={selectedSet}
            onValueChange={onSetChange}
            disabled={isLoadingSets || isPending}
          >
            <SelectTrigger
              className="w-full sm:w-[180px]"
              aria-label="Filter by Set"
            >
              <SelectValue
                placeholder={isLoadingSets ? "Loading Sets..." : "Select Set"}
              />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sets</SelectItem>
              {setFetchError && (
                <SelectItem value="error" disabled>
                  Error loading sets
                </SelectItem>
              )}
              {availableSets.map((set) => (
                <SelectItem key={set.id} value={set.id}>
                  {set.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Sort Order */}
          <Select
            value={selectedSort}
            onValueChange={onSortChange}
            disabled={isPending}
          >
            <SelectTrigger className="w-full sm:w-[180px]" aria-label="Sort by">
              <SelectValue placeholder="Sort By" />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Search Input */}
          <div className="relative w-full sm:w-auto flex-1 md:grow-0 md:flex-initial">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search name..."
              className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-auto"
              value={searchInput}
              onChange={handleLocalSearchInputChange}
              disabled={isPending}
              aria-label="Search card name"
            />
          </div>
        </div>
      </div>

      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        {showInitialLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-10 gap-5">
            {renderSkeletons(pageSize)} {/* Render full page */}
          </div>
        ) : error ? (
          <div className="text-destructive text-center py-10">
            Error: {error}
          </div>
        ) : cards.length === 0 && !isLoading ? (
          <div className="text-muted-foreground text-center py-10">
            No cards found matching your criteria.
          </div>
        ) : (
          <>
            {/* Card Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-10 gap-4">
              {/* Show skeletons overlayed if loading/pending */}
              {showLoadingOverlay && renderSkeletons(cards.length)}
              {/* Show actual cards when not loading/pending */}
              {!showLoadingOverlay &&
                cards.map((card) => <CardDisplay key={card.id} card={card} />)}
            </div>

            {/* Loading indicator (optional, skeletons provide visual feedback) */}
            {showLoadingOverlay && (
              <div className="text-center text-muted-foreground py-4">
                Loading...
              </div>
            )}

            {/* Pagination */}
            {!isLoading && totalCount > pageSize && (
              <AdvancedPagination
                currentPage={currentPage}
                totalCount={totalCount}
                pageSize={pageSize}
                onPageChange={onPageChange}
                className="mt-6 pb-4"
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}
