"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useCollection } from "@/contexts/collection-context";
import { CardPageLayout } from "@/components/card-page-layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAvailableSets } from "@/hooks/use-available-sets";
import { useProcessedCards } from "@/hooks/use-processed-cards";
import { baseSortOptions } from "@/lib/card-utils";
import { CLIENT_SIDE_PAGE_SIZE } from "@/lib/constants";

export default function CollectionPage() {
  const { ownedCards, doubleCards } = useCollection();
  const [isClient, setIsClient] = useState(false);
  const [currentTab, setCurrentTab] = useState("all");

  // --- Local State for Filters/Sort/Pagination ---
  const [searchValue, setSearchValue] = useState(""); // Debounced
  const [rawSearchInput, setRawSearchInput] = useState(""); // Instant
  const [selectedSet, setSelectedSet] = useState("all");
  const [currentSort, setCurrentSort] = useState("name");
  const [currentPageAll, setCurrentPageAll] = useState(1);
  const [currentPageDoubles, setCurrentPageDoubles] = useState(1);

  // --- Use Hooks ---
  const { availableSets, isLoadingSets, setFetchError } = useAvailableSets();

  useEffect(() => {
    setIsClient(true);
  }, []);

  // --- Memoize Base Card Arrays ---
  const allOwnedArray = useMemo(
    () => (isClient ? Array.from(ownedCards.values()) : []),
    [isClient, ownedCards]
  );
  const doublesArray = useMemo(
    () => (isClient ? Array.from(doubleCards.values()) : []),
    [isClient, doubleCards]
  );

  // --- Determine active base cards and current page ---
  const activeBaseCards = currentTab === "all" ? allOwnedArray : doublesArray;
  const activeCurrentPage =
    currentTab === "all" ? currentPageAll : currentPageDoubles;

  // --- Use Processing Hook ---
  const { paginatedCards, totalFilteredCount } = useProcessedCards({
    baseCards: activeBaseCards,
    searchTerm: searchValue,
    selectedSet,
    currentSort,
    currentPage: activeCurrentPage,
  });

  // --- Handlers (Update Local State) ---
  const handlePageChange = (newPage: number) => {
    if (currentTab === "all") setCurrentPageAll(newPage);
    else setCurrentPageDoubles(newPage);
  };
  const handleSetChange = (value: string) => {
    setSelectedSet(value);
    setCurrentPageAll(1);
    setCurrentPageDoubles(1);
  };
  const handleSortChange = (value: string) => {
    setCurrentSort(value);
    setCurrentPageAll(1);
    setCurrentPageDoubles(1);
  };
  const handleDebouncedSearchChange = (value: string) => {
    setSearchValue(value);
    setCurrentPageAll(1);
    setCurrentPageDoubles(1);
  };
  const handleRawSearchChange = (value: string) => {
    setRawSearchInput(value);
  };

  // --- Switch Page Handler ---
  const handleTabChange = (value: string) => {
    setCurrentTab(value);
  };

  // --- Render ---
  // Use a loading state that considers client mount AND set loading
  const isLoading = !isClient || isLoadingSets;

  return (
    <div className="flex flex-1 flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        <Tabs
          defaultValue="all"
          value={currentTab}
          onValueChange={handleTabChange}
          className="flex flex-col h-full"
        >
          <TabsList className="grid w-full grid-cols-2 md:w-[400px] shrink-0 mb-4">
            <TabsTrigger value="all">
              All Owned ({isClient ? allOwnedArray.length : "..."})
            </TabsTrigger>
            <TabsTrigger value="doubles">
              Doubles ({isClient ? doublesArray.length : "..."})
            </TabsTrigger>
          </TabsList>

          {/* Render layout within a single content area, controlled by tab state */}
          <div className="flex-1 mt-0">
            {/* We only need one instance of CardPageLayout,
                 its props change based on the active tab */}
            <CardPageLayout
              key={currentTab} // Add key to force re-render/state reset of layout *if needed*
              title={
                currentTab === "all"
                  ? "My Collection - All Owned"
                  : "My Collection - Doubles"
              }
              cards={paginatedCards} // From useProcessedCards
              isLoading={isLoading}
              error={setFetchError}
              totalCount={totalFilteredCount} // From useProcessedCards
              currentPage={activeCurrentPage}
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
          </div>
          {/* Dummy TabsContent needed for Tabs component structure, but layout is outside */}
          <TabsContent value="all" className="hidden" />
          <TabsContent value="doubles" className="hidden" />
        </Tabs>
      </div>
    </div>
  );
}
