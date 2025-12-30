import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Search, MapPin, Phone, Clock, Navigation, Filter, ChevronDown } from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

interface Pharmacy {
  id: string;
  name: string;
  address: string;
  distance: string;
  phone: string;
  hours: string;
  inStock: boolean;
  quantity: number;
  price: string;
}

const mockPharmacies: Pharmacy[] = [
  {
    id: "1",
    name: "PharmaCare Plus",
    address: "KG 7 Ave, Kigali",
    distance: "0.5 km",
    phone: "+250 788 123 456",
    hours: "8:00 AM - 9:00 PM",
    inStock: true,
    quantity: 50,
    price: "2,500 RWF",
  },
  {
    id: "2",
    name: "HealthFirst Pharmacy",
    address: "KN 3 St, Nyarugenge",
    distance: "1.2 km",
    phone: "+250 788 234 567",
    hours: "7:00 AM - 10:00 PM",
    inStock: true,
    quantity: 25,
    price: "2,300 RWF",
  },
  {
    id: "3",
    name: "MediPlus Drugstore",
    address: "KK 15 Ave, Kicukiro",
    distance: "2.8 km",
    phone: "+250 788 345 678",
    hours: "24 Hours",
    inStock: true,
    quantity: 100,
    price: "2,400 RWF",
  },
  {
    id: "4",
    name: "City Pharmacy",
    address: "KG 11 Ave, Gasabo",
    distance: "3.5 km",
    phone: "+250 788 456 789",
    hours: "8:00 AM - 8:00 PM",
    inStock: false,
    quantity: 0,
    price: "2,600 RWF",
  },
];

const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (searchParams.get("q")) {
      handleSearch();
    }
  }, []);

  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    setSearchParams({ q: searchQuery });
    
    // Simulate API call
    setTimeout(() => {
      setPharmacies(mockPharmacies);
      setIsSearching(false);
    }, 500);
  };

  const openDirections = (address: string) => {
    const encodedAddress = encodeURIComponent(address + ", Kigali, Rwanda");
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodedAddress}`, "_blank");
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Search Header */}
          <div className="max-w-3xl mx-auto mb-12">
            <h1 className="text-3xl md:text-4xl font-bold text-center mb-6">
              Find Medicine Near You
            </h1>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input 
                  type="text"
                  placeholder="Search for medicine (e.g., Paracetamol, Amoxicillin)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                  className="pl-12 h-12"
                />
              </div>
              <Button onClick={handleSearch} variant="hero" size="lg" disabled={isSearching}>
                {isSearching ? "Searching..." : "Search"}
              </Button>
            </div>
          </div>

          {/* Results */}
          {pharmacies.length > 0 && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold">
                    Results for "<span className="text-primary">{searchParams.get("q")}</span>"
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Found in {pharmacies.filter(p => p.inStock).length} pharmacies near you
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
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
                            {pharmacy.inStock ? "In Stock" : "Out of Stock"}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div className="flex items-center gap-2 text-sm">
                            <Navigation className="w-4 h-4 text-primary" />
                            <span className="font-medium">{pharmacy.distance}</span>
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
                              <span className="text-muted-foreground">Price: </span>
                              <span className="font-semibold text-primary">{pharmacy.price}</span>
                            </div>
                          )}
                        </div>

                        {pharmacy.inStock && (
                          <div className="flex gap-3">
                            <Button 
                              variant="hero" 
                              className="flex-1"
                              onClick={() => openDirections(pharmacy.address)}
                            >
                              <Navigation className="w-4 h-4" />
                              Get Directions
                            </Button>
                            <Button variant="outline">
                              <Phone className="w-4 h-4" />
                              Call
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
                      <CardTitle className="text-lg">Pharmacies Near You</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[calc(100%-80px)]">
                      <div className="w-full h-full rounded-lg bg-secondary flex items-center justify-center">
                        <div className="text-center p-8">
                          <MapPin className="w-16 h-16 text-primary mx-auto mb-4 opacity-50" />
                          <p className="text-muted-foreground">
                            Map integration coming soon
                          </p>
                          <p className="text-sm text-muted-foreground mt-2">
                            Click "Get Directions" to open in Google Maps
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
          {!pharmacies.length && !isSearching && (
            <div className="text-center py-16">
              <div className="w-24 h-24 rounded-full bg-secondary mx-auto mb-6 flex items-center justify-center">
                <Search className="w-12 h-12 text-muted-foreground" />
              </div>
              <h2 className="text-2xl font-semibold mb-2">Search for Medicine</h2>
              <p className="text-muted-foreground max-w-md mx-auto">
                Enter the name of the medicine you're looking for to find pharmacies near you with available stock.
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
