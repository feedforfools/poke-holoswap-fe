"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useCollection } from "@/contexts/collection-context";
import { CardPageLayout } from "@/components/card-page-layout";
import { useAvailableSets } from "@/hooks/use-available-sets";
import { useProcessedCards } from "@/hooks/use-processed-cards";
import { baseSortOptions } from "@/lib/card-utils";
import { CLIENT_SIDE_PAGE_SIZE } from "@/lib/constants";
import { Skeleton } from "@/components/ui/skeleton";

export default function WishlistPage() {
  const { wishlistCards } = useCollection();
  const [isClient, setIsClient] = useState(false);

  // --- Local State for Filters/Sort/Pagination ---
  const [searchValue, setSearchValue] = useState(""); // Debounced
  const [rawSearchInput, setRawSearchInput] = useState(""); // Instant
  const [selectedSet, setSelectedSet] = useState("all");
  const [currentSort, setCurrentSort] = useState("name");
  const [currentPage, setCurrentPage] = useState(1);

  // --- Use Hooks ---
  const { availableSets, isLoadingSets, setFetchError } = useAvailableSets();

  useEffect(() => {
    setIsClient(true);
  }, []);

  // --- Memoize Base Card Array ---
  const wishlistArray = useMemo(
    () => (isClient ? Array.from(wishlistCards.values()) : []),
    [isClient, wishlistCards]
  );

  // --- Use Processing Hook ---
  const { paginatedCards, totalFilteredCount } = useProcessedCards({
    baseCards: wishlistArray,
    searchTerm: searchValue,
    selectedSet,
    currentSort,
    currentPage,
  });

  // --- Handlers (Update Local State) ---
  const handlePageChange = (newPage: number) => setCurrentPage(newPage);
  const handleSetChange = (value: string) => {
    setSelectedSet(value);
    setCurrentPage(1);
  };
  const handleSortChange = (value: string) => {
    setCurrentSort(value);
    setCurrentPage(1);
  };
  const handleDebouncedSearchChange = (value: string) => {
    setSearchValue(value);
    setCurrentPage(1);
  };
  const handleRawSearchChange = (value: string) => {
    setRawSearchInput(value);
  };

  // --- Render ---
  const isLoading = !isClient || isLoadingSets;

  if (!isClient) {
    // Keep a simple initial skeleton before client mount
    return (
      <div className="flex flex-1 flex-col h-full">
        <div className="flex h-16 shrink-0 items-center justify-between border-b bg-background px-4 md:px-6 sticky top-0 z-10">
          <Skeleton className="h-6 w-32" />
          <div className="flex gap-3">
            <Skeleton className="h-9 w-40" />
            <Skeleton className="h-9 w-40" />
            <Skeleton className="h-9 w-48" />
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-10 gap-5 p-4 md:p-6">
          {Array.from({ length: 12 }).map((_, i) => (
            <Skeleton key={i} className="aspect-[2.5/3.5] w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <CardPageLayout
      title="My Wishlist"
      cards={paginatedCards}
      isLoading={isLoading}
      error={setFetchError}
      totalCount={totalFilteredCount}
      currentPage={currentPage}
      pageSize={CLIENT_SIDE_PAGE_SIZE}
      onPageChange={handlePageChange}
      searchValue={rawSearchInput}
      onSearchChange={handleRawSearchChange}
      onDebouncedSearchChange={handleDebouncedSearchChange}
      selectedSet={selectedSet}
      onSetChange={handleSetChange}
      selectedSort={currentSort}
      onSortChange={handleSortChange}
      availableSets={availableSets}
      isLoadingSets={isLoadingSets}
      setFetchError={setFetchError}
      sortOptions={baseSortOptions}
      isPending={isLoadingSets}
    />
  );
}
