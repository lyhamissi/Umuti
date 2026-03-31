import { Link } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card, CardContent } from "../components/ui/card";
import { Search, MapPin, Clock, Shield, Pill, Building2, Users, ArrowRight } from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import AdCarousel from "../components/AdCarousel";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../components/LanguageSwitcher";
import { searchApi } from "../lib/api";
import { useEffect } from "react";

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [platformStats, setPlatformStats] = useState({
    medicines: 0,
    pharmacies: 0,
    users: 0
  });
  const navigate = useNavigate();
  const { t } = useLanguage();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await searchApi.getStats();
        if (response.data) {
          setPlatformStats(response.data);
        }
      } catch (err) {
        console.error("Failed to fetch platform stats:", err);
      }
    };
    fetchStats();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const features = [
    {
      icon: Search,
      titleKey: "searchMedicine",
      descKey: "searchMedicineDesc",
    },
    {
      icon: MapPin,
      titleKey: "nearbyPharmacies",
      descKey: "nearbyPharmaciesDesc",
    },
    {
      icon: Clock,
      titleKey: "realTimeStock",
      descKey: "realTimeStockDesc",
    },
    {
      icon: Shield,
      titleKey: "verifiedPharmacies",
      descKey: "verifiedPharmaciesDesc",
    },
  ];

  const stats = [
    { 
      icon: Pill, 
      value: platformStats.medicines > 0 ? platformStats.medicines.toLocaleString() + "+" : "1,000+", 
      labelKey: "medicinesListed" 
    },
    { 
      icon: Building2, 
      value: platformStats.pharmacies > 0 ? platformStats.pharmacies.toLocaleString() + "+" : "10+", 
      labelKey: "pharmacies" 
    },
    { 
      icon: Users, 
      value: platformStats.users > 0 ? platformStats.users.toLocaleString() + "+" : "100+", 
      labelKey: "happyUsers" 
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-24 pb-16 md:pt-32 md:pb-24 relative overflow-hidden">
        <div className="absolute inset-0 gradient-hero" />
        <div className="absolute top-20 right-0 w-1/2 h-full opacity-10">
          <div className="w-full h-full bg-primary rounded-full blur-3xl transform translate-x-1/2" />
        </div>
        
        <div className="container mx-auto px-4 relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8 animate-slide-up">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
                <Pill className="w-4 h-4" />
                {t("heroTag")}
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                {t("heroTitle")}{" "}
                <span className="text-gradient">{t("heroTitleHighlight")}</span>
              </h1>
              
              <p className="text-lg text-muted-foreground max-w-lg">
                {t("heroDescription")}
              </p>

              <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 max-w-xl">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input 
                    type="text"
                    placeholder={t("searchPlaceholder")}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-12 h-14 text-base"
                  />
                </div>
                <Button type="submit" variant="hero" size="xl">
                  {t("search")}
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </form>

              <div className="flex items-center gap-6 pt-4">
                {stats.map((stat, index) => (
                  <div key={index} className="text-center">
                    <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{t(stat.labelKey)}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="hidden lg:block relative">
              <AdCarousel />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-card">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {t("whyChoose")} <span className="text-gradient">UMUTI</span>?
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {t("whyChooseDescription")}
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="group hover:border-primary/50 transition-all duration-300">
                <CardContent className="p-6 space-y-4">
                  <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center group-hover:shadow-glow transition-all duration-300">
                    <feature.icon className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold">{t(feature.titleKey)}</h3>
                  <p className="text-sm text-muted-foreground">{t(feature.descKey)}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <Card className="gradient-primary border-0 overflow-hidden">
            <CardContent className="p-8 md:p-12 relative">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary-foreground/10 rounded-full blur-3xl" />
              <div className="relative grid md:grid-cols-2 gap-8 items-center">
                <div className="space-y-4">
                  <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground">
                    {t("pharmacyOwner")}
                  </h2>
                  <p className="text-primary-foreground/80">
                    {t("pharmacyOwnerDesc")}
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 md:justify-end">
                  <Button variant="secondary" size="lg" asChild>
                    <Link to="/register">{t("registerPharmacy")}</Link>
                  </Button>
                  <Button variant="outline" size="lg" className="bg-background text-foreground border-border hover:bg-secondary" asChild>
                    <Link to="/login">{t("loginDashboard")}</Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>


      <Footer />
    </div>
  );
};

export default Index;
