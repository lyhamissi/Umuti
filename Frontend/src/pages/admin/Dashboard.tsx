import { useState, useEffect } from "react";
import AdminSidebar from "../../components/AdminSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Building2, FileText, Users, TrendingUp, ArrowUpRight, Download, Loader2, Search, RefreshCw, Pill } from "lucide-react";
import { Button } from "../../components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import { useExportData } from "../../hooks/useExportData";
import { toast } from "sonner";
import { adminApi } from "../../lib/api";
import type { PharmacyApplication } from "../../lib/api";
import { useNavigate } from "react-router-dom";

interface DashboardStats {
  totalPharmacies: number;
  verifiedPharmacies: number;
  pendingApplications: number;
  totalUsers: number;
  totalMedicines: number;
  totalSearches: number;
}

interface GrowthStats {
  newPharmaciesThisMonth: number;
  newUsersThisMonth: number;
  searchesThisMonth: number;
}

interface RecentSearch {
  id: string;
  query: string;
  location: string | null;
  resultsCount: number;
  createdAt: string;
}

const AdminDashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [growth, setGrowth] = useState<GrowthStats | null>(null);
  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>([]);
  const [pendingApplications, setPendingApplications] = useState<PharmacyApplication[]>([]);
  const navigate = useNavigate();

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      const [dashboardData, applicationsData] = await Promise.all([
        adminApi.getDashboard(),
        adminApi.getApplications("PENDING"),
      ]);

      setStats(dashboardData.stats);
      setGrowth(dashboardData.growth);
      setRecentSearches(dashboardData.recentSearches || []);
      setPendingApplications(applicationsData.applications.slice(0, 5));
    } catch (err) {
      const error = err as Error;
      toast.error(error.message || "Failed to fetch dashboard data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const { exportToCSV, exportToJSON } = useExportData();

  const handleExportCSV = () => {
    if (!stats) return;
    const exportData = [
      { metric: "Total Pharmacies", value: stats.totalPharmacies },
      { metric: "Verified Pharmacies", value: stats.verifiedPharmacies },
      { metric: "Pending Applications", value: stats.pendingApplications },
      { metric: "Total Users", value: stats.totalUsers },
      { metric: "Total Medicines", value: stats.totalMedicines },
      { metric: "Total Searches", value: stats.totalSearches },
      { metric: "New Pharmacies This Month", value: growth?.newPharmaciesThisMonth || 0 },
      { metric: "New Users This Month", value: growth?.newUsersThisMonth || 0 },
      { metric: "Searches This Month", value: growth?.searchesThisMonth || 0 },
    ];
    exportToCSV(exportData, 'admin_dashboard');
    toast.success('Dashboard data exported as CSV');
  };

  const handleExportJSON = () => {
    if (!stats) return;
    const exportData = {
      stats,
      growth,
      recentSearches,
      pendingApplications: pendingApplications.map(app => ({
        pharmacyName: app.pharmacyName,
        ownerName: app.ownerName,
        email: app.email,
        submittedAt: app.submittedAt,
      })),
      exportedAt: new Date().toISOString()
    };
    exportToJSON(exportData, 'admin_dashboard');
    toast.success('Dashboard data exported as JSON');
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const formatTimeAgo = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  };

  const statCards = stats ? [
    {
      icon: Building2,
      label: "Total Pharmacies",
      value: formatNumber(stats.totalPharmacies),
      subValue: `${stats.verifiedPharmacies} verified`,
      change: growth ? `+${growth.newPharmaciesThisMonth} this month` : undefined,
      trend: "up"
    },
    {
      icon: FileText,
      label: "Pending Applications",
      value: stats.pendingApplications.toString(),
      change: stats.pendingApplications > 0 ? "Needs review" : "All processed",
      trend: stats.pendingApplications > 0 ? "warning" : "up"
    },
    {
      icon: Users,
      label: "Total Users",
      value: formatNumber(stats.totalUsers),
      change: growth ? `+${growth.newUsersThisMonth} this month` : undefined,
      trend: "up"
    },
    {
      icon: TrendingUp,
      label: "Medicine Searches",
      value: formatNumber(stats.totalSearches),
      change: growth ? `+${formatNumber(growth.searchesThisMonth)} this month` : undefined,
      trend: "up"
    },
  ] : [];

  if (isLoading) {
    return (
      <AdminSidebar>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading dashboard...</p>
          </div>
        </div>
      </AdminSidebar>
    );
  }

  return (
    <AdminSidebar>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground mt-1">Overview of UMUTI platform</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={fetchDashboardData}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
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
        </div>

        {/* Stats Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((stat, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="text-2xl font-bold mt-1">{stat.value}</p>
                    {stat.subValue && (
                      <p className="text-xs text-muted-foreground">{stat.subValue}</p>
                    )}
                    {stat.change && (
                      <div className={`flex items-center gap-1 text-xs mt-1 ${
                        stat.trend === "up" ? "text-success" :
                        stat.trend === "warning" ? "text-warning" : "text-destructive"
                      }`}>
                        <ArrowUpRight className="w-3 h-3" />
                        {stat.change}
                      </div>
                    )}
                  </div>
                  <div className="p-3 rounded-xl bg-secondary text-primary">
                    <stat.icon className="w-5 h-5" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Additional Stats */}
        {stats && (
          <div className="grid sm:grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-primary/10">
                    <Pill className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Medicines in Database</p>
                    <p className="text-2xl font-bold">{formatNumber(stats.totalMedicines)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-success/10">
                    <Building2 className="w-6 h-6 text-success" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Verification Rate</p>
                    <p className="text-2xl font-bold">
                      {stats.totalPharmacies > 0
                        ? Math.round((stats.verifiedPharmacies / stats.totalPharmacies) * 100)
                        : 0}%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Recent Searches */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="w-5 h-5" />
                Recent Searches
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recentSearches.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No recent searches</p>
              ) : (
                <div className="space-y-4">
                  {recentSearches.map((search) => (
                    <div key={search.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                      <div>
                        <p className="font-medium">"{search.query}"</p>
                        {search.location && (
                          <p className="text-sm text-muted-foreground">{search.location}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-primary">{search.resultsCount} results</p>
                        <p className="text-xs text-muted-foreground">{formatTimeAgo(search.createdAt)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Pending Applications */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Pending Applications</CardTitle>
              {pendingApplications.length > 0 && (
                <Button variant="ghost" size="sm" onClick={() => navigate("/admin/applications")}>
                  View All
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {pendingApplications.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No pending applications</p>
              ) : (
                <div className="space-y-4">
                  {pendingApplications.map((app) => (
                    <div key={app.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                      <div>
                        <p className="font-medium">{app.pharmacyName}</p>
                        <p className="text-sm text-muted-foreground">Owner: {app.ownerName}</p>
                      </div>
                      <div className="text-right">
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-warning/10 text-warning">
                          Pending
                        </span>
                        <p className="text-xs text-muted-foreground mt-1">{formatTimeAgo(app.submittedAt)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminSidebar>
  );
};

export default AdminDashboard;
