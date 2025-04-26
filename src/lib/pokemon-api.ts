import pokemon from "pokemontcgsdk";
import { PokemonTCG } from "pokemontcgsdk";

const POKEMON_TCG_API_KEY = process.env.NEXT_PUBLIC_POKEMON_TCG_API_KEY;

if (POKEMON_TCG_API_KEY) {
  pokemon.configure({ apiKey: POKEMON_TCG_API_KEY });
  console.log("Pokemon TCG SDK Configured with API Key.");
} else {
  console.warn(
    "Pokemon TCG SDK running without API Key. Functionality may be limited."
  );
}

// --- Type Definitions ---
export interface CardImage {
  small: string;
  large: string;
}

export interface CardSet {
  id: string;
  name: string;
  series: string;
  // Add other set fields if needed
}

// Interface for the data we need for list/grid display
export interface CardSummary {
  id: string;
  name: string;
  images: CardImage;
  set: CardSet;
  // Add other summary fields if needed (e.g., rarity, types)
}

// Interface representing the structure of the API response for 'where' queries
export interface PaginatedCardResponse {
  data: CardSummary[]; // Using our defined CardSummary type
  page: number;
  pageSize: number;
  count: number; // Number of items on the current page
  totalCount: number; // Total number of items matching the query
}

// --- API Functions ---

const DEFAULT_PAGE_SIZE = 40;

/**
 * Fetches a paginated list of cards.
 * @param page - The page number to fetch (1-indexed).
 * @param query - Optional search query string (e.g., 'name:pikachu', 'set.id:base1').
 * @returns A Promise resolving to the paginated card data.
 */
export const fetchCards = async (
  page: number = 1,
  query?: string
): Promise<PaginatedCardResponse> => {
  console.log(`Fetching cards - Page: ${page}, Query: ${query || "None"}`);
  const params: PokemonTCG.Parameter = {
    page: page,
    pageSize: DEFAULT_PAGE_SIZE,
  };

  if (query) {
    // The SDK expects the query in the 'q' parameter
    params.q = query;
  }

  try {
    // Use the SDK's 'where' method for searching/paginating
    const response = (await pokemon.card.where(
      params
    )) as PaginatedCardResponse;
    console.log(
      `Fetched ${response.data.length} cards. Total count: ${response.totalCount}`
    );
    return response;
  } catch (error) {
    console.error("Error fetching cards:", error);
    throw new Error("Failed to fetch cards from API.");
  }
};

/**
 * Fetches details for a single card by its ID.
 * @param id - The unique ID of the card (e.g., 'base1-4').
 * @returns A Promise resolving to the detailed card data.
 */
export const fetchCardById = async (id: string): Promise<CardSummary> => {
  // Using CardSummary for now, could be a more detailed type later
  console.log(`Fetching card details for ID: ${id}`);
  try {
    // Use the SDK's 'find' method
    // The SDK's 'find' returns just the card data object directly under a 'data' key
    const response = await pokemon.card.find(id);
    console.log(`Fetched details for card: ${response.name}`);
    return response as CardSummary; // Cast to our type
  } catch (error) {
    console.error(`Error fetching card ${id}:`, error);
    throw new Error(`Failed to fetch card ${id}.`);
  }
};
