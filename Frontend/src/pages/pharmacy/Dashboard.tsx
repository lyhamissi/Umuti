import PharmacySidebar from "../../components/PharmacySidebar";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Package, TrendingUp, AlertTriangle, DollarSign } from "lucide-react";

const PharmacyDashboard = () => {
  const stats = [
    { icon: Package, label: "Total Medicines", value: "156", change: "+12 this month", color: "text-primary" },
    { icon: TrendingUp, label: "In Stock", value: "142", change: "91% availability", color: "text-success" },
    { icon: AlertTriangle, label: "Low Stock", value: "14", change: "Needs attention", color: "text-warning" },
    { icon: DollarSign, label: "Total Value", value: "2.4M RWF", change: "Inventory worth", color: "text-primary" },
  ];

  const recentMedicines = [
    { name: "Paracetamol 500mg", stock: 500, status: "In Stock" },
    { name: "Amoxicillin 250mg", stock: 200, status: "In Stock" },
    { name: "Ibuprofen 400mg", stock: 15, status: "Low Stock" },
    { name: "Vitamin C 1000mg", stock: 350, status: "In Stock" },
    { name: "Metformin 500mg", stock: 8, status: "Low Stock" },
  ];

  return (
    <PharmacySidebar>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Pharmacy Dashboard</h1>
          <p className="text-muted-foreground mt-1">Welcome back! Here's your pharmacy overview.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
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
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Medicine</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Stock</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentMedicines.map((medicine, index) => (
                    <tr key={index} className="border-b border-border last:border-0">
                      <td className="py-3 px-4 font-medium">{medicine.name}</td>
                      <td className="py-3 px-4 text-muted-foreground">{medicine.stock} units</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          medicine.status === "In Stock" 
                            ? "bg-success/10 text-success" 
                            : "bg-warning/10 text-warning"
                        }`}>
                          {medicine.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </PharmacySidebar>
  );
};

export default PharmacyDashboard;
