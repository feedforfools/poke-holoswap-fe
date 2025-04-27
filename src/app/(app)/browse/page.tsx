"use client";

import React, {
  useState,
  useEffect,
  useCallback,
  useTransition,
  useRef,
} from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";
import {
  fetchSets,
  SetSummary,
  fetchCards,
  CardSummary,
  PaginatedCardResponse,
} from "@/lib/pokemon-api";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { CardDisplay } from "@/components/card-display";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";

const sortOptions = [
  { value: "name", label: "Name (A-Z)" },
  { value: "-name", label: "Name (Z-A)" },
  { value: "-releaseDate", label: "Release Date (Newest)" },
  { value: "releaseDate", label: "Release Date (Oldest)" },
  { value: "set.releaseDate,number", label: "Set Order" },
];

export default function BrowsePage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // --- State for Filters/Sorting (derived from URL) ---
  // We primarily rely on searchParams now, local state mirrors it
  const currentQuery = searchParams?.get("q") || "";
  const currentSet = searchParams?.get("set") || "all";
  const currentSort = searchParams?.get("sort") || "-releaseDate";
  const currentPage = parseInt(searchParams?.get("page") ?? "1", 10);

  // Local state for user input *before* debouncing/URL update
  const [searchInput, setSearchInput] = useState<string>(currentQuery);
  const debouncedSearchTerm = useDebounce(searchInput, 500);

  // State for card data
  const [cards, setCards] = useState<CardSummary[]>([]);
  const [isLoadingCards, setIsLoadingCards] = useState<boolean>(true);
  const [cardError, setCardError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState<number>(1);

  // State for set data
  const [availableSets, setAvailableSets] = useState<SetSummary[]>([]);
  const [isLoadingSets, setIsLoadingSets] = useState<boolean>(true);
  const [setError, setSetError] = useState<string | null>(null);

  // Ref to track if it's the initial mount to prevent unnecessary URL updates
  const isInitialMount = useRef(true);

  // --- Fetch Sets (Runs once) ---
  useEffect(() => {
    const loadSets = async () => {
      console.log("Effect: Fetching Sets");
      setIsLoadingSets(true);
      setSetError(null);
      try {
        const sets = await fetchSets();
        setAvailableSets(sets);
      } catch (err) {
        console.error("Failed to load sets:", err);
        setSetError(
          err instanceof Error ? err.message : "Unknown error fetching sets"
        );
      } finally {
        setIsLoadingSets(false);
      }
    };
    loadSets();
  }, []);

  // --- URL Update Logic (Triggered by filter/sort/search changes) ---
  const updateUrlParams = useCallback(
    (newSet: string, newSort: string, newSearch: string) => {
      console.log("Callback: updateUrlParams called");
      const params = new URLSearchParams(searchParams?.toString());

      // Update params based on new values
      if (newSearch) params.set("q", newSearch);
      else params.delete("q");
      if (newSet !== "all") params.set("set", newSet);
      else params.delete("set");
      params.set("sort", newSort); // Always include sort
      params.set("page", "1"); // Always reset to page 1 on filter change

      // Only update if the params actually changed
      if (
        params.toString() !==
        new URLSearchParams(searchParams?.toString()).toString()
      ) {
        console.log("Updating URL with params:", params.toString());
        startTransition(() => {
          router.replace(`${pathname}?${params.toString()}`, { scroll: false });
        });
      } else {
        console.log("URL params haven't changed, skipping router update.");
      }
    },
    [pathname, router, searchParams]
  );

  // --- Effect to trigger URL update when debounced search, set, or sort change ---
  useEffect(() => {
    console.log(
      `Effect: Filter/Sort change detected. DebouncedSearch: ${debouncedSearchTerm}, Set: ${currentSet}, Sort: ${currentSort}`
    );
    if (isInitialMount.current) {
      // On initial mount, ensure local search input matches URL query
      if (currentQuery !== searchInput) {
        setSearchInput(currentQuery);
      }
      console.log("Skipping URL update on initial mount effect run.");
      return;
    }
    // Call the memoized function to update URL
    updateUrlParams(currentSet, currentSort, debouncedSearchTerm);
  }, [debouncedSearchTerm, currentSet, currentSort, updateUrlParams]); // Watch the *debounced* term and current URL values for set/sort

  // --- Fetching Logic ---
  const loadCards = useCallback(
    async (page: number, search: string, setId: string, sort: string) => {
      console.log(
        `Callback: loadCards - Page: ${page}, Search: '${search}', Set: ${setId}, Sort: ${sort}`
      );
      setIsLoadingCards(true);
      setCardError(null);
      try {
        let queryParts: string[] = [];
        if (search.trim()) queryParts.push(`name:"${search.trim()}*"`);
        if (setId && setId !== "all") queryParts.push(`set.id:${setId}`);
        const combinedQuery = queryParts.join(" ");
        const orderBy = sort || undefined;

        const response = await fetchCards(
          page,
          combinedQuery || undefined,
          orderBy
        );
        setCards(response.data);
        setTotalPages(Math.ceil(response.totalCount / response.pageSize));
      } catch (err) {
        console.error("Failed to load cards:", err);
        setCardError(
          err instanceof Error ? err.message : "Unknown error fetching cards"
        );
        setCards([]);
        setTotalPages(1);
      } finally {
        setIsLoadingCards(false);
        console.log("Finished loading cards.");
      }
    },
    []
  );

  // --- Effect to Load Data Based on URL Params ---
  useEffect(() => {
    console.log(
      "Effect: searchParams change detected",
      searchParams?.toString()
    );

    if (isInitialMount.current) {
      isInitialMount.current = false;
    }
    // Read current params from the URL *every time* it changes
    const queryParam = searchParams?.get("q") ?? "";
    const setParam = searchParams?.get("set") ?? "all";
    const sortParam = searchParams?.get("sort") ?? "-releaseDate";
    const pageParam = parseInt(searchParams?.get("page") ?? "1", 10);

    // Sync local search input only if URL differs and it's not actively being typed/debounced
    // This prevents the URL update effect from fighting with user input
    if (queryParam !== debouncedSearchTerm && queryParam !== searchInput) {
      console.log(`Syncing searchInput from URL: ${queryParam}`);
      setSearchInput(queryParam);
    }

    // Load cards based on current URL state
    loadCards(pageParam, queryParam, setParam, sortParam);
  }, [searchParams, loadCards, debouncedSearchTerm, searchInput]);

  // --- Event Handlers for Selects/Inputs ---
  const handleSetChange = (value: string) => {
    updateUrlParams(value, currentSort, currentQuery);
  };

  const handleSortChange = (value: string) => {
    updateUrlParams(currentSet, value, currentQuery);
  };

  const handleSearchInputChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    // Update the *local* input state immediately
    setSearchInput(event.target.value);
    // The useEffect watching debouncedSearchTerm will handle the URL update
  };

  // --- Pagination Handlers ---
  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams?.toString());
    params.set("page", String(newPage));
    console.log(`Pagination: Updating page to ${newPage}`);
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`, { scroll: false }); // Use push for pagination history
    });
  };
  const handlePreviousPage = () =>
    handlePageChange(Math.max(1, currentPage - 1));
  const handleNextPage = () =>
    handlePageChange(Math.min(totalPages, currentPage + 1));

  // Function to render skeleton placeholders
  const renderSkeletons = (count: number) => {
    return Array.from({ length: count }).map((_, index) => (
      <div key={`skeleton-${index}`} className="flex flex-col space-y-2">
        <Skeleton className="aspect-[5/7] w-full" /> {/* Image area */}
      </div>
    ));
  };

  const showInitialLoading =
    (isLoadingSets || isLoadingCards) && cards.length === 0 && !cardError;

  return (
    <div className="flex flex-1 flex-col h-full">
      {/* Page-specific Header */}
      <div className="flex flex-col md:flex-row h-auto md:h-16 shrink-0 items-center justify-between gap-3 border-b bg-background px-4 py-2 md:py-0 sticky top-0 z-10">
        <div className="flex items-center gap-2 w-full md:w-auto self-start md:self-center">
          <SidebarTrigger className="-ml-1 md:hidden" />
          <h1 className="text-lg font-semibold ml-2 md:ml-0 flex-1 md:flex-initial">
            Browse Cards
          </h1>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          {/* Set Filter */}
          <Select
            value={currentSet}
            onValueChange={handleSetChange}
            disabled={isLoadingSets}
          >
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue
                placeholder={isLoadingSets ? "Loading Sets..." : "Select Set"}
              />
            </SelectTrigger>
            {/* ... SelectContent for Sets ... */}
            <SelectContent>
              <SelectItem value="all">All Sets</SelectItem>
              {setError && (
                <SelectItem value="error" disabled>
                  {setError}
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
          <Select value={currentSort} onValueChange={handleSortChange}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Sort By" />
            </SelectTrigger>
            {/* ... SelectContent for Sort ... */}
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
              className="w-full rounded-lg bg-muted pl-8 md:w-[200px] lg:w-auto"
              value={searchInput} // Bind to local input state
              onChange={handleSearchInputChange} // Use specific handler
            />
          </div>
        </div>
      </div>

      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        {showInitialLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-10 gap-5">
            {renderSkeletons(40)}
          </div>
        ) : cardError ? (
          <div className="text-red-600 text-center py-10">
            Error: {cardError}
          </div>
        ) : cards.length === 0 && !isLoadingCards ? (
          <div className="text-muted-foreground text-center py-10">
            No cards found matching your criteria.
          </div>
        ) : (
          <>
            {/* Card Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-10 gap-4">
              {cards.map((card) => (
                <CardDisplay key={card.id} card={card} />
              ))}
            </div>
            {/* Loading indicator */}
            {(isLoadingCards || isPending) && cards.length > 0 && (
              <div className="text-center text-muted-foreground py-4">
                Loading...
              </div>
            )}
            {/* Pagination */}
            {!isLoadingCards && !isPending && totalPages > 1 && (
              <div className="flex items-center justify-center space-x-4 mt-6 pb-4">
                <Button
                  variant="outline"
                  onClick={handlePreviousPage}
                  disabled={currentPage === 1 || isLoadingCards || isPending}
                >
                  Prev
                </Button>
                <span suppressHydrationWarning>
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  onClick={handleNextPage}
                  disabled={
                    currentPage === totalPages || isLoadingCards || isPending
                  }
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
