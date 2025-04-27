import pokemon from "pokemontcgsdk";
import { PokemonTCG } from "pokemontcgsdk";
import { API_PAGE_SIZE } from "@/lib/constants";

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
  printedTotal: number;
  total: number;
  legalities?: {
    unlimited?: string;
    standard?: string;
    expanded?: string;
  };
  ptcgoCode?: string;
  releaseDate: string;
  updatedAt: string;
  images?: {
    symbol: string;
    logo: string;
  };
}

export interface CardSummary {
  id: string;
  name: string;
  number: string;
  images: CardImage;
  set: CardSet;
}

export interface SetSummary {
  id: string;
  name: string;
  releaseDate: string;
  series: string;
  printedTotal: number;
  total: number;
  images: { symbol: string; logo: string };
}

export interface PaginatedCardResponse {
  data: CardSummary[];
  page: number;
  pageSize: number;
  count: number; // Number of items on the current page
  totalCount: number; // Total number of items matching the query
}

// --- API Functions ---

/**
 * Fetches a paginated list of cards.
 * @param page - The page number to fetch (1-indexed).
 * @param query - Optional search query string (e.g., 'name:pikachu', 'set.id:base1').
 * @param orderBy - Optional sorting parameter (e.g., 'name', '-releaseDate').
 * @returns A Promise resolving to the paginated card data.
 */
export const fetchCards = async (
  page: number = 1,
  query?: string,
  orderBy?: string // Add orderBy parameter
): Promise<PaginatedCardResponse> => {
  console.log(
    `Fetching cards - Page: ${page}, Query: ${query || "None"}, OrderBy: ${
      orderBy || "Default"
    }`
  );
  const params: PokemonTCG.Parameter = {
    page: page,
    pageSize: API_PAGE_SIZE,
  };
  if (query) {
    params.q = query;
  }
  if (orderBy) {
    params.orderBy = orderBy; // Add orderBy to SDK parameters
  }

  try {
    const response = (await pokemon.card.where(
      params
    )) as PaginatedCardResponse; // Cast to our defined response type
    console.log(
      `Fetched ${response.data.length} cards. Total: ${response.totalCount}`
    );

    return response;
  } catch (error) {
    console.error("Error fetching cards:", error);
    if (error instanceof Error) {
      // Attempt to log more specific API error details if available
      try {
        const errorDetails = (error as any).response?.data || error.message;
        console.error("API Error Details:", errorDetails);
      } catch (e) {
        console.error("Could not parse error details.");
      }
    }
    throw new Error("Failed to fetch cards from API.");
  }
};

/**
 * Fetches details for a single card by its ID.
 * @param id - The ID of the card to fetch.
 * @return A Promise resolving to the card details.
 */
export const fetchCardById = async (id: string): Promise<CardSummary> => {
  console.log(`Fetching card details for ID: ${id}`);
  try {
    // The SDK's 'find' method should also return the full nested set info
    const response = await pokemon.card.find(id);
    console.log(`Fetched details for card: ${response.name}`);
    return response as CardSummary; // Cast to our type which includes the updated CardSet
  } catch (error) {
    console.error(`Error fetching card ${id}:`, error);
    throw new Error(`Failed to fetch card ${id}.`);
  }
};

/**
 * Fetches a list of all available Pokémon TCG Sets.
 * @returns A Promise resolving to an array of SetSummary objects.
 */
export const fetchSets = async (): Promise<SetSummary[]> => {
  console.log("Fetching all sets...");
  try {
    // Fetch all sets - this returns the Set objects directly
    const setsData = await pokemon.set.all(); // Use default parameters for 'all'
    console.log(`Fetched ${setsData.length} sets.`);

    // Sort sets alphabetically by name for the dropdown display consistency
    const sortedSets = setsData.sort((a, b) => a.name.localeCompare(b.name));

    // Map or Cast to our SetSummary type if needed (adjust fields based on SDK return)
    // Often the direct return matches SetSummary closely enough, but check SDK docs if unsure.
    return sortedSets as SetSummary[];
  } catch (error) {
    console.error("Error fetching sets:", error);
    throw new Error("Failed to fetch sets from API.");
  }
};
