"use client";

import React from "react";
import { useCollection } from "@/contexts/collection-context";
import { CardDisplay } from "@/components/card-display";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"; // Import Tabs

export default function CollectionPage() {
  const { ownedCards, doubleCards } = useCollection();

  // Convert Maps to arrays for rendering
  const allOwnedArray = Array.from(ownedCards.values());
  const doublesArray = Array.from(doubleCards.values());

  return (
    <SidebarInset>
      {/* Header */}
      <header className="flex h-16 shrink-0 items-center gap-2 border-b">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1 md:hidden" />
          <Separator orientation="vertical" className="mr-2 h-4 md:hidden" />
          <h1 className="text-lg font-semibold">My Collection</h1>
        </div>
      </header>

      {/* Content */}
      <div className="flex flex-1 flex-col gap-4 p-4 pt-4">
        <Tabs defaultValue="all">
          <TabsList className="grid w-full grid-cols-2 md:w-[400px]">
            <TabsTrigger value="all">
              All Owned ({allOwnedArray.length})
            </TabsTrigger>
            <TabsTrigger value="doubles">
              Doubles ({doublesArray.length})
            </TabsTrigger>
          </TabsList>

          {/* All Owned Tab Content */}
          <TabsContent value="all">
            {allOwnedArray.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 mt-4">
                {allOwnedArray.map((card) => (
                  <CardDisplay key={card.id} card={card} />
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center mt-6">
                You haven't added any cards to your collection yet.
              </p>
            )}
          </TabsContent>

          {/* Doubles Tab Content */}
          <TabsContent value="doubles">
            {doublesArray.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 mt-4">
                {doublesArray.map((card) => (
                  <CardDisplay key={card.id} card={card} />
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center mt-6">
                You haven't marked any cards as doubles.
              </p>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </SidebarInset>
  );
}
