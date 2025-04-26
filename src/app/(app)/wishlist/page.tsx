"use client";

import React from "react";
import { useCollection } from "@/contexts/collection-context";
import { CardDisplay } from "@/components/card-display";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";

export default function WishlistPage() {
  const { wishlistCards } = useCollection();

  // Convert Map to array
  const wishlistArray = Array.from(wishlistCards.values());

  return (
    <SidebarInset>
      {/* Header */}
      <header className="flex h-16 shrink-0 items-center gap-2 border-b">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1 md:hidden" />
          <Separator orientation="vertical" className="mr-2 h-4 md:hidden" />
          <h1 className="text-lg font-semibold">My Wishlist</h1>
        </div>
      </header>

      {/* Content */}
      <div className="flex flex-1 flex-col gap-4 p-4 pt-4">
        {wishlistArray.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
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
