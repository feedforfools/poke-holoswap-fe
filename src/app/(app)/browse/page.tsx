"use client";

import React, { useState, useEffect, useCallback, useTransition } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";
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
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const initialQuery = searchParams?.get("q") || "";
  const [searchTerm, setSearchTerm] = useState<string>(initialQuery);

  const [cards, setCards] = useState<CardSummary[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [isPending, startTransition] = useTransition();

  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  useEffect(() => {
    const params = new URLSearchParams(searchParams?.toString());
    if (debouncedSearchTerm) {
      params.set("q", debouncedSearchTerm);
    } else {
      params.delete("q");
    }
    params.delete("page");

    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`);
    });
  }, [debouncedSearchTerm, pathname, router, searchParams]);

  // --- Fetching Logic ( useCallback ) ---
  const loadCards = useCallback(async (page: number, search: string) => {
    console.log(`Loading cards - Page: ${page}, Search: '${search}'`);
    setIsLoading(true);
    setError(null);
    // Keep existing cards visible while loading next page/search results for better UX?
    // setCards([]); // Optional: Clear previous cards immediately vs waiting for new results

    try {
      let query = "";
      if (search.trim()) {
        query = `name:"${search.trim()}*"`;
      }
      const response = await fetchCards(page, query || undefined);
      setCards(response.data); // Replace cards with new data
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
  }, []);

  // --- Effect to Load Data Based on URL ---
  useEffect(() => {
    const queryParam = searchParams?.get("q") ?? "";
    const pageParam = parseInt(searchParams?.get("page") ?? "1", 10);

    // Update local state only if it differs from URL to avoid infinite loops potentially
    if (pageParam !== currentPage) {
      setCurrentPage(pageParam);
    }
    // No need to setSearchTerm here, it's driven by the input directly

    loadCards(pageParam, queryParam);
  }, [searchParams, loadCards, currentPage]); // Add currentPage dependency back carefully

  // --- Pagination Handlers ---
  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams?.toString());
    params.set("page", String(newPage));
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
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

  return (
    // Main container for the page content
    <div className="flex flex-1 flex-col h-full">
      {/* Page-specific Header */}
      <div className="flex h-16 shrink-0 items-center justify-between gap-4 border-b bg-background px-4 sticky top-0 z-10 md:px-6">
        {/* Left side: Mobile Trigger and Title */}
        <div className="flex items-center gap-2">
          <SidebarTrigger className="-ml-1 md:hidden" /> {/* Mobile Trigger */}
          <h1 className="text-lg font-semibold hidden md:block">
            Browse Cards
          </h1>
        </div>
        {/* Right side: Search Input */}
        <div className="relative flex-1 md:grow-0 md:flex-initial">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search cards by name..."
            className="w-full rounded-lg bg-muted pl-8 md:w-[200px] lg:w-[300px]"
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>
      </div>

      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        {/* Conditional Rendering: Loading, Error, No Results, Grid */}
        {isLoading && cards.length === 0 /* Skeletons */ ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-10 gap-5">
            {renderSkeletons(30)}
          </div>
        ) : error /* Error */ ? (
          <div className="text-red-600 text-center py-10">Error: {error}</div>
        ) : cards.length === 0 && !isLoading /* No Results */ ? (
          <div className="text-muted-foreground text-center py-10">
            No cards found {initialQuery ? `matching "${initialQuery}"` : ""}.
          </div>
        ) : (
          /* Grid & Pagination */
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-10 gap-5">
              {cards.map((card) => (
                <CardDisplay key={card.id} card={card} />
              ))}
            </div>
            {/* Loading indicator */}
            {(isLoading || isPending) && cards.length > 0 && (
              <div className="text-center text-muted-foreground py-4">
                Loading...
              </div>
            )}
            {/* Pagination */}
            {!isLoading && !isPending && totalPages > 1 && (
              <div className="flex items-center justify-center space-x-4 mt-6 pb-4">
                <Button
                  variant="outline"
                  onClick={handlePreviousPage}
                  disabled={currentPage === 1 || isLoading || isPending}
                >
                  Prev
                </Button>
                <span>
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  onClick={handleNextPage}
                  disabled={
                    currentPage === totalPages || isLoading || isPending
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
