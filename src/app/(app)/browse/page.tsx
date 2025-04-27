"use client";

import React, {
  useState,
  useEffect,
  useCallback,
  useTransition,
  useRef,
} from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import {
  fetchCards,
  CardSummary,
  PaginatedCardResponse,
} from "@/lib/pokemon-api";
import { CardPageLayout } from "@/components/card-page-layout";
import { useAvailableSets } from "@/hooks/use-available-sets";
import { browseSortOptions } from "@/lib/card-utils";
import { API_PAGE_SIZE } from "@/lib/constants";

export default function BrowsePage() {
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
        let queryParts: string[] = [];
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
    const queryParam = searchParams?.get("q") ?? "";
    const setParam = searchParams?.get("set") ?? "all";
    const sortParam = searchParams?.get("sort") ?? "-releaseDate";
    const pageParam = parseInt(searchParams?.get("page") ?? "1", 10);

    loadCards(pageParam, queryParam, setParam, sortParam);

    if (isInitialMount.current) {
      isInitialMount.current = false;
    }
  }, [searchParams, loadCards]);

  // --- Handlers ---
  const updateUrlParams = (paramUpdates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams?.toString());
    Object.entries(paramUpdates).forEach(([key, value]) => {
      if (value === null || value === "") {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });
    if (
      paramUpdates.q !== undefined ||
      paramUpdates.set !== undefined ||
      paramUpdates.sort !== undefined
    ) {
      params.set("page", "1");
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
    updateUrlParams({ set: value === "all" ? null : value });
  const handleSortChange = (value: string) => updateUrlParams({ sort: value });
  const handleDebouncedSearchChange = (value: string) => {
    if (!isInitialMount.current && value !== (searchParams?.get("q") ?? "")) {
      updateUrlParams({ q: value });
    }
  };
  const handleRawSearchChange = (value: string) => {
    /* Can remain empty */
  };

  return (
    <CardPageLayout
      title="Browse Cards"
      cards={cards}
      isLoading={isLoadingCards}
      error={cardError}
      totalCount={totalCount}
      currentPage={currentPage}
      pageSize={pageSize} // Pass dynamic page size from API
      onPageChange={handlePageChange}
      searchValue={currentQuery}
      onSearchChange={handleRawSearchChange}
      onDebouncedSearchChange={handleDebouncedSearchChange}
      selectedSet={currentSet}
      onSetChange={handleSetChange}
      selectedSort={currentSort}
      onSortChange={handleSortChange}
      availableSets={availableSets} // From hook
      isLoadingSets={isLoadingSets} // From hook
      setFetchError={setFetchError} // From hook
      sortOptions={browseSortOptions} // Pass specific options
      isPending={isPending}
    />
  );
}
