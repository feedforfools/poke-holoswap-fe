import { useMemo } from "react";
import { CardSummary } from "@/lib/pokemon-api";
import { cardSortFunctions } from "@/lib/card-utils";
import { CLIENT_SIDE_PAGE_SIZE } from "@/lib/constants";

interface UseProcessedCardsProps {
  baseCards: CardSummary[];
  searchTerm: string;
  selectedSet: string;
  currentSort: string;
  currentPage: number;
}

interface ProcessedCardsResult {
  paginatedCards: CardSummary[];
  totalFilteredCount: number;
}

export function useProcessedCards({
  baseCards,
  searchTerm,
  selectedSet,
  currentSort,
  currentPage,
}: UseProcessedCardsProps): ProcessedCardsResult {
  const processedResult = useMemo(() => {
    // 1. Filter by Search Term
    const filteredBySearch = searchTerm
      ? baseCards.filter((card) =>
          card.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
      : baseCards;

    // 2. Filter by Set
    const filteredBySet =
      selectedSet !== "all"
        ? filteredBySearch.filter((card) => card.set.id === selectedSet)
        : filteredBySearch;

    // 3. Sort
    const sortFn = cardSortFunctions[currentSort] || cardSortFunctions["name"];
    // Create a new array before sorting to avoid mutating the original memoized array
    const sortedCards = [...filteredBySet].sort(sortFn);

    // 4. Paginate
    const totalFilteredCount = sortedCards.length;
    const startIndex = (currentPage - 1) * CLIENT_SIDE_PAGE_SIZE;
    const endIndex = startIndex + CLIENT_SIDE_PAGE_SIZE;
    const paginatedCards = sortedCards.slice(startIndex, endIndex);

    return { paginatedCards, totalFilteredCount };
  }, [baseCards, searchTerm, selectedSet, currentSort, currentPage]); // Recalculate when inputs change

  return processedResult;
}
