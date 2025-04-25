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

interface CardDisplayProps {
  card: CardSummary;
}

export function CardDisplay({ card }: CardDisplayProps) {
  const imageUrl = card.images?.small || "/images/card-placeholder.png"; // Basic error handling for missing image: provide a fallback image path

  return (
    <Card className="flex flex-col overflow-hidden transition-shadow duration-200 hover:shadow-lg">
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
          // Consider adding width/height if known, or use aspect ratio styling
          loading="lazy" // Lazy load images below the fold
        />
        {/* Alternative using Next/Image (might need loader config for static export) */}
        {/* <Image
                          src={imageUrl}
                          alt={`Pokemon card ${card.name}`}
                          width={245} // Example width from API
                          height={342} // Example height from API
                          className="object-contain"
                          priority={false} // Only set priority for above-the-fold images
                          unoptimized={true} // May be needed for external URLs in static export
                      /> */}
      </CardContent>
      <CardFooter className="p-2 flex justify-around gap-1">
        <Button variant="outline" size="sm" className="text-xs px-2 h-7">
          Own
        </Button>
        <Button variant="outline" size="sm" className="text-xs px-2 h-7">
          Double
        </Button>
        <Button variant="outline" size="sm" className="text-xs px-2 h-7">
          Wish
        </Button>
      </CardFooter>
    </Card>
  );
}
