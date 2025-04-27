"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useCollection } from "@/contexts/collection-context";
import { CardDisplay } from "@/components/card-display";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { AdvancedPagination } from "@/components/advanced-pagination";

const PAGE_SIZE = 40;

export default function WishlistPage() {
  const { wishlistCards } = useCollection();
  const [isClient, setIsClient] = useState(false);

  // --- Pagination State ---
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // --- Memoize Card Array ---
  const wishlistArray = useMemo(
    () => (isClient ? Array.from(wishlistCards.values()) : []),
    [isClient, wishlistCards]
  );

  // --- Calculate Pagination Data (Memoized) ---
  const paginationData = useMemo(() => {
    const totalCards = wishlistArray.length;
    const totalPages = Math.ceil(totalCards / PAGE_SIZE);
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    const endIndex = startIndex + PAGE_SIZE;
    const paginatedCards = wishlistArray.slice(startIndex, endIndex);
    return { totalPages, paginatedCards, totalCards };
  }, [wishlistArray, currentPage]);

  const { totalPages, paginatedCards, totalCards } = paginationData;

  // --- Pagination Handlers ---
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };
  const handlePreviousPage = () => handlePageChange(currentPage - 1);
  const handleNextPage = () => handlePageChange(currentPage + 1);

  // --- Skeleton Rendering ---
  const renderGridSkeletons = (count: number) => {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-4">
        {Array.from({ length: count }).map((_, index) => (
          <div
            key={`wish-skel-${index}`}
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
        <h1 className="text-lg font-semibold ml-2 md:ml-0">My Wishlist</h1>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        {!isClient ? (
          renderGridSkeletons(6) // Initial skeleton
        ) : totalCards > 0 ? (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-4">
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
            Your wishlist is empty. Add cards using the 'Wish' button!
          </p>
        )}
      </div>
    </div>
  );
}
