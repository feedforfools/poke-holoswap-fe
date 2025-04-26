"use client";

import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  useCallback,
} from "react";
import { CardSummary } from "@/lib/pokemon-api";

// --- Types ---

// Defines the structure of the collection state
interface CollectionState {
  ownedCards: Map<string, CardSummary>;
  doubleCards: Map<string, CardSummary>;
  wishlistCards: Map<string, CardSummary>;
}

// Defines the functions available to modify the collection
interface CollectionActions {
  addOwnedCard: (card: CardSummary) => void;
  removeOwnedCard: (cardId: string) => void;
  addDoubleCard: (card: CardSummary) => void;
  removeDoubleCard: (cardId: string) => void;
  addWishlistCard: (card: CardSummary) => void;
  removeWishlistCard: (cardId: string) => void;
  isOwned: (cardId: string) => boolean;
  isDouble: (cardId: string) => boolean;
  isWishlist: (cardId: string) => boolean;
}

// Combines state and actions for the context value
type CollectionContextType = CollectionState & CollectionActions;

// --- Context Creation ---

// Create the context with a default value (or null)
// Providing default functions prevents errors if consumed outside a Provider,
// though in practice, we'll always use it within the Provider.
const CollectionContext = createContext<CollectionContextType | undefined>(
  undefined
);

// --- Provider Component ---

// Props for the provider component, needs children to render
interface CollectionProviderProps {
  children: ReactNode;
}

export const CollectionProvider: React.FC<CollectionProviderProps> = ({
  children,
}) => {
  // State hooks to manage the collection data
  const [ownedCards, setOwnedCards] = useState<Map<string, CardSummary>>(
    new Map()
  );
  const [doubleCards, setDoubleCards] = useState<Map<string, CardSummary>>(
    new Map()
  );
  const [wishlistCards, setWishlistCards] = useState<Map<string, CardSummary>>(
    new Map()
  );

  // --- Action Implementations ---
  // Use useCallback to memoize functions, preventing unnecessary re-renders of consumers

  const addOwnedCard = useCallback((card: CardSummary) => {
    setOwnedCards((prev) => new Map(prev).set(card.id, card));
    // If adding to owned, it cannot be simultaneously in wishlist
    removeWishlistCard(card.id);
  }, []);

  const removeOwnedCard = useCallback((cardId: string) => {
    setOwnedCards((prev) => {
      const newMap = new Map(prev);
      newMap.delete(cardId);
      return newMap;
    });
    // Also remove from doubles if removing from owned
    removeDoubleCard(cardId);
  }, []);

  const addDoubleCard = useCallback(
    (card: CardSummary) => {
      // You must own a card to mark it as double
      if (!ownedCards.has(card.id)) {
        addOwnedCard(card); // Add to owned first if not already there
      }
      setDoubleCards((prev) => new Map(prev).set(card.id, card));
    },
    [ownedCards, addOwnedCard]
  );

  const removeDoubleCard = useCallback((cardId: string) => {
    setDoubleCards((prev) => {
      const newMap = new Map(prev);
      newMap.delete(cardId);
      return newMap;
    });
  }, []);

  const addWishlistCard = useCallback(
    (card: CardSummary) => {
      // Can't wishlist a card you own
      if (!ownedCards.has(card.id)) {
        setWishlistCards((prev) => new Map(prev).set(card.id, card));
      }
    },
    [ownedCards]
  );

  const removeWishlistCard = useCallback((cardId: string) => {
    setWishlistCards((prev) => {
      const newMap = new Map(prev);
      newMap.delete(cardId);
      return newMap;
    });
  }, []);

  // --- Helper Functions ---

  const isOwned = useCallback(
    (cardId: string): boolean => ownedCards.has(cardId),
    [ownedCards]
  );
  const isDouble = useCallback(
    (cardId: string): boolean => doubleCards.has(cardId),
    [doubleCards]
  );
  const isWishlist = useCallback(
    (cardId: string): boolean => wishlistCards.has(cardId),
    [wishlistCards]
  );

  // --- Value Provided by Context ---
  const value: CollectionContextType = {
    ownedCards,
    doubleCards,
    wishlistCards,
    addOwnedCard,
    removeOwnedCard,
    addDoubleCard,
    removeDoubleCard,
    addWishlistCard,
    removeWishlistCard,
    isOwned,
    isDouble,
    isWishlist,
  };

  return (
    <CollectionContext.Provider value={value}>
      {children}
    </CollectionContext.Provider>
  );
};

// --- Custom Hook for easy context consumption ---
export const useCollection = (): CollectionContextType => {
  const context = useContext(CollectionContext);
  if (context === undefined) {
    throw new Error("useCollection must be used within a CollectionProvider");
  }
  return context;
};
