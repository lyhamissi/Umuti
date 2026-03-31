import { Card, CardContent } from "../components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "../components/ui/carousel";
import { Badge } from "../components/ui/badge";
import { MapPin, Star, Clock, Building2 } from "lucide-react";
import Autoplay from "embla-carousel-autoplay";
import { useRef } from "react";
import { useLanguage } from "../components/LanguageSwitcher";
import { useEffect, useState } from "react";
import { pharmacyApi, type Pharmacy } from "../lib/api";
import { Skeleton } from "./ui/skeleton";

const AdCarousel = () => {
  const { t } = useLanguage();
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const plugin = useRef(
    Autoplay({ delay: 5000, stopOnInteraction: true })
  );

  useEffect(() => {
    const fetchPharmacies = async () => {
      try {
        const response = await pharmacyApi.getAll({ verified: true, limit: 10 });
        if (response.success && response.data) {
          setPharmacies(response.data);
        }
      } catch (error) {
        console.error("Failed to fetch featured pharmacies:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPharmacies();
  }, []);

  if (isLoading) {
    return (
      <Card className="w-full h-[400px] md:h-[500px] animate-pulse bg-muted/20">
        <div className="p-8 md:p-12 space-y-6">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-12 w-2/3" />
          <Skeleton className="h-6 w-1/2" />
          <div className="space-y-3 pt-12">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-5 w-36" />
          </div>
        </div>
      </Card>
    );
  }

  if (pharmacies.length === 0) {
    return (
      <Card className="w-full h-[400px] md:h-[500px] bg-gradient-to-br from-primary/10 to-transparent flex items-center justify-center text-center p-8">
        <div className="space-y-4">
          <Building2 className="w-16 h-16 text-primary/40 mx-auto" />
          <h3 className="text-2xl font-bold">{t("verifiedPharmacies")}</h3>
          <p className="text-muted-foreground">{t("nearbyPharmaciesDesc")}</p>
        </div>
      </Card>
    );
  }

  const getAdBg = (index: number) => {
    const colors = [
      "from-primary/20 to-primary/5",
      "from-success/20 to-success/5",
      "from-warning/20 to-warning/5",
      "from-secondary to-secondary/50"
    ];
    return colors[index % colors.length];
  };

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
          {pharmacies.map((pharmacy, index) => (
            <CarouselItem key={pharmacy.id}>
              <Card className={`border-0 bg-gradient-to-br ${getAdBg(index)} overflow-hidden`}>
                <CardContent className="p-8 md:p-12 h-[400px] md:h-[500px] flex flex-col justify-between">
                  <div>
                    <Badge variant="secondary" className="mb-4">
                      ⭐ {t("premiumPartner")}
                    </Badge>
                    <h3 className="text-3xl md:text-4xl font-bold mb-3">
                      {pharmacy.name}
                    </h3>
                    <p className="text-lg md:text-xl text-muted-foreground mb-6">
                      {pharmacy.address}
                    </p>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="w-5 h-5 text-primary" />
                      <span>{pharmacy.address}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Star className="w-5 h-5 text-warning fill-warning" />
                      <span>4.8 {t("rating")}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="w-5 h-5 text-success" />
                      <span>{pharmacy.hours || "Open 24/7"}</span>
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
