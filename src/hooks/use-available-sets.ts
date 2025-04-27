import { useState, useEffect } from "react";
import { fetchSets, SetSummary } from "@/lib/pokemon-api";

export function useAvailableSets() {
  const [availableSets, setAvailableSets] = useState<SetSummary[]>([]);
  const [isLoadingSets, setIsLoadingSets] = useState<boolean>(true);
  const [setFetchError, setSetFetchError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true; // Prevent state update on unmounted component
    const loadSets = async () => {
      console.log("Hook: Fetching Sets");
      setIsLoadingSets(true);
      setSetFetchError(null);
      try {
        const sets = await fetchSets();
        if (isMounted) {
          setAvailableSets(sets);
        }
      } catch (err) {
        console.error("Hook: Failed to load sets:", err);
        const message =
          err instanceof Error ? err.message : "Unknown error fetching sets";
        if (isMounted) {
          setSetFetchError(message);
        }
      } finally {
        if (isMounted) {
          setIsLoadingSets(false);
        }
      }
    };

    loadSets();

    return () => {
      isMounted = false;
    };
  }, []);

  return { availableSets, isLoadingSets, setFetchError };
}
