import { useState, useEffect } from "react";
import PharmacySidebar from "../../components/PharmacySidebar";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Package, TrendingUp, AlertTriangle, DollarSign, Download, Loader2 } from "lucide-react";
import { Button } from "../../components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import { useExportData } from "../../hooks/useExportData";
import { toast } from "sonner";
import { pharmacyApi, type PharmacyMedicine, type Pharmacy } from "../../lib/api";

interface DashboardStats {
  totalMedicines: number;
  inStock: number;
  lowStock: number;
  totalValue: number;
}

interface DisplayMedicine {
  name: string;
  stock: number;
  status: string;
  price: number;
}

const PharmacyDashboard = () => {
  const [pharmacy, setPharmacy] = useState<Pharmacy | null>(null);
  const [inventory, setInventory] = useState<PharmacyMedicine[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { exportToCSV, exportToJSON } = useExportData();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch pharmacy details
        const pharmacyResponse = await pharmacyApi.getMine();
        if (pharmacyResponse.data) {
          setPharmacy(pharmacyResponse.data);

          // Fetch inventory
          const inventoryResponse = await pharmacyApi.getInventory(pharmacyResponse.data.id);
          if (inventoryResponse.data?.inventory) {
            setInventory(inventoryResponse.data.inventory);
          }
        }
      } catch (err) {
        const error = err as Error;
        setError(error.message || "Failed to load dashboard data");
        toast.error(error.message || "Failed to load dashboard data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Calculate stats from inventory
  const calculateStats = (): DashboardStats => {
    const totalMedicines = inventory.length;
    const inStock = inventory.filter(item => item.inStock && item.quantity > 20).length;
    const lowStock = inventory.filter(item => item.quantity > 0 && item.quantity <= 20).length;
    const totalValue = inventory.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    return { totalMedicines, inStock, lowStock, totalValue };
  };

  const stats = calculateStats();

  const statsDisplay = [
    { icon: Package, label: "Total Medicines", value: stats.totalMedicines.toString(), change: "In your inventory", color: "text-primary" },
    { icon: TrendingUp, label: "In Stock", value: stats.inStock.toString(), change: `${stats.totalMedicines > 0 ? Math.round((stats.inStock / stats.totalMedicines) * 100) : 0}% availability`, color: "text-success" },
    { icon: AlertTriangle, label: "Low Stock", value: stats.lowStock.toString(), change: "Needs attention", color: "text-warning" },
    { icon: DollarSign, label: "Total Value", value: `${(stats.totalValue / 1000000).toFixed(1)}M RWF`, change: "Inventory worth", color: "text-primary" },
  ];

  const recentMedicines: DisplayMedicine[] = inventory.slice(0, 5).map(item => ({
    name: item.medicine?.name || "Unknown Medicine",
    stock: item.quantity,
    status: item.quantity === 0 ? "Out of Stock" : item.quantity <= 20 ? "Low Stock" : "In Stock",
    price: item.price,
  }));

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
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </PharmacySidebar>
    );
  }

  if (error && !pharmacy) {
    return (
      <PharmacySidebar>
        <div className="text-center py-16">
          <div className="w-24 h-24 rounded-full bg-destructive/10 mx-auto mb-6 flex items-center justify-center">
            <AlertTriangle className="w-12 h-12 text-destructive" />
          </div>
          <h2 className="text-2xl font-semibold mb-2">Unable to Load Dashboard</h2>
          <p className="text-muted-foreground max-w-md mx-auto mb-4">{error}</p>
          <p className="text-sm text-muted-foreground">
            Make sure the backend server is running and you have a registered pharmacy.
          </p>
        </div>
      </PharmacySidebar>
    );
  }

  return (
    <PharmacySidebar>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">
              {pharmacy?.name || "Pharmacy Dashboard"}
            </h1>
            <p className="text-muted-foreground mt-1">Welcome back! Here's your pharmacy overview.</p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="border-primary text-primary hover:bg-primary/10 hover:text-primary"
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent>
              <DropdownMenuItem onClick={handleExportCSV}>
                Export as CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleExportJSON}>
                Export as JSON
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

        </div>

        {/* Stats Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statsDisplay.map((stat, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="text-2xl font-bold mt-1">{stat.value}</p>
                    <p className="text-xs text-muted-foreground mt-1">{stat.change}</p>
                  </div>
                  <div className={`p-3 rounded-xl bg-secondary ${stat.color}`}>
                    <stat.icon className="w-5 h-5" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent Medicines */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Medicines</CardTitle>
          </CardHeader>
          <CardContent>
            {recentMedicines.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No medicines in inventory yet.</p>
                <p className="text-sm mt-2">Add medicines to your inventory to see them here.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Medicine</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Stock</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Price</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentMedicines.map((medicine, index) => (
                      <tr key={index} className="border-b border-border last:border-0">
                        <td className="py-3 px-4 font-medium">{medicine.name}</td>
                        <td className="py-3 px-4 text-muted-foreground">{medicine.stock} units</td>
                        <td className="py-3 px-4 text-muted-foreground">{medicine.price.toLocaleString()} RWF</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            medicine.status === "In Stock"
                              ? "bg-success/10 text-success"
                              : medicine.status === "Low Stock"
                              ? "bg-warning/10 text-warning"
                              : "bg-destructive/10 text-destructive"
                          }`}>
                            {medicine.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PharmacySidebar>
  );
};

export default PharmacyDashboard;
