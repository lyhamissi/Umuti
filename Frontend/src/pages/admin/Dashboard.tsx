import AdminSidebar from "../../components/AdminSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Building2, FileText, Users, TrendingUp, ArrowUpRight, ArrowDownRight, Download } from "lucide-react";
import { Button } from "../../components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import { useExportData } from "../../hooks/useExportData";
import { toast } from "sonner";

const AdminDashboard = () => {
  const stats = [
    { icon: Building2, label: "Total Pharmacies", value: "524", change: "+12%", trend: "up" },
    { icon: FileText, label: "Pending Applications", value: "23", change: "+5", trend: "up" },
    { icon: Users, label: "Active Users", value: "12,450", change: "+18%", trend: "up" },
    { icon: TrendingUp, label: "Medicine Searches", value: "45,230", change: "+25%", trend: "up" },
  ];

  const recentTransactions = [
    { pharmacy: "PharmaCare Plus", type: "Medicine Added", count: 15, date: "2 hours ago" },
    { pharmacy: "HealthFirst Pharmacy", type: "Stock Updated", count: 42, date: "5 hours ago" },
    { pharmacy: "MediPlus Drugstore", type: "Medicine Added", count: 8, date: "1 day ago" },
    { pharmacy: "City Pharmacy", type: "Stock Updated", count: 100, date: "1 day ago" },
    { pharmacy: "Green Cross Pharmacy", type: "New Registration", count: 0, date: "2 days ago" },
  ];

  const recentApplications = [
    { name: "Kigali Central Pharmacy", owner: "Marie Claire", status: "Pending", date: "1 hour ago" },
    { name: "Hope Drugstore", owner: "Emmanuel Niyonzima", status: "Pending", date: "3 hours ago" },
    { name: "Sunrise Pharmacy", owner: "Ange Uwimana", status: "Pending", date: "1 day ago" },
  ];

  const { exportToCSV, exportToJSON } = useExportData();

  const handleExportCSV = () => {
    const allData = [
      ...recentTransactions.map(tx => ({
        type: 'Activity',
        name: tx.pharmacy,
        action: tx.type,
        count: tx.count,
        date: tx.date
      })),
      ...recentApplications.map(app => ({
        type: 'Application',
        name: app.name,
        action: app.owner,
        count: 0,
        date: app.date
      }))
    ];
    exportToCSV(allData, 'admin_dashboard');
    toast.success('Dashboard data exported as CSV');
  };

  const handleExportJSON = () => {
    const exportData = {
      stats,
      recentTransactions,
      recentApplications,
      exportedAt: new Date().toISOString()
    };
    exportToJSON(exportData, 'admin_dashboard');
    toast.success('Dashboard data exported as JSON');
  };

  return (
    <AdminSidebar>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground mt-1">Overview of UMUTI platform</p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="border-green-600 text-green-600 hover:bg-green-50 hover:text-green-700"
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
          {stats.map((stat, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="text-2xl font-bold mt-1">{stat.value}</p>
                    <div className={`flex items-center gap-1 text-xs mt-1 ${stat.trend === "up" ? "text-success" : "text-destructive"}`}>
                      {stat.trend === "up" ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                      {stat.change}
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-secondary text-primary">
                    <stat.icon className="w-5 h-5" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Recent Transactions */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentTransactions.map((tx, index) => (
                  <div key={index} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                    <div>
                      <p className="font-medium">{tx.pharmacy}</p>
                      <p className="text-sm text-muted-foreground">{tx.type}</p>
                    </div>
                    <div className="text-right">
                      {tx.count > 0 && <p className="text-sm font-medium text-primary">+{tx.count} items</p>}
                      <p className="text-xs text-muted-foreground">{tx.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Applications */}
          <Card>
            <CardHeader>
              <CardTitle>Pending Applications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentApplications.map((app, index) => (
                  <div key={index} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                    <div>
                      <p className="font-medium">{app.name}</p>
                      <p className="text-sm text-muted-foreground">Owner: {app.owner}</p>
                    </div>
                    <div className="text-right">
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-warning/10 text-warning">
                        {app.status}
                      </span>
                      <p className="text-xs text-muted-foreground mt-1">{app.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminSidebar>
  );
};

export default AdminDashboard;
