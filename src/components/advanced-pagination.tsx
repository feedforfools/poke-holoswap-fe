import React from "react";
import { cn } from "@/lib/utils";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { usePaginationRange, DOTS } from "@/hooks/use-pagination-range";

interface AdvancedPaginationProps extends React.ComponentProps<"nav"> {
  totalCount: number; // Total number of items
  pageSize: number; // Items per page
  currentPage: number;
  onPageChange: (page: number) => void;
  siblingCount?: number;
  className?: string;
}

export function AdvancedPagination({
  totalCount,
  pageSize,
  currentPage,
  onPageChange,
  siblingCount = 1,
  className,
  ...props
}: AdvancedPaginationProps) {
  const paginationRange = usePaginationRange({
    currentPage,
    totalCount,
    siblingCount,
    pageSize,
  });

  const totalPageCount = Math.ceil(totalCount / pageSize);

  // If there are less than 2 times in pagination range we shall not render the component
  if (currentPage === 0 || paginationRange.length < 2) {
    return null;
  }

  const onNext = () => {
    if (currentPage < totalPageCount) {
      onPageChange(currentPage + 1);
    }
  };

  const onPrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  return (
    <Pagination className={cn("mt-6 pb-4", className)} {...props}>
      <PaginationContent>
        {/* Previous Button */}
        <PaginationItem>
          <PaginationPrevious
            href="#" // Use onClick instead
            onClick={(e) => {
              e.preventDefault();
              onPrevious();
            }}
            aria-disabled={currentPage === 1}
            className={
              currentPage === 1 ? "pointer-events-none opacity-50" : undefined
            }
          />
        </PaginationItem>

        {/* Page Numbers and Ellipses */}
        {paginationRange.map((pageNumber, index) => {
          // If the pageItem is a DOT, render the PaginationEllipsis component
          if (pageNumber === DOTS) {
            return (
              <PaginationItem key={`${DOTS}-${index}`}>
                {" "}
                {/* Unique key */}
                <PaginationEllipsis />
              </PaginationItem>
            );
          }

          // Render our Page Pills
          return (
            <PaginationItem key={pageNumber}>
              <PaginationLink
                href="#" // Use onClick instead
                onClick={(e) => {
                  e.preventDefault();
                  // Ensure pageNumber is treated as number before calling onPageChange
                  if (typeof pageNumber === "number") {
                    onPageChange(pageNumber);
                  }
                }}
                isActive={currentPage === pageNumber}
                aria-current={currentPage === pageNumber ? "page" : undefined}
              >
                {pageNumber}
              </PaginationLink>
            </PaginationItem>
          );
        })}

        {/* Next Button */}
        <PaginationItem>
          <PaginationNext
            href="#" // Use onClick instead
            onClick={(e) => {
              e.preventDefault();
              onNext();
            }}
            aria-disabled={currentPage === totalPageCount}
            className={
              currentPage === totalPageCount
                ? "pointer-events-none opacity-50"
                : undefined
            }
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
