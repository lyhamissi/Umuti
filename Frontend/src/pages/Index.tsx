import { Link } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card, CardContent } from "../components/ui/card";
import { Search, MapPin, Clock, Shield, Pill, Building2, Users, ArrowRight } from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import heroImage from "../assets/hero-pharmacy.jpg";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const features = [
    {
      icon: Search,
      title: "Search Medicine",
      description: "Find any medicine instantly with our powerful search",
    },
    {
      icon: MapPin,
      title: "Nearby Pharmacies",
      description: "Discover pharmacies closest to you with stock available",
    },
    {
      icon: Clock,
      title: "Real-time Stock",
      description: "Get accurate, up-to-date inventory information",
    },
    {
      icon: Shield,
      title: "Verified Pharmacies",
      description: "All pharmacies are licensed and verified",
    },
  ];

  const stats = [
    { icon: Pill, value: "10,000+", label: "Medicines Listed" },
    { icon: Building2, value: "500+", label: "Pharmacies" },
    { icon: Users, value: "50,000+", label: "Happy Users" },
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
                Rwanda's #1 Medicine Finder
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                Find Your Medicine at the{" "}
                <span className="text-gradient">Nearest Pharmacy</span>
              </h1>
              
              <p className="text-lg text-muted-foreground max-w-lg">
                Search for any medicine and discover which pharmacies near you have it in stock. Save time, stay healthy.
              </p>

              <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 max-w-xl">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input 
                    type="text"
                    placeholder="Search for medicine (e.g., Paracetamol)"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-12 h-14 text-base"
                  />
                </div>
                <Button type="submit" variant="hero" size="xl">
                  Search
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </form>

              <div className="flex items-center gap-6 pt-4">
                {stats.map((stat, index) => (
                  <div key={index} className="text-center">
                    <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="hidden lg:block relative">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl animate-fade-in">
                <img 
                  src={heroImage} 
                  alt="Modern pharmacy interior" 
                  className="w-full h-[500px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/20 to-transparent" />
              </div>
              
              {/* Floating Cards */}
              <Card className="absolute -left-8 top-20 animate-float shadow-lg">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">500+ Pharmacies</p>
                    <p className="text-xs text-muted-foreground">Near you</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="absolute -right-4 bottom-20 animate-float" style={{ animationDelay: "2s" }}>
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-success flex items-center justify-center">
                    <Shield className="w-5 h-5 text-success-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Verified Stock</p>
                    <p className="text-xs text-muted-foreground">Real-time updates</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-card">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Why Choose <span className="text-gradient">UMUTI</span>?
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              We connect you with verified pharmacies across Rwanda, making it easy to find the medicine you need.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="group hover:border-primary/50 transition-all duration-300">
                <CardContent className="p-6 space-y-4">
                  <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center group-hover:shadow-glow transition-all duration-300">
                    <feature.icon className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
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
                    Are You a Pharmacy Owner?
                  </h2>
                  <p className="text-primary-foreground/80">
                    Join UMUTI to increase your visibility and reach more customers. Manage your inventory easily and grow your business.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 md:justify-end">
                  <Button variant="secondary" size="lg" asChild>
                    <Link to="/register">Register Your Pharmacy</Link>
                  </Button>
                  <Button variant="outline" size="lg" className="bg-background text-foreground border-border hover:bg-secondary" asChild>
                    <Link to="/login">Login to Dashboard</Link>
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
