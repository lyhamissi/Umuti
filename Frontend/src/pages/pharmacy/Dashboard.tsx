import { useState, useEffect } from "react";
import PharmacySidebar from "../../components/PharmacySidebar";
import { Card, CardContent } from "../../components/ui/card";
import { 
  Package, 
  TrendingUp, 
  AlertTriangle, 
  DollarSign, 
  Download, 
  Loader2, 
  Plus, 
  ArrowRight,
  ClipboardList,
  Activity
} from "lucide-react";
import { Button } from "../../components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { Badge } from "../../components/ui/badge";
import { useExportData } from "../../hooks/useExportData";
import { toast } from "sonner";
import { medicineApi, pharmacyApi, type PharmacyMedicine, type Pharmacy } from "../../lib/api";
import { useNavigate } from "react-router-dom";

const PharmacyDashboard = () => {
  const [pharmacy, setPharmacy] = useState<Pharmacy | null>(null);
  const [inventory, setInventory] = useState<PharmacyMedicine[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const { exportToCSV, exportToJSON } = useExportData();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        const [pharmacyResponse, inventoryResponse] = await Promise.all([
          pharmacyApi.getMine(),
          medicineApi.getMyInventory()
        ]);

        if (pharmacyResponse.data) {
          setPharmacy(pharmacyResponse.data);
        }

        if (inventoryResponse.data) {
          setInventory(inventoryResponse.data);
          if (inventoryResponse.stats) {
            setStats(inventoryResponse.stats);
          }
        }
      } catch (err) {
        toast.error((err as Error).message || "Failed to load dashboard data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const statsDisplay = [
    { 
      icon: Package, 
      label: "Total Medicines", 
      value: stats?.total?.toString() || "0", 
      change: "Inventory count", 
      color: "text-blue-500",
      bg: "bg-blue-500/10"
    },
    { 
      icon: TrendingUp, 
      label: "In Stock", 
      value: stats?.inStock?.toString() || "0", 
      change: `${stats?.total > 0 ? Math.round((stats.inStock / stats.total) * 100) : 0}% availability`, 
      color: "text-emerald-500",
      bg: "bg-emerald-500/10"
    },
    { 
      icon: AlertTriangle, 
      label: "Low Stock", 
      value: stats?.lowStock?.toString() || "0", 
      change: "Items to restock", 
      color: "text-amber-500",
      bg: "bg-amber-500/10"
    },
    { 
      icon: DollarSign, 
      label: "Total Value", 
      value: stats?.totalValue ? `${(stats.totalValue / 1000).toFixed(1)}K RWF` : "0 RWF", 
      change: "Estimated worth", 
      color: "text-indigo-500",
      bg: "bg-indigo-500/10"
    },
  ];

  const handleExportCSV = () => {
    const exportData = inventory.map(item => ({
      name: item.medicine?.name || "Unknown",
      stock: item.quantity,
      price: item.price,
      status: item.quantity === 0 ? "Out of Stock" : item.quantity <= 20 ? "Low Stock" : "In Stock"
    }));
    exportToCSV(exportData, 'pharmacy_medicines');
    toast.success('Dashboard data exported as CSV');
  };

  const handleExportJSON = () => {
    const exportData = {
      pharmacy: pharmacy ? {
        name: pharmacy.name,
        address: pharmacy.address,
        phone: pharmacy.phone,
      } : null,
      stats,
      medicines: inventory.map(item => ({
        name: item.medicine?.name,
        quantity: item.quantity,
        price: item.price,
        inStock: item.inStock,
      })),
      exportedAt: new Date().toISOString()
    };
    exportToJSON(exportData, 'pharmacy_dashboard');
    toast.success('Dashboard data exported as JSON');
  };

  if (isLoading) {
    return (
      <PharmacySidebar>
        <div className="flex flex-col items-center justify-center h-[60vh]">
          <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground animate-pulse text-lg">Preparing your workspace...</p>
        </div>
      </PharmacySidebar>
    );
  }

  return (
    <PharmacySidebar>
      <div className="max-w-7xl mx-auto space-y-10 pb-10">
        
        {/* Quick Actions / Desktop Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 animate-fade-in">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium border border-primary/20">
              <Activity className="w-3 h-3" />
              Live Dashboard Overview
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
              {pharmacy?.name || "Pharmacy Dashboard"}
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed">
              Welcome back! Monitor your inventory levels, track medicine availability, and manage your pharmacy operations efficiently.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="rounded-full px-6 border-border/50 hover:bg-secondary/50 backdrop-blur-sm transition-all shadow-sm"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export Insights
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 glass animate-slide-up">
                <DropdownMenuItem onClick={handleExportCSV} className="cursor-pointer">
                  Download CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleExportJSON} className="cursor-pointer">
                  Download JSON
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button 
              className="rounded-full px-6 shadow-glow transition-all hover:scale-105 active:scale-95"
              onClick={() => navigate("/pharmacy/medicines")}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Medicine
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-slide-up">
          {statsDisplay.map((stat, index) => (
            <Card key={index} className="glass-card card-hover border-none overflow-hidden group">
              <div className={`absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 rounded-full blur-2xl opacity-20 transition-all duration-500 group-hover:scale-150 ${stat.bg}`} />
              <CardContent className="p-8 relative">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest">{stat.label}</p>
                    <div className="flex items-baseline gap-2">
                       <h3 className="text-3xl font-bold tracking-tight">{stat.value}</h3>
                       {index === 3 && <span className="text-sm font-semibold text-muted-foreground">RWF</span>}
                    </div>
                    <p className="text-xs text-muted-foreground/80 font-medium pt-1 flex items-center gap-1">
                       <span className={stat.color}>{stat.change}</span>
                    </p>
                  </div>
                  <div className={`p-4 rounded-2xl ${stat.bg} ${stat.color} transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6`}>
                    <stat.icon className="w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Table Section */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
               <h2 className="text-2xl font-bold flex items-center gap-2">
                 <ClipboardList className="w-6 h-6 text-primary" />
                 Inventory Highlights
               </h2>
               <Button variant="link" className="text-primary group px-0" onClick={() => navigate("/pharmacy/medicines")}>
                  View All Inventory
                  <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
               </Button>
            </div>

            <Card className="glass-card border-none overflow-hidden">
              <CardContent className="p-0">
                {inventory.length === 0 ? (
                  <div className="text-center py-20 px-6">
                    <div className="w-20 h-20 bg-muted/20 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Package className="w-10 h-10 text-muted-foreground/40" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">No inventory data</h3>
                    <p className="text-muted-foreground max-w-xs mx-auto">
                      Start adding medicines to your pharmacy to see stock levels and performance metrics here.
                    </p>
                    <Button 
                      variant="outline" 
                      className="mt-8 rounded-full border-primary/30 text-primary hover:bg-primary/5"
                      onClick={() => navigate("/pharmacy/medicines")}
                    >
                      Go to Medicines Page
                    </Button>
                  </div>
                ) : (
                  <Table>
                    <TableHeader className="bg-muted/30">
                      <TableRow className="hover:bg-transparent border-border/50">
                        <TableHead className="py-4">Medicine Name</TableHead>
                        <TableHead>Current Stock</TableHead>
                        <TableHead>Unit Price</TableHead>
                        <TableHead className="text-right pr-6">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {inventory.slice(0, 5).map((item, index) => {
                        const status = item.quantity === 0 ? "out" : item.quantity <= 20 ? "low" : "in";
                        return (
                          <TableRow key={index} className="border-border/40 hover:bg-muted/20 transition-colors">
                            <TableCell className="py-5 font-semibold text-base">{item.medicine?.name || "Unnamed Medicine"}</TableCell>
                            <TableCell className="text-muted-foreground font-medium">{item.quantity} units</TableCell>
                            <TableCell className="text-muted-foreground">{item.price.toLocaleString()} RWF</TableCell>
                            <TableCell className="text-right pr-6">
                              <Badge 
                                variant="outline"
                                className={`rounded-full px-3 py-1 font-semibold border-none shadow-sm ${
                                  status === "in" 
                                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" 
                                    : status === "low"
                                    ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                                    : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                                }`}
                              >
                                {status === "in" ? "In Stock" : status === "low" ? "Low Stock" : "Out of Stock"}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick Shortcuts / Insights Sidebar */}
          <div className="space-y-6">
             <h2 className="text-2xl font-bold">Recommended Actions</h2>
             
             <div className="space-y-4">
                <Card className="glass-card card-hover border-none cursor-pointer group" onClick={() => navigate("/pharmacy/medicines")}>
                  <CardContent className="p-6 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                      <Plus className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold">Add New Medicine</h4>
                      <p className="text-xs text-muted-foreground">List new stock in your pharmacy</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="glass-card card-hover border-none cursor-pointer group" onClick={() => navigate("/pharmacy/profile")}>
                  <CardContent className="p-6 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 group-hover:scale-110 transition-transform">
                      <Activity className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold">Update Profile</h4>
                      <p className="text-xs text-muted-foreground">Keep your pharmacy info current</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="glass-card border-none bg-gradient-to-br from-primary/10 to-primary/5">
                   <CardContent className="p-8 text-center space-y-4">
                      <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto animate-float">
                        <TrendingUp className="w-8 h-8 text-primary" />
                      </div>
                      <h4 className="text-xl font-bold">Monthly Insights</h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        Your inventory value has grown by <span className="font-bold text-primary">12%</span> this month. Keep it up!
                      </p>
                      <Button variant="outline" className="w-full rounded-full border-primary/20 hover:bg-primary/10">
                        View Detailed Reports
                      </Button>
                   </CardContent>
                </Card>
             </div>
          </div>
        </div>

      </div>
    </PharmacySidebar>
  );
};

export default PharmacyDashboard;
