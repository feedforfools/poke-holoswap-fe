/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Basic type declarations for the pokemontcgsdk module to make it work with TypeScript.
 * This file tells TypeScript that the module exists and provides
 * minimal type information to satisfy the compiler.
 * We use 'any' for complex types initially to get things working.
 * These can be refined later for better type safety if needed.
 */
declare module "pokemontcgsdk" {
  interface PokemonTCGConfig {
    apiKey?: string;
    // Add other config options if the SDK supports them
  }

  type QueryParams = Record<string, any>;
  // If we know specific query parameters, we could list them:
  // interface QueryParams {
  //   q?: string;
  //   page?: number;
  //   pageSize?: number;
  //   orderBy?: string;
  //   select?: string;
  // }

  // Define the expected structure of the SDK's main object
  interface PokemonTCGSDK {
    configure: (config: PokemonTCGConfig) => void;

    card: {
      find: (id: string) => Promise<any>; // Use 'any' for now, we'll define Card types in our api file
      where: (params: QueryParams) => Promise<any>; // Use 'any' for now, refine with PaginatedResponse type later
      all: (params?: QueryParams) => Promise<any[]>; // Returns an array of cards
    };

    set: {
      find: (id: string) => Promise<any>;
      where: (params: QueryParams) => Promise<any>;
      all: (params?: QueryParams) => Promise<any[]>;
    };

    type: {
      all: () => Promise<string[]>;
    };

    subtype: {
      all: () => Promise<string[]>;
    };

    supertype: {
      all: () => Promise<string[]>;
    };

    rarity: {
      all: () => Promise<string[]>;
    };

    // Add other modules exported by the SDK (e.g., types, subtypes)
  }

  const pokemon: PokemonTCGSDK;
  export default pokemon;

  export namespace PokemonTCG {
    type Parameter = QueryParams;
    // Define other types potentially exported under this namespace if needed
  }
}
