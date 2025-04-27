"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useCollection } from "@/contexts/collection-context";
import { CardDisplay } from "@/components/card-display";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { AdvancedPagination } from "@/components/advanced-pagination";

const PAGE_SIZE = 40;

export default function CollectionPage() {
  const { ownedCards, doubleCards } = useCollection();
  const [isClient, setIsClient] = useState(false);
  const [currentTab, setCurrentTab] = useState("all");

  // --- Pagination State ---
  const [currentPageAll, setCurrentPageAll] = useState(1);
  const [currentPageDoubles, setCurrentPageDoubles] = useState(1);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // --- Memoize Card Arrays ---
  const allOwnedArray = useMemo(
    () => (isClient ? Array.from(ownedCards.values()) : []),
    [isClient, ownedCards]
  );
  const doublesArray = useMemo(
    () => (isClient ? Array.from(doubleCards.values()) : []),
    [isClient, doubleCards]
  );

  // --- Calculate Pagination Data (Memoized) ---
  const paginationDataAll = useMemo(() => {
    const totalCards = allOwnedArray.length;
    const totalPages = Math.ceil(totalCards / PAGE_SIZE);
    const startIndex = (currentPageAll - 1) * PAGE_SIZE;
    const endIndex = startIndex + PAGE_SIZE;
    const paginatedCards = allOwnedArray.slice(startIndex, endIndex);
    return { totalPages, paginatedCards };
  }, [allOwnedArray, currentPageAll]);

  const paginationDataDoubles = useMemo(() => {
    const totalCards = doublesArray.length;
    const totalPages = Math.ceil(totalCards / PAGE_SIZE);
    const startIndex = (currentPageDoubles - 1) * PAGE_SIZE;
    const endIndex = startIndex + PAGE_SIZE;
    const paginatedCards = doublesArray.slice(startIndex, endIndex);
    return { totalPages, paginatedCards };
  }, [doublesArray, currentPageDoubles]);

  // --- Pagination Handlers ---
  const handlePageChange = (newPage: number) => {
    if (currentTab === "all") {
      if (newPage >= 1 && newPage <= paginationDataAll.totalPages) {
        setCurrentPageAll(newPage);
      }
    } else if (currentTab === "doubles") {
      if (newPage >= 1 && newPage <= paginationDataDoubles.totalPages) {
        setCurrentPageDoubles(newPage);
      }
    }
  };
  const handlePreviousPage = () =>
    handlePageChange(
      currentTab === "all" ? currentPageAll - 1 : currentPageDoubles - 1
    );
  const handleNextPage = () =>
    handlePageChange(
      currentTab === "all" ? currentPageAll + 1 : currentPageDoubles + 1
    );

  // --- Get current pagination state based on tab ---
  const currentPage =
    currentTab === "all" ? currentPageAll : currentPageDoubles;
  const totalPages =
    currentTab === "all"
      ? paginationDataAll.totalPages
      : paginationDataDoubles.totalPages;
  const paginatedCards =
    currentTab === "all"
      ? paginationDataAll.paginatedCards
      : paginationDataDoubles.paginatedCards;
  const totalCards =
    currentTab === "all" ? allOwnedArray.length : doublesArray.length;

  // --- Skeleton Rendering ---
  const renderGridSkeletons = (count: number) => {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-4 mt-4">
        {Array.from({ length: count }).map((_, index) => (
          <div
            key={`col-skel-${index}`}
            className="aspect-[2.5/3.5] w-full max-w-48 mx-auto overflow-hidden rounded-lg"
          >
            <Skeleton className="w-full h-full" />
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="flex flex-1 flex-col h-full">
      {/* Header */}
      <div className="flex h-16 shrink-0 items-center border-b bg-background px-4 md:px-6 sticky top-0 z-10">
        <SidebarTrigger className="-ml-1 md:hidden" />
        <h1 className="text-lg font-semibold ml-2 md:ml-0">My Collection</h1>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        <Tabs defaultValue="all" onValueChange={setCurrentTab}>
          <TabsList className="grid w-full grid-cols-2 md:w-[400px]">
            <TabsTrigger value="all">
              All Owned (
              {isClient ? (
                <span suppressHydrationWarning>{allOwnedArray.length}</span>
              ) : (
                "..."
              )}
              )
            </TabsTrigger>
            <TabsTrigger value="doubles">
              Doubles (
              {isClient ? (
                <span suppressHydrationWarning>{doublesArray.length}</span>
              ) : (
                "..."
              )}
              )
            </TabsTrigger>
          </TabsList>

          {/* Common Grid Display Logic */}
          {isClient ? (
            totalCards > 0 ? (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-4 mt-4">
                  {paginatedCards.map((card) => (
                    <CardDisplay key={card.id} card={card} />
                  ))}
                </div>
                {totalPages > 1 && (
                  <AdvancedPagination
                    currentPage={currentPage}
                    totalCount={totalCards}
                    pageSize={PAGE_SIZE}
                    onPageChange={handlePageChange}
                    className="mt-6 pb-4"
                  />
                )}
              </>
            ) : (
              <p className="text-muted-foreground text-center mt-6">
                {currentTab === "all"
                  ? "You haven't added any cards to your collection yet."
                  : "You haven't marked any cards as doubles."}
              </p>
            )
          ) : (
            // Show skeletons while client is mounting
            renderGridSkeletons(6)
          )}

          {/* Tab Content Wrappers (Empty, logic moved above) */}
          <TabsContent value="all" />
          <TabsContent value="doubles" />
        </Tabs>
      </div>
    </div>
  );
}
