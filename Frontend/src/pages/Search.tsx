import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Search, MapPin, Phone, Clock, Navigation, Filter, ChevronDown, Locate, ChevronRight } from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useLanguage } from "../components/LanguageSwitcher";
import { useToast } from "../hooks/use-toast";
import { searchApi, type SearchResult } from "../lib/api";

interface DisplayPharmacy {
  id: string;
  name: string;
  address: string;
  distance: string;
  phone: string;
  hours: string;
  inStock: boolean;
  quantity: number;
  price: string;
  strength?: string;
  similarMedicines?: { name: string; price: string }[];
}

const formatPrice = (price: number): string => {
  return `${price.toLocaleString()} RWF`;
};

const formatDistance = (distanceKm?: number): string => {
  if (!distanceKm) return "N/A";
  return `${distanceKm.toFixed(1)} km`;
};

const mapSearchResultToPharmacy = (result: SearchResult): DisplayPharmacy => ({
  id: result.pharmacy.id,
  name: result.pharmacy.name,
  address: result.pharmacy.address,
  distance: formatDistance(result.distance),
  phone: result.pharmacy.phone,
  hours: result.pharmacy.hours || "Hours not available",
  inStock: result.inStock,
  quantity: result.quantity,
  price: formatPrice(result.price),
  strength: result.medicine?.strength,
  similarMedicines: [],
});

