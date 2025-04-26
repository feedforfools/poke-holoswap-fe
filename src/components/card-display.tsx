"use client";

import Image from "next/image";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CardSummary } from "@/lib/pokemon-api";
import { Button } from "@/components/ui/button";
import { useCollection } from "@/contexts/collection-context";
import { cn } from "@/lib/utils";

interface CardDisplayProps {
  card: CardSummary;
  showActions?: boolean;
}

export function CardDisplay({ card, showActions = true }: CardDisplayProps) {
  const {
    addOwnedCard,
    removeOwnedCard,
    isOwned,
    addDoubleCard,
    removeDoubleCard,
    isDouble,
    addWishlistCard,
    removeWishlistCard,
    isWishlist,
  } = useCollection();

  const imageUrl = card.images?.small || "/images/card-placeholder.png"; // Basic error handling for missing image: provide a fallback image path

  const owned = isOwned(card.id);
  const double = isDouble(card.id);
  const wishlist = isWishlist(card.id);

  const handleOwnClick = () => {
    if (owned) {
      removeOwnedCard(card.id);
    } else {
      addOwnedCard(card);
    }
  };

  const handleDoubleClick = () => {
    if (double) {
      removeDoubleCard(card.id);
    } else {
      addDoubleCard(card);
    }
  };

  const handleWishClick = () => {
    if (!owned) {
      if (wishlist) {
        removeWishlistCard(card.id);
      } else {
        addWishlistCard(card);
      }
    }
  };

  return (
    <Card
      className={cn(
        "flex flex-col overflow-hidden transition-shadow duration-200 hover:shadow-lg",
        owned && "border-green-500 border-2", // Example: Highlight owned cards
        wishlist && "border-blue-500 border-2" // Example: Highlight wishlist cards
      )}
    >
      <CardHeader className="p-2 pb-0">
        <CardTitle className="text-sm font-medium truncate" title={card.name}>
          {card.name}
        </CardTitle>
        <p className="text-xs text-muted-foreground">{card.set?.name}</p>
      </CardHeader>
      <CardContent className="flex-grow p-2 flex items-center justify-center">
        <img
          src={imageUrl}
          alt={`Pokemon card ${card.name}`}
          className="max-w-full h-auto object-contain"
          loading="lazy"
        />
      </CardContent>
      {/* Conditionally render footer based on prop */}
      {showActions && (
        <CardFooter className="p-2 flex justify-around gap-1">
          {/* Own Button */}
          <Button
            variant={owned ? "default" : "outline"} // Change appearance if owned
            size="sm"
            className="text-xs px-2 h-7 flex-1"
            onClick={handleOwnClick}
            title={owned ? "Remove from Owned" : "Add to Owned"}
          >
            {owned ? "Owned" : "Own"}
          </Button>

          {/* Double Button - Only enable if owned */}
          <Button
            variant={double ? "secondary" : "outline"} // Different style for double
            size="sm"
            className="text-xs px-2 h-7 flex-1"
            onClick={handleDoubleClick}
            disabled={!owned} // Can only mark as double if owned
            title={double ? "Remove Double Mark" : "Mark as Double"}
          >
            {double ? "Double ✓" : "Double"}
          </Button>

          {/* Wishlist Button - Only enable if NOT owned */}
          <Button
            variant={wishlist ? "default" : "outline"}
            // Example: Use a different color via custom class or variant if needed
            className={cn(
              "text-xs px-2 h-7 flex-1",
              wishlist && "bg-blue-600 hover:bg-blue-700 text-white"
            )}
            size="sm"
            onClick={handleWishClick}
            disabled={owned} // Can't wishlist if owned
            title={wishlist ? "Remove from Wishlist" : "Add to Wishlist"}
          >
            {wishlist ? "Wished ✓" : "Wish"}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
