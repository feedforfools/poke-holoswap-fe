"use client";

import React, { useState, useEffect } from "react";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CardDisplay } from "@/components/card-display";
import {
  fetchCards,
  CardSummary,
  PaginatedCardResponse,
} from "@/lib/pokemon-api";

export default function BrowsePage() {
  const [cards, setCards] = useState<CardSummary[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  // Add state for search term
  // const [searchTerm, setSearchTerm] = useState<string>("");

  useEffect(() => {
    const loadCards = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Fetch cards for the current page
        // Add searchTerm to query later: fetchCards(currentPage, `name:${searchTerm}*`)
        const response: PaginatedCardResponse = await fetchCards(currentPage);
        setCards(response.data);
        // Calculate total pages based on totalCount and pageSize
        setTotalPages(Math.ceil(response.totalCount / response.pageSize));
      } catch (err) {
        console.error("Failed to load cards:", err);
        setError(
          err instanceof Error ? err.message : "An unknown error occurred"
        );
        setCards([]);
        setTotalPages(1);
      } finally {
        setIsLoading(false);
      }
    };

    loadCards();
  }, [currentPage]); // Re-run effect when currentPage changes

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(1, prev - 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(totalPages, prev + 1));
  };

  // Function to render skeleton placeholders
  const renderSkeletons = (count: number) => {
    return Array.from({ length: count }).map((_, index) => (
      <div key={`skeleton-${index}`} className="flex flex-col space-y-2">
        <Skeleton className="h-8 w-3/4" /> {/* Title */}
        <Skeleton className="h-4 w-1/2" /> {/* Subtitle */}
        <Skeleton className="aspect-[5/7] w-full" /> {/* Image area */}
        <Skeleton className="h-8 w-full" /> {/* Footer actions */}
      </div>
    ));
  };

  return (
    // SidebarInset handles the main content area positioning relative to the sidebar
    <SidebarInset>
      {/* Header Section */}
      <header className="flex h-16 shrink-0 items-center gap-2 border-b">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1 md:hidden" />
          <Separator orientation="vertical" className="mr-2 h-4 md:hidden" />
          <h1 className="text-lg font-semibold">Browse Cards</h1>
        </div>
        {/* Add Search Input here later */}
      </header>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col gap-4 p-4 pt-4">
        {isLoading ? (
          // Show Skeletons while loading (adjust count as needed)
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {renderSkeletons(12)}
          </div>
        ) : error ? (
          // Show error message
          <div className="text-red-600 text-center py-10">
            Error loading cards: {error}
          </div>
        ) : cards.length === 0 ? (
          // Show message if no cards found (e.g., after a search)
          <div className="text-muted-foreground text-center py-10">
            No cards found.
          </div>
        ) : (
          // Display Card Grid
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {cards.map((card) => (
              <CardDisplay key={card.id} card={card} />
            ))}
          </div>
        )}

        {/* Pagination Controls */}
        {!isLoading && !error && totalPages > 1 && (
          <div className="flex items-center justify-center space-x-4 mt-6 pb-4">
            <Button
              variant="outline"
              onClick={handlePreviousPage}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </SidebarInset>
  );
}
