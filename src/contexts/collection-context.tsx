import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  useCallback,
  useEffect,
} from "react";
import { CardSummary } from "@/lib/pokemon-api";

// --- Constants ---
const STORAGE_KEYS = {
  OWNED: "holoSwap_ownedCards",
  DOUBLES: "holoSwap_doubleCards",
  WISHLIST: "holoSwap_wishlistCards",
};

// --- Type Definitions ---
interface CollectionState {
  ownedCards: Map<string, CardSummary>;
  doubleCards: Map<string, CardSummary>;
  wishlistCards: Map<string, CardSummary>;
}
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
type CollectionContextType = CollectionState & CollectionActions;

// --- HELPER FUNCTIONS ---

// Helper to load data from localStorage and parse it back into a Map
const loadCollectionFromStorage = (key: string): Map<string, CardSummary> => {
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      const storedData = localStorage.getItem(key);
      if (storedData) {
        const parsedArray: CardSummary[] = JSON.parse(storedData);
        return new Map(parsedArray.map((card) => [card.id, card]));
      }
    }
  } catch (error) {
    console.error(
      `Error loading collection from localStorage key "${key}":`,
      error
    );
  }
  return new Map();
};

// Helper to save a Map to localStorage by converting it to an array of values
const saveCollectionToStorage = (
  key: string,
  data: Map<string, CardSummary>
): void => {
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      const arrayToStore = Array.from(data.values());
      localStorage.setItem(key, JSON.stringify(arrayToStore));
    }
  } catch (error) {
    console.error(
      `Error saving collection to localStorage key "${key}":`,
      error
    );
  }
};

// --- Context Creation ---
const CollectionContext = createContext<CollectionContextType | undefined>(
  undefined
);

// --- Provider Component ---
interface CollectionProviderProps {
  children: ReactNode;
}

export const CollectionProvider: React.FC<CollectionProviderProps> = ({
  children,
}) => {
  const [ownedCards, setOwnedCards] = useState<Map<string, CardSummary>>(() =>
    loadCollectionFromStorage(STORAGE_KEYS.OWNED)
  );
  const [doubleCards, setDoubleCards] = useState<Map<string, CardSummary>>(() =>
    loadCollectionFromStorage(STORAGE_KEYS.DOUBLES)
  );
  const [wishlistCards, setWishlistCards] = useState<Map<string, CardSummary>>(
    () => loadCollectionFromStorage(STORAGE_KEYS.WISHLIST)
  );

  // --- Effects to save state changes ---
  useEffect(() => {
    saveCollectionToStorage(STORAGE_KEYS.OWNED, ownedCards);
    // When owned cards change, filter doubles to ensure they still exist in owned
    const updatedDoubles = new Map<string, CardSummary>();
    doubleCards.forEach((card, id) => {
      if (ownedCards.has(id)) {
        updatedDoubles.set(id, card);
      }
    });
    // Only update doubles state if it actually changed
    if (updatedDoubles.size !== doubleCards.size) {
      setDoubleCards(updatedDoubles); // This will trigger its own save if state changes
    } else {
      // If size is same, still need to check content potentially, or just save current doubles
      saveCollectionToStorage(STORAGE_KEYS.DOUBLES, doubleCards);
    }
  }, [ownedCards, doubleCards]);

  // Separate effect for doubles if direct updates happen
  useEffect(() => {
    saveCollectionToStorage(STORAGE_KEYS.DOUBLES, doubleCards);
  }, [doubleCards]);

  useEffect(() => {
    saveCollectionToStorage(STORAGE_KEYS.WISHLIST, wishlistCards);
  }, [wishlistCards]);

  // --- Action Implementations ---
  const addOwnedCard = useCallback((card: CardSummary) => {
    setOwnedCards((prev) => new Map(prev).set(card.id, card));
    // Remove from wishlist if it exists there
    setWishlistCards((prev) => {
      if (prev.has(card.id)) {
        const newMap = new Map(prev);
        newMap.delete(card.id);
        return newMap;
      }
      return prev; // Return the original map if no change
    });
  }, []);

  const removeOwnedCard = useCallback((cardId: string) => {
    setOwnedCards((prev) => {
      const newMap = new Map(prev);
      newMap.delete(cardId);
      return newMap;
    });
    // Also remove from doubles if it exists there
    setDoubleCards((prev) => {
      if (prev.has(cardId)) {
        const newMap = new Map(prev);
        newMap.delete(cardId);
        return newMap;
      }
      return prev; // Return the original map if no change
    });
  }, []);

  const addDoubleCard = useCallback((card: CardSummary) => {
    setOwnedCards((prevOwned) => {
      // Ensure it's in owned
      if (!prevOwned.has(card.id)) {
        return new Map(prevOwned).set(card.id, card);
      }
      return prevOwned; // No change needed if already owned
    });
    // Then add to doubles
    setDoubleCards((prevDoubles) => new Map(prevDoubles).set(card.id, card));
  }, []);

  const removeDoubleCard = useCallback((cardId: string) => {
    setDoubleCards((prev) => {
      const newMap = new Map(prev);
      newMap.delete(cardId);
      return newMap;
    });
  }, []);

  const addWishlistCard = useCallback(
    (card: CardSummary) => {
      if (!ownedCards.has(card.id)) {
        setWishlistCards((prev) => new Map(prev).set(card.id, card));
      } else {
        console.warn("Cannot add owned card to wishlist.");
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

// --- Custom Hook ---
export const useCollection = (): CollectionContextType => {
  const context = useContext(CollectionContext);
  if (context === undefined) {
    throw new Error("useCollection must be used within a CollectionProvider");
  }
  return context;
};
