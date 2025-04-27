"use client";

import React, { useState, useEffect } from "react";
import { useCollection } from "@/contexts/collection-context";
import { CardDisplay } from "@/components/card-display";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";

export default function WishlistPage() {
  const { wishlistCards } = useCollection();
  const [isClient, setIsClient] = useState(false);

  // Effect to set isClient to true after mounting
  useEffect(() => {
    setIsClient(true);
  }, []);

  const wishlistArray = Array.from(wishlistCards.values());

  // Function to render skeletons for the grid
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
    <SidebarInset>
      {/* Header */}
      <div className="flex h-16 shrink-0 items-center border-b bg-background px-4 md:px-6 sticky top-0 z-10">
        <SidebarTrigger className="-ml-1 md:hidden" />
        <h1 className="text-lg font-semibold ml-2 md:ml-0">My Wishlist</h1>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        {!isClient ? (
          renderGridSkeletons(6)
        ) : wishlistArray.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-4">
            {wishlistArray.map((card) => (
              <CardDisplay key={card.id} card={card} />
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-center mt-6">
            Your wishlist is empty. Add cards using the 'Wish' button!
          </p>
        )}
      </div>
    </SidebarInset>
  );
}
