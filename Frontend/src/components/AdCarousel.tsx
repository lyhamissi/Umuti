import { Card, CardContent } from "../components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "../components/ui/carousel";
import { Badge } from "../components/ui/badge";
import { MapPin, Star, Clock } from "lucide-react";
import Autoplay from "embla-carousel-autoplay";
import { useRef } from "react";
import { useLanguage } from "../components/LanguageSwitcher";

interface PharmacyAd {
  id: number;
  name: string;
  tagline: string;
  location: string;
  rating: number;
  hours: string;
  featured: boolean;
  bgColor: string;
}

const pharmacyAds: PharmacyAd[] = [
  {
    id: 1,
    name: "HealthPlus Pharmacy",
    tagline: "Your trusted health partner since 2010",
    location: "Kigali City Center",
    rating: 4.9,
    hours: "Open 24/7",
    featured: true,
    bgColor: "from-primary/20 to-primary/5",
  },
  {
    id: 2,
    name: "MediCare Rwanda",
    tagline: "Quality medicines at affordable prices",
    location: "Kimironko",
    rating: 4.7,
    hours: "7AM - 10PM",
    featured: true,
    bgColor: "from-success/20 to-success/5",
  },
  {
    id: 3,
    name: "Pharma Express",
    tagline: "Fast service, reliable care",
    location: "Nyamirambo",
    rating: 4.8,
    hours: "6AM - 11PM",
    featured: true,
    bgColor: "from-warning/20 to-warning/5",
  },
  {
    id: 4,
    name: "Green Cross Pharmacy",
    tagline: "Natural remedies & modern medicine",
    location: "Remera",
    rating: 4.6,
    hours: "8AM - 9PM",
    featured: true,
    bgColor: "from-secondary to-secondary/50",
  },
];

const AdCarousel = () => {
  const { t } = useLanguage();
  const plugin = useRef(
    Autoplay({ delay: 5000, stopOnInteraction: true })
  );

  return (
    <div className="relative w-full">
      <Carousel
        plugins={[plugin.current]}
        className="w-full"
        opts={{
          align: "start",
          loop: true,
        }}
      >
        <CarouselContent>
          {pharmacyAds.map((ad) => (
            <CarouselItem key={ad.id}>
              <Card className={`border-0 bg-gradient-to-br ${ad.bgColor} overflow-hidden`}>
                <CardContent className="p-8 md:p-12 h-[400px] md:h-[500px] flex flex-col justify-between">
                  <div>
                    <Badge variant="secondary" className="mb-4">
                      ⭐ {t("premiumPartner")}
                    </Badge>
                    <h3 className="text-3xl md:text-4xl font-bold mb-3">
                      {ad.name}
                    </h3>
                    <p className="text-lg md:text-xl text-muted-foreground mb-6">
                      {ad.tagline}
                    </p>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="w-5 h-5 text-primary" />
                      <span>{ad.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Star className="w-5 h-5 text-warning fill-warning" />
                      <span>{ad.rating} {t("rating")}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="w-5 h-5 text-success" />
                      <span>{ad.hours}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="left-4" />
        <CarouselNext className="right-4" />
      </Carousel>
    </div>
  );
};

export default AdCarousel;
