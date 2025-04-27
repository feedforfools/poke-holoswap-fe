"use client";

import React, {
  useState,
  useEffect,
  useCallback,
  useTransition,
  useRef,
  Suspense,
} from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { fetchCards, CardSummary } from "@/lib/pokemon-api";
import { CardPageLayout } from "@/components/card-page-layout";
import { useAvailableSets } from "@/hooks/use-available-sets";
import { browseSortOptions } from "@/lib/card-utils";
import { Skeleton } from "@/components/ui/skeleton";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { API_PAGE_SIZE } from "@/lib/constants";

function BrowsePageSkeleton() {
  return (
    <div className="flex flex-1 flex-col h-full">
      {/* Header Skeleton */}
      <div className="flex flex-col md:flex-row h-auto md:h-16 shrink-0 items-center justify-between gap-3 border-b bg-background px-4 py-2 md:py-0 sticky top-0 z-10">
        <div className="flex items-center gap-2 w-full md:w-auto self-start md:self-center">
          <SidebarTrigger className="-ml-1 md:hidden" />
          <Skeleton className="h-6 w-32 ml-2 md:ml-0" />
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          <Skeleton className="h-9 w-full sm:w-[180px]" /> {/* Set Filter */}
          <Skeleton className="h-9 w-full sm:w-[180px]" /> {/* Sort Order */}
          <Skeleton className="h-9 w-full sm:w-auto flex-1 md:w-[200px] lg:w-auto" />{" "}
          {/* Search */}
        </div>
      </div>

      {/* Grid Skeleton */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-10 gap-4">
          {Array.from({ length: API_PAGE_SIZE }).map((_, index) => (
            <div
              key={`skeleton-browse-${index}`}
              className="flex flex-col space-y-2"
            >
              <Skeleton className="aspect-[2.5/3.5] w-full max-w-48 mx-auto" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// --- Inner Component using the hooks ---
function BrowseContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // --- URL State ---
  const currentQuery = searchParams?.get("q") ?? "";
  const currentSet = searchParams?.get("set") ?? "all";
  const currentSort = searchParams?.get("sort") ?? "-releaseDate";
  const currentPage = parseInt(searchParams?.get("page") ?? "1", 10);

  // --- API Data State ---
  const [cards, setCards] = useState<CardSummary[]>([]);
  const [isLoadingCards, setIsLoadingCards] = useState<boolean>(true);
  const [cardError, setCardError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [pageSize, setPageSize] = useState<number>(API_PAGE_SIZE);

  // --- Use the hook for sets ---
  const { availableSets, isLoadingSets, setFetchError } = useAvailableSets();

  const isInitialMount = useRef(true);

  // --- Fetching Logic ---
  const loadCards = useCallback(
    async (page: number, search: string, setId: string, sort: string) => {
      console.log(
        `Callback: loadCards - Page: ${page}, Search: '${search}', Set: ${setId}, Sort: ${sort}`
      );
      setIsLoadingCards(true);
      setCardError(null);
      try {
        const queryParts: string[] = [];
        if (search.trim()) queryParts.push(`name:"${search.trim()}*"`);
        if (setId && setId !== "all") queryParts.push(`set.id:${setId}`);
        const combinedQuery = queryParts.join(" ") || undefined;
        const orderBy = sort || undefined;

        const response = await fetchCards(page, combinedQuery, orderBy);
        setCards(response.data);
        setPageSize(response.pageSize || API_PAGE_SIZE);
        setTotalCount(response.totalCount);
      } catch (err) {
        console.error("Failed to load cards:", err);
        const message =
          err instanceof Error ? err.message : "Unknown error fetching cards";
        setCardError(message);
        setCards([]);
        setTotalCount(0);
      } finally {
        setIsLoadingCards(false);
        console.log("Finished loading cards.");
      }
    },
    []
  );

  // --- Effect to Load Cards ---
  useEffect(() => {
    console.log(
      `Effect: loadCards - Page: ${currentPage}, Search: '${currentQuery}', Set: ${currentSet}, Sort: ${currentSort}`
    );
    loadCards(currentPage, currentQuery, currentSet, currentSort);

    if (isInitialMount.current) {
      isInitialMount.current = false;
    }
    // Use the stable variables in the dependency array
  }, [
    currentPage,
    currentQuery,
    currentSet,
    currentSort,
    loadCards, // loadCards is stable due to useCallback
  ]);

  // --- Handlers ---
  const updateUrlParams = (paramUpdates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams?.toString());
    Object.entries(paramUpdates).forEach(([key, value]) => {
      if (
        value === null ||
        value === "" ||
        (key === "set" && value === "all")
      ) {
        // Treat 'all' set as null for URL
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });
    // Reset page to 1 on filter/sort/search changes
    if (
      paramUpdates.q !== undefined ||
      paramUpdates.set !== undefined ||
      paramUpdates.sort !== undefined
    ) {
      params.set("page", "1");
    } else if (
      !params.has("page") &&
      Object.keys(paramUpdates).includes("page") &&
      paramUpdates.page === "1"
    ) {
      // If setting page to 1 explicitly and it's not there, add it
      params.set("page", "1");
    } else if (
      params.get("page") === "1" &&
      Object.keys(paramUpdates).includes("page")
    ) {
      // If trying to set page=1 but it's already 1 (or absent implies 1), remove it to keep URL cleaner
      params.delete("page");
    }

    const isPagination =
      paramUpdates.page !== undefined && Object.keys(paramUpdates).length === 1;
    const navigationMethod = isPagination ? router.push : router.replace;
    const scrollOption = isPagination ? { scroll: true } : { scroll: false };

    startTransition(() => {
      console.log("Updating URL:", `${pathname}?${params.toString()}`);
      navigationMethod(`${pathname}?${params.toString()}`, scrollOption);
    });
  };

  const handlePageChange = (newPage: number) =>
    updateUrlParams({ page: String(newPage) });
  const handleSetChange = (value: string) =>
    updateUrlParams({
      set: value,
    });
  const handleSortChange = (value: string) => updateUrlParams({ sort: value });
  const handleDebouncedSearchChange = (value: string) => {
    // Only update if the debounced value actually differs from the current URL param
    if (value !== currentQuery) {
      updateUrlParams({ q: value });
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleRawSearchChange = (value: string) => {
    /* Can remain empty */
  };

  // --- Render CardPageLayout ---
  return (
    <CardPageLayout
      title="Browse Cards"
      cards={cards}
      isLoading={isLoadingCards}
      error={cardError}
      totalCount={totalCount}
      currentPage={currentPage}
      pageSize={pageSize}
      onPageChange={handlePageChange}
      searchValue={currentQuery}
      onSearchChange={handleRawSearchChange}
      onDebouncedSearchChange={handleDebouncedSearchChange}
      selectedSet={currentSet}
      onSetChange={handleSetChange}
      selectedSort={currentSort}
      onSortChange={handleSortChange}
      availableSets={availableSets}
      isLoadingSets={isLoadingSets}
      setFetchError={setFetchError}
      sortOptions={browseSortOptions}
      isPending={isPending}
    />
  );
}

// --- Default Export wrapping the content in Suspense ---
export default function BrowsePage() {
  // This outer component is static-friendly
  return (
    <Suspense fallback={<BrowsePageSkeleton />}>
      <BrowseContent />
    </Suspense>
  );
}