const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [location, setLocation] = useState("");
  const [userCoords, setUserCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [pharmacies, setPharmacies] = useState<DisplayPharmacy[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [expandedSimilar, setExpandedSimilar] = useState<string | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);
  const { t } = useLanguage();
  const { toast } = useToast();

  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setSearchError(null);
    setSearchParams({ q: searchQuery, ...(location && { loc: location }) });

    try {
      const response = await searchApi.searchMedicine({
        q: searchQuery,
        lat: userCoords?.lat,
        lon: userCoords?.lon,
        radius: 10,
        inStockOnly: false,
      });

      if (response.data?.results) {
        const mappedPharmacies = response.data.results.map(mapSearchResultToPharmacy);
        setPharmacies(mappedPharmacies);
      } else {
        setPharmacies([]);
      }
    } catch (err) {
      const error = err as Error;
      setSearchError(error.message || "Failed to search. Please try again.");
      toast({
        title: "Search Error",
        description: error.message || "Failed to search. Please try again.",
        variant: "destructive",
      });
      setPharmacies([]);
    } finally {
      setIsSearching(false);
    }
  }, [searchQuery, location, userCoords, setSearchParams, toast]);

  useEffect(() => {
    const query = searchParams.get("q");
    if (query && query !== searchQuery) {
      setSearchQuery(query);
    }
  }, [searchParams]);

  useEffect(() => {
    const query = searchParams.get("q");
    if (query) {
      handleSearch();
    }
  }, []);

  const getCurrentLocation = () => {
    setIsLocating(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = {
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          };
          setUserCoords(coords);
          setLocation(`${coords.lat.toFixed(4)}, ${coords.lon.toFixed(4)}`);
          setIsLocating(false);
          toast({ title: t("useCurrentLocation"), description: "Location detected!" });
        },
        () => {
          setIsLocating(false);
          toast({
            title: "Location Error",
            description: "Could not get your location. Please enter it manually.",
            variant: "destructive"
          });
        }
      );
    } else {
      setIsLocating(false);
      toast({
        title: "Location Not Supported",
        description: "Your browser doesn't support geolocation.",
        variant: "destructive"
      });
    }
  };

  const openDirections = (address: string) => {
    const origin = location ? encodeURIComponent(location) : "";
    const destination = encodeURIComponent(address + ", Kigali, Rwanda");
    const url = origin
      ? `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}`
      : `https://www.google.com/maps/dir/?api=1&destination=${destination}`;
    window.open(url, "_blank");
  };

  const toggleSimilar = (pharmacyId: string) => {
    setExpandedSimilar(expandedSimilar === pharmacyId ? null : pharmacyId);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Search Header */}
          <div className="max-w-4xl mx-auto mb-12">
            <h1 className="text-3xl md:text-4xl font-bold text-center mb-6">
              {t("findMedicineNearYou")}
            </h1>

            <div className="space-y-4">
              {/* Medicine Search */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder={t("searchPlaceholder")}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    className="pl-12 h-12"
                  />
                </div>
                <Button onClick={handleSearch} variant="hero" size="lg" disabled={isSearching}>
                  {isSearching ? "..." : t("search")}
                </Button>
              </div>

              {/* Location Input */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder={t("locationPlaceholder")}
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="pl-12 h-12"
                  />
                </div>
                <Button
                  onClick={getCurrentLocation}
                  variant="outline"
                  size="lg"
                  disabled={isLocating}
                  className="whitespace-nowrap"
                >
                  <Locate className="w-4 h-4 mr-2" />
                  {isLocating ? "..." : t("useCurrentLocation")}
                </Button>
              </div>
            </div>
          </div>

          {/* Error State */}
          {searchError && (
            <div className="max-w-4xl mx-auto mb-8 p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-center">
              <p className="text-destructive">{searchError}</p>
              <p className="text-sm text-muted-foreground mt-2">
                Make sure the backend server is running on port 5000
              </p>
            </div>
          )}

          {/* Results */}
          {pharmacies.length > 0 && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold">
                    {t("searchResults")} "<span className="text-primary">{searchParams.get("q")}</span>"
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    {t("foundIn")} {pharmacies.filter(p => p.inStock).length} {t("pharmaciesNearYou")}
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  <Filter className="w-4 h-4 mr-2" />
                  {t("filter")}
                  <ChevronDown className="w-4 h-4 ml-2" />
                </Button>
              </div>

              <div className="grid lg:grid-cols-2 gap-6">
                {/* Pharmacy Cards */}
                <div className="space-y-4">
                  {pharmacies.map((pharmacy) => (
                    <Card
                      key={pharmacy.id}
                      className={`transition-all duration-300 ${!pharmacy.inStock ? 'opacity-60' : 'hover:border-primary/50'}`}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="text-lg font-semibold">{pharmacy.name}</h3>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                              <MapPin className="w-4 h-4" />
                              {pharmacy.address}
                            </div>
                          </div>
                          <Badge
                            variant={pharmacy.inStock ? "default" : "secondary"}
                            className={pharmacy.inStock ? "bg-success text-success-foreground" : ""}
                          >
                            {pharmacy.inStock ? t("inStock") : t("outOfStock")}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div className="flex items-center gap-2 text-sm">
                            <Navigation className="w-4 h-4 text-primary" />
                            <span className="font-medium">{pharmacy.distance} {t("distanceFromYou")}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Clock className="w-4 h-4 text-primary" />
                            <span>{pharmacy.hours}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Phone className="w-4 h-4 text-primary" />
                            <span>{pharmacy.phone}</span>
                          </div>
                          {pharmacy.inStock && (
                            <div className="text-sm">
                              <span className="text-muted-foreground">{t("price")}: </span>
                              <span className="font-semibold text-primary">{pharmacy.price}</span>
                            </div>
                          )}
                        </div>

                        {pharmacy.strength && (
                          <div className="mb-4 text-sm">
                            <span className="text-muted-foreground">{t("strength")}: </span>
                            <span className="font-medium">{pharmacy.strength}</span>
                          </div>
                        )}

                        {/* Similar Medicines Section */}
                        {pharmacy.similarMedicines && pharmacy.similarMedicines.length > 0 && (
                          <div className="mb-4">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="w-full justify-between text-primary hover:text-primary"
                              onClick={() => toggleSimilar(pharmacy.id)}
                            >
                              <span>{t("similarMedicinesAvailable")} ({pharmacy.similarMedicines.length})</span>
                              <ChevronRight className={`w-4 h-4 transition-transform ${expandedSimilar === pharmacy.id ? 'rotate-90' : ''}`} />
                            </Button>

                            {expandedSimilar === pharmacy.id && (
                              <div className="mt-2 space-y-2 p-3 bg-secondary/50 rounded-lg">
                                <p className="text-xs text-muted-foreground mb-2">
                                  {t("alternativesAtSamePharmacy")}
                                </p>
                                {pharmacy.similarMedicines.map((similar, idx) => (
                                  <div key={idx} className="flex items-center justify-between p-2 bg-background rounded">
                                    <div>
                                      <p className="text-sm font-medium">{similar.name}</p>
                                      <p className="text-xs text-muted-foreground">
                                        {t("availableAt")} {pharmacy.name}
                                      </p>
                                    </div>
                                    <div className="text-right">
                                      <p className="text-sm font-semibold text-primary">{similar.price}</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}

                        {pharmacy.inStock && (
                          <div className="flex gap-3">
                            <Button
                              variant="hero"
                              className="flex-1"
                              onClick={() => openDirections(pharmacy.address)}
                            >
                              <Navigation className="w-4 h-4" />
                              {t("getDirections")}
                            </Button>
                            <Button variant="outline">
                              <Phone className="w-4 h-4" />
                              {t("call")}
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Map Placeholder */}
                <div className="hidden lg:block">
                  <Card className="h-[600px] sticky top-24">
                    <CardHeader>
                      <CardTitle className="text-lg">{t("pharmaciesNearYouMap")}</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[calc(100%-80px)]">
                      <div className="w-full h-full rounded-lg bg-secondary flex items-center justify-center">
                        <div className="text-center p-8">
                          <MapPin className="w-16 h-16 text-primary mx-auto mb-4 opacity-50" />
                          <p className="text-muted-foreground">
                            {t("mapComingSoon")}
                          </p>
                          <p className="text-sm text-muted-foreground mt-2">
                            {t("clickGetDirections")}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          )}

          {/* Empty State */}
          {!pharmacies.length && !isSearching && !searchError && (
            <div className="text-center py-16">
              <div className="w-24 h-24 rounded-full bg-secondary mx-auto mb-6 flex items-center justify-center">
                <Search className="w-12 h-12 text-muted-foreground" />
              </div>
              <h2 className="text-2xl font-semibold mb-2">{t("searchForMedicine")}</h2>
              <p className="text-muted-foreground max-w-md mx-auto">
                {t("enterMedicineName")}
              </p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default SearchPage;
