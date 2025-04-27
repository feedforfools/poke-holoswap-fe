"use client";

import React from "react";
import { useCollection } from "@/contexts/collection-context";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import {
  CheckCircle,
  Star,
  Heart,
  PlusCircle,
  MinusCircle,
  Ban,
} from "lucide-react"; // Import icons

import { CardSummary } from "@/lib/pokemon-api";

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

  const imageUrl = card.images?.small || "/images/card-placeholder.png";
  const owned = isOwned(card.id);
  const double = isDouble(card.id);
  const wishlist = isWishlist(card.id);

  // --- Button Click Handlers (Simplified logic for toggle) ---
  const handleOwnClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (owned) removeOwnedCard(card.id);
    else addOwnedCard(card);
  };
  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (double) removeDoubleCard(card.id);
    else addDoubleCard(card);
  };
  const handleWishClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (wishlist) removeWishlistCard(card.id);
    else addWishlistCard(card);
  };

  return (
    <div className="relative group aspect-[2.5/3.5] w-full max-w-48 mx-auto overflow-hidden rounded-lg shadow-md transition-all duration-200 hover:shadow-xl">
      {/* Card Image */}
      <img
        src={imageUrl}
        alt={card.name}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        loading="lazy"
      />

      {/* Status Badges (Top Right Corner) */}
      <div className="absolute top-1 right-1 flex flex-col items-end space-y-1 z-10">
        {owned && (
          <CheckCircle className="w-4 h-4 text-green-400 bg-black/50 rounded-full p-0.5">
            <title>Owned</title>
          </CheckCircle>
        )}
        {double && (
          <Star className="w-4 h-4 text-yellow-400 bg-black/50 rounded-full p-0.5">
            <title>Double</title>
          </Star>
        )}
        {wishlist && (
          <Heart className="w-4 h-4 text-pink-500 bg-black/50 rounded-full p-0.5">
            <title>Wishlist</title>
          </Heart>
        )}
      </div>

      {/* Overlay on Hover */}
      {showActions && (
        <div className="absolute inset-0 flex flex-col justify-end p-2 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          {/* Optional: Card Name on Overlay */}
          <p className="text-white text-xs font-semibold truncate mb-1">
            {card.set.name}
          </p>

          {/* Action Buttons */}
          <div className="flex justify-around gap-1">
            {/* Own Button */}
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-1.5 text-xs text-white hover:bg-white/20 hover:text-white flex-1"
              onClick={handleOwnClick}
              title={owned ? "Remove from Owned" : "Add to Owned"}
            >
              {owned ? (
                <MinusCircle className="w-3.5 h-3.5 mr-1" />
              ) : (
                <PlusCircle className="w-3.5 h-3.5 mr-1" />
              )}{" "}
              Own
            </Button>

            {/* Double Button */}
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-1.5 text-xs text-white hover:bg-white/20 hover:text-white flex-1"
              onClick={handleDoubleClick}
              disabled={!owned} // Can only mark double if owned
              title={double ? "Remove Double Mark" : "Mark as Double"}
            >
              <Star
                className={cn(
                  "w-3.5 h-3.5 mr-1",
                  double ? "fill-yellow-400 text-yellow-400" : ""
                )}
              />{" "}
              Double
            </Button>

            {/* Wishlist Button */}
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-1.5 text-xs text-white hover:bg-white/20 hover:text-white flex-1"
              onClick={handleWishClick}
              disabled={owned} // Can't wishlist if owned
              title={wishlist ? "Remove from Wishlist" : "Add to Wishlist"}
            >
              {owned ? (
                <Ban className="w-3.5 h-3.5 mr-1 text-red-400" />
              ) : (
                <Heart
                  className={cn(
                    "w-3.5 h-3.5 mr-1",
                    wishlist ? "fill-pink-500 text-pink-500" : ""
                  )}
                />
              )}{" "}
              Wish
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
