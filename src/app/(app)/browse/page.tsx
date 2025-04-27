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
import { AdvancedPagination } from "@/components/advanced-pagination";

const sortOptions = [
  { value: "name", label: "Name (A-Z)" },
  { value: "-name", label: "Name (Z-A)" },
  { value: "-releaseDate", label: "Release Date (Newest)" },
  { value: "releaseDate", label: "Release Date (Oldest)" },
  { value: "set.releaseDate,number", label: "Set Order" },
];

const DEFAULT_PAGE_SIZE = 40; // Define page size if not defined in api

export default function BrowsePage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // --- Read state directly from URL Search Params ---
  const currentQuery = searchParams?.get("q") ?? "";
  const currentSet = searchParams?.get("set") ?? "all";
  const currentSort = searchParams?.get("sort") ?? "-releaseDate";
  const currentPage = parseInt(searchParams?.get("page") ?? "1", 10);

  // Local state for user input *before* debouncing/URL update
  const [searchInput, setSearchInput] = useState<string>(currentQuery);
  const debouncedSearchTerm = useDebounce(searchInput, 500);

  // State for card data
  const [cards, setCards] = useState<CardSummary[]>([]);
  const [isLoadingCards, setIsLoadingCards] = useState<boolean>(true);
  const [cardError, setCardError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(0);

  // State for set data
  const [availableSets, setAvailableSets] = useState<SetSummary[]>([]);
  const [isLoadingSets, setIsLoadingSets] = useState<boolean>(true);
  const [setError, setSetError] = useState<string | null>(null);

  // Ref to track initial mount to avoid effects firing too early
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

  // --- Sync Local Search Input with URL on initial load or external change ---
  useEffect(() => {
    // Only run after initial mount effects have settled
    if (!isInitialMount.current && searchInput !== currentQuery) {
      setSearchInput(currentQuery);
    }
  }, [currentQuery]); // Watch only the URL query param

  // --- Effect to Update URL When Debounced Search Term Changes ---
  useEffect(() => {
    if (isInitialMount.current) {
      return; // Skip on initial mount
    }
    console.log(`Effect: Debounced search changed to: ${debouncedSearchTerm}`);
    const params = new URLSearchParams(searchParams?.toString());
    if (debouncedSearchTerm) {
      params.set("q", debouncedSearchTerm);
    } else {
      params.delete("q");
    }
    params.set("page", "1"); // Reset page on new search

    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    });
  }, [debouncedSearchTerm]); // Only depends on debounced search term

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

        // Assume fetchCards returns totalCount and pageSize
        const response = await fetchCards(
          page,
          combinedQuery || undefined,
          orderBy
        );
        setCards(response.data);
        // Calculate total pages based on API response
        const pageSize = response.pageSize || DEFAULT_PAGE_SIZE;
        setTotalPages(Math.ceil(response.totalCount / pageSize));
        setTotalCount(response.totalCount);
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
    [] // No dependencies needed here for the function itself
  );

  // --- Effect to Load Cards Based on URL Params ---
  useEffect(() => {
    // Read current params from the URL *every time* it changes
    const queryParam = searchParams?.get("q") ?? "";
    const setParam = searchParams?.get("set") ?? "all";
    const sortParam = searchParams?.get("sort") ?? "-releaseDate";
    const pageParam = parseInt(searchParams?.get("page") ?? "1", 10);

    console.log(
      "Effect: searchParams change detected, loading cards...",
      searchParams?.toString()
    );

    // Load cards based on current URL state
    loadCards(pageParam, queryParam, setParam, sortParam);

    // Mark initial mount as complete after the first run
    if (isInitialMount.current) {
      isInitialMount.current = false;
    }
  }, [searchParams, loadCards]); // Trigger ONLY when searchParams change

  // --- Event Handlers for Filters/Sort ---
  const handleFilterOrSortChange = (type: "set" | "sort", value: string) => {
    const params = new URLSearchParams(searchParams?.toString());
    if (type === "set") {
      if (value !== "all") params.set("set", value);
      else params.delete("set");
    } else if (type === "sort") {
      params.set("sort", value);
    }
    params.set("page", "1"); // Reset page on filter/sort change

    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    });
  };

  const handleSetChange = (value: string) =>
    handleFilterOrSortChange("set", value);
  const handleSortChange = (value: string) =>
    handleFilterOrSortChange("sort", value);

  // Local input change handler
  const handleSearchInputChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setSearchInput(event.target.value);
    // The useEffect watching debouncedSearchTerm handles the rest
  };

  // --- Pagination Handlers ---
  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages || newPage === currentPage) return;

    const params = new URLSearchParams(searchParams?.toString());
    params.set("page", String(newPage));
    console.log(`Pagination: Updating page to ${newPage}`);
    startTransition(() => {
      // Use push for pagination history, but replace might be smoother if desired
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    });
  };

  // --- Skeleton Rendering ---
  const renderSkeletons = (count: number) => {
    return Array.from({ length: count }).map((_, index) => (
      <div key={`skeleton-${index}`} className="flex flex-col space-y-2">
        <Skeleton className="aspect-[2.5/3.5] w-full max-w-48 mx-auto" />{" "}
        {/* Image area */}
      </div>
    ));
  };

  // Determine initial loading state
  const showInitialLoading = isLoadingCards && cards.length === 0 && !cardError;

  return (
    <div className="flex flex-1 flex-col h-full">
      {/* Page-specific Header */}
      <div className="flex flex-col md:flex-row h-auto md:h-16 shrink-0 items-center justify-between gap-3 border-b bg-background px-4 py-2 md:py-0 sticky top-0 z-10">
        {/* ... (Header content remains the same) ... */}
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
            disabled={isLoadingSets || isPending}
          >
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue
                placeholder={isLoadingSets ? "Loading Sets..." : "Select Set"}
              />
            </SelectTrigger>
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
          <Select
            value={currentSort}
            onValueChange={handleSortChange}
            disabled={isPending}
          >
            <SelectTrigger className="w-full sm:w-[180px]">
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
              className="w-full rounded-lg bg-muted pl-8 md:w-[200px] lg:w-auto"
              value={searchInput}
              onChange={handleSearchInputChange}
              disabled={isPending}
            />
          </div>
        </div>
      </div>

      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        {showInitialLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-10 gap-5">
            {renderSkeletons(DEFAULT_PAGE_SIZE)} {/* Render full page */}
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
              {/* Show skeletons overlayed if loading/pending */}
              {
                (isLoadingCards || isPending) &&
                  cards.length > 0 &&
                  renderSkeletons(cards.length) // Render skeletons matching current card count for smoother transition
              }
              {/* Show actual cards when not loading */}
              {!(isLoadingCards || isPending) &&
                cards.length > 0 &&
                cards.map((card) => <CardDisplay key={card.id} card={card} />)}
            </div>

            {/* Loading indicator (optional, skeletons provide visual feedback) */}
            {(isLoadingCards || isPending) && cards.length > 0 && (
              <div className="text-center text-muted-foreground py-4">
                Loading...
              </div>
            )}

            {/* --- Shadcn Pagination --- */}
            {!isLoadingCards && totalCount > DEFAULT_PAGE_SIZE && (
              <AdvancedPagination
                currentPage={currentPage}
                totalCount={totalCount} // Pass total item count
                pageSize={DEFAULT_PAGE_SIZE} // Pass page size used
                onPageChange={handlePageChange}
                className="mt-6 pb-4"
                // siblingCount={1} // Optional: defaults to 1
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}
