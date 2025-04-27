import { CardSummary } from "@/lib/pokemon-api";

// Client-side sorting functions
export const cardSortFunctions: Record<
  string,
  (a: CardSummary, b: CardSummary) => number
> = {
  name: (a, b) => a.name.localeCompare(b.name),
  "-name": (a, b) => b.name.localeCompare(a.name),
  "-releaseDate": (a, b) => {
    const dateA = a.set?.releaseDate
      ? new Date(a.set.releaseDate).getTime()
      : 0;
    const dateB = b.set?.releaseDate
      ? new Date(b.set.releaseDate).getTime()
      : 0;
    return dateB - dateA;
  },
  releaseDate: (a, b) => {
    const dateA = a.set?.releaseDate
      ? new Date(a.set.releaseDate).getTime()
      : 0;
    const dateB = b.set?.releaseDate
      ? new Date(b.set.releaseDate).getTime()
      : 0;
    return dateA - dateB;
  },
  "set.releaseDate,number": (a, b) => {
    const dateA = a.set?.releaseDate
      ? new Date(a.set.releaseDate).getTime()
      : 0;
    const dateB = b.set?.releaseDate
      ? new Date(b.set.releaseDate).getTime()
      : 0;
    const dateComparison = dateA - dateB;
    if (dateComparison !== 0) return dateComparison;
    // Add number comparison here if card number is available and parsed on CardSummary
    // Example: return parseInt(a.number || '0') - parseInt(b.number || '0');
    return a.name.localeCompare(b.name); // Fallback to name
  },
};

// Common sort options for client-side views (Collection, Wishlist)
export const baseSortOptions = [
  { value: "name", label: "Name (A-Z)" },
  { value: "-name", label: "Name (Z-A)" },
  { value: "-releaseDate", label: "Release Date (Newest)" },
  { value: "releaseDate", label: "Release Date (Oldest)" },
  { value: "set.releaseDate,number", label: "Set Order (Approx.)" },
];

// Specific sort options for the API-driven browse page
export const browseSortOptions = [
  { value: "name", label: "Name (A-Z)" },
  { value: "-name", label: "Name (Z-A)" },
  { value: "-releaseDate", label: "Release Date (Newest)" }, // API default
  { value: "releaseDate", label: "Release Date (Oldest)" },
  { value: "set.releaseDate,number", label: "Set Order" }, // API supports this directly
];
