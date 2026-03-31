import { useState, useEffect, useMemo } from "react";
import AdminSidebar from "../../components/AdminSidebar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card";
import { 
  Building2, 
  FileText, 
  Users, 
  TrendingUp, 
  ArrowUpRight, 
  Download, 
  Loader2, 
  Search, 
  RefreshCw, 
  Pill,
  Activity,
  CheckCircle2,
  Clock,
  ArrowRight
} from "lucide-react";
import { Button } from "../../components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "../../components/ui/chart";
import { 
  Area, 
  AreaChart, 
  CartesianGrid, 
  XAxis, 
  YAxis
} from "recharts";
import { Badge } from "../../components/ui/badge";
import { Avatar, AvatarFallback } from "../../components/ui/avatar";
import { useExportData } from "../../hooks/useExportData";
import { toast } from "sonner";
import { adminApi } from "../../lib/api";
import type { PharmacyApplication } from "../../lib/api";
import { useNavigate } from "react-router-dom";

const AdminDashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [growth, setGrowth] = useState<any>(null);
  const [recentSearches, setRecentSearches] = useState<any[]>([]);
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

  const { exportToCSV } = useExportData();

  const chartData = useMemo(() => {
    if (!growth) return [];
    // Generate some mock historical data based on growth for the chart
    const dailySearches = Math.floor(growth.searchesThisMonth / 7);
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    return days.map((day) => ({
      day,
      searches: Math.floor(dailySearches * (0.8 + Math.random() * 0.4)),
      users: Math.floor((growth.newUsersThisMonth / 7) * (0.5 + Math.random() * 1)),
    }));
  }, [growth]);

  const handleExportCSV = () => {
    if (!stats) return;
    const exportData = [
      { metric: "Total Pharmacies", value: stats.totalPharmacies },
      { metric: "Verified Pharmacies", value: stats.verifiedPharmacies },
      { metric: "Pending Applications", value: stats.pendingApplications },
      { metric: "Total Users", value: stats.totalUsers },
      { metric: "Total Medicines", value: stats.totalMedicines },
      { metric: "Total Searches", value: stats.totalSearches },
    ];
    exportToCSV(exportData, 'admin_dashboard');
    toast.success('Dashboard data exported');
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const formatTimeAgo = (dateString: string): string => {
    const date = new Date(dateString);
    const diffMs = new Date().getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${Math.floor(diffHours / 24)}d ago`;
  };

  const statCards = stats ? [
    {
      icon: Building2,
      label: "Pharmacies",
      value: formatNumber(stats.totalPharmacies),
      change: `${stats.verifiedPharmacies} verified`,
      trend: growth?.newPharmaciesThisMonth ? `+${growth.newPharmaciesThisMonth} this month` : null,
      color: "text-blue-500",
      bg: "bg-blue-500/10"
    },
    {
      icon: FileText,
      label: "Pending Apps",
      value: stats.pendingApplications.toString(),
      change: stats.pendingApplications > 0 ? "Needs Review" : "All Clear",
      color: stats.pendingApplications > 0 ? "text-amber-500" : "text-emerald-500",
      bg: stats.pendingApplications > 0 ? "bg-amber-500/10" : "bg-emerald-500/10"
    },
    {
      icon: Users,
      label: "Total Users",
      value: formatNumber(stats.totalUsers),
      trend: growth?.newUsersThisMonth ? `+${growth.newUsersThisMonth} this month` : null,
      color: "text-indigo-500",
      bg: "bg-indigo-500/10"
    },
    {
      icon: TrendingUp,
      label: "Searches",
      value: formatNumber(stats.totalSearches),
      trend: growth?.searchesThisMonth ? `+${formatNumber(growth.searchesThisMonth)} this month` : null,
      color: "text-primary",
      bg: "bg-primary/10"
    },
  ] : [];

  if (isLoading) {
    return (
      <AdminSidebar>
        <div className="flex flex-col items-center justify-center h-[60vh]">
          <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground animate-pulse text-lg">Loading admin dashboard...</p>
        </div>
      </AdminSidebar>
    );
  }

  return (
    <AdminSidebar>
      <div className="max-w-7xl mx-auto space-y-10 pb-10">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 animate-fade-in">
          <div className="space-y-4">
             <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium border border-primary/20">
               <Activity className="w-3 h-3" />
               Platform Control Center
             </div>
             <h1 className="text-4xl font-extrabold tracking-tight">Admin Overview</h1>
             <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed">
               Welcome back, Administrator. Monitor platform growth, manage pharmacy applications, and oversee UMUTI network performance.
             </p>
          </div>

          <div className="flex items-center gap-3">
             <Button variant="outline" className="rounded-full px-6 border-border/50 hover:bg-secondary/50 backdrop-blur-sm" onClick={fetchDashboardData}>
               <RefreshCw className="w-4 h-4 mr-2" />
               Sync Data
             </Button>
             <DropdownMenu>
               <DropdownMenuTrigger asChild>
                 <Button variant="outline" className="rounded-full px-6 border-border/50 hover:bg-secondary/50 backdrop-blur-sm">
                   <Download className="w-4 h-4 mr-2" />
                   Export
                 </Button>
               </DropdownMenuTrigger>
               <DropdownMenuContent align="end" className="w-48 glass">
                 <DropdownMenuItem onClick={handleExportCSV} className="cursor-pointer">Download Reports</DropdownMenuItem>
                 <DropdownMenuItem onClick={() => toast.info("Full audit log coming soon")} className="cursor-pointer">Audit Logs</DropdownMenuItem>
               </DropdownMenuContent>
             </DropdownMenu>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-slide-up">
          {statCards.map((stat, index) => (
            <Card key={index} className="glass-card card-hover border-none overflow-hidden group">
              <div className={`absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 rounded-full blur-2xl opacity-20 transition-all duration-500 group-hover:scale-150 ${stat.bg}`} />
              <CardContent className="p-8 relative">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest">{stat.label}</p>
                    <h3 className="text-3xl font-bold tracking-tight">{stat.value}</h3>
                    <div className="flex items-center gap-2 pt-1">
                      {stat.trend && (
                        <span className="text-xs font-bold text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
                          <ArrowUpRight className="w-3 h-3" />
                          {stat.trend}
                        </span>
                      )}
                      {stat.change && <span className="text-xs text-muted-foreground font-medium">{stat.change}</span>}
                    </div>
                  </div>
                  <div className={`p-4 rounded-2xl ${stat.bg} ${stat.color} transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6`}>
                    <stat.icon className="w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Chart Section */}
        <div className="grid lg:grid-cols-3 gap-8">
           <Card className="lg:col-span-2 glass-card border-none overflow-hidden animate-slide-up">
             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-7">
               <div>
                 <CardTitle className="text-xl font-bold flex items-center gap-2">
                   <Activity className="w-5 h-5 text-primary" />
                   Platform Activity Trend
                 </CardTitle>
                 <CardDescription>Search and user growth over the last 7 days</CardDescription>
               </div>
               <div className="flex items-center gap-4 text-xs font-medium">
                  <div className="flex items-center gap-1.5">
                     <div className="w-3 h-3 rounded-full bg-primary" />
                     <span>Searches</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                     <div className="w-3 h-3 rounded-full bg-indigo-500" />
                     <span>New Users</span>
                  </div>
               </div>
             </CardHeader>
             <CardContent className="px-2">
               <div className="h-[300px] w-full">
                 <ChartContainer config={{
                    searches: { label: "Searches", color: "hsl(var(--primary))" },
                    users: { label: "Users", color: "hsl(243 75% 59%)" },
                 }}>
                   <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                     <defs>
                       <linearGradient id="colorSearches" x1="0" y1="0" x2="0" y2="1">
                         <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                         <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                       </linearGradient>
                       <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                         <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                         <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                       </linearGradient>
                     </defs>
                     <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.5} />
                     <XAxis 
                        dataKey="day" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 12}}
                        dy={10}
                     />
                     <YAxis hide />
                     <ChartTooltip content={<ChartTooltipContent />} />
                     <Area 
                        type="monotone" 
                        dataKey="searches" 
                        stroke="hsl(var(--primary))" 
                        strokeWidth={3}
                        fillOpacity={1} 
                        fill="url(#colorSearches)" 
                     />
                     <Area 
                        type="monotone" 
                        dataKey="users" 
                        stroke="#6366f1" 
                        strokeWidth={3}
                        fillOpacity={1} 
                        fill="url(#colorUsers)" 
                     />
                   </AreaChart>
                 </ChartContainer>
               </div>
             </CardContent>
           </Card>

           {/* Metrics Column */}
           <div className="space-y-6">
              <h2 className="text-xl font-bold flex items-center gap-2 px-1">
                 <Activity className="w-5 h-5 text-primary" />
                 Database Vitals
              </h2>
              <div className="grid gap-4">
                 <Card className="glass-card card-hover border-none p-6">
                    <div className="flex items-center gap-4">
                       <div className="p-3 rounded-xl bg-primary/10 text-primary">
                          <Pill className="w-6 h-6" />
                       </div>
                       <div>
                          <p className="text-sm text-muted-foreground font-medium">Global Medicine Index</p>
                          <p className="text-2xl font-bold">{formatNumber(stats?.totalMedicines || 0)}</p>
                       </div>
                    </div>
                 </Card>
                 <Card className="glass-card card-hover border-none p-6">
                    <div className="flex items-center gap-4">
                       <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-500">
                          <CheckCircle2 className="w-6 h-6" />
                       </div>
                       <div>
                          <p className="text-sm text-muted-foreground font-medium">Verification Rate</p>
                          <p className="text-2xl font-bold">
                             {stats?.totalPharmacies > 0 ? Math.round((stats.verifiedPharmacies / stats.totalPharmacies) * 100) : 0}%
                          </p>
                       </div>
                    </div>
                 </Card>
                 <div className="p-8 rounded-3xl bg-gradient-to-br from-indigo-500/10 to-primary/10 border border-primary/10 text-center space-y-4">
                    <div className="w-16 h-16 bg-white dark:bg-card rounded-2xl flex items-center justify-center mx-auto shadow-xl animate-float">
                       <TrendingUp className="w-8 h-8 text-primary" />
                    </div>
                    <h4 className="text-xl font-bold">Network Growth</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                       You've added <span className="font-bold text-foreground">{growth?.newPharmaciesThisMonth || 0}</span> new pharmacies this month.
                    </p>
                    <Button variant="link" className="text-primary font-bold group px-0" onClick={() => navigate("/admin/pharmacies")}>
                       View Network Map
                       <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                    </Button>
                 </div>
              </div>
           </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Recent Searches */}
          <Card className="glass-card border-none overflow-hidden animate-slide-up">
            <CardHeader className="border-b border-border/40 bg-muted/20">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl font-bold flex items-center gap-2">
                    <Search className="w-5 h-5 text-primary" />
                    Live Search Feed
                  </CardTitle>
                </div>
                <Badge variant="outline" className="rounded-full bg-primary/10 text-primary border-none">Last 24 Hours</Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {recentSearches.length === 0 ? (
                <div className="text-center py-20 text-muted-foreground">No recent platform activity</div>
              ) : (
                <div className="divide-y divide-border/40">
                  {recentSearches.map((search) => (
                    <div key={search.id} className="flex items-center justify-between p-5 hover:bg-muted/30 transition-colors">
                      <div className="flex items-center gap-4">
                        <Avatar className="h-10 w-10 border border-border/50">
                           <AvatarFallback className="bg-secondary text-primary font-bold">
                             {search.query.charAt(0).toUpperCase()}
                           </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-bold">"{search.query}"</p>
                          {search.location && (
                            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                               <Clock className="w-3 h-3" /> {search.location}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant="secondary" className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider mb-1">
                           {search.resultsCount} results
                        </Badge>
                        <p className="text-[10px] text-muted-foreground font-medium">{formatTimeAgo(search.createdAt)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Pending Applications */}
          <Card className="glass-card border-none overflow-hidden animate-slide-up">
            <CardHeader className="border-b border-border/40 bg-muted/20">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-bold flex items-center gap-2">
                   <FileText className="w-5 h-5 text-amber-500" />
                   Pending Reviews
                </CardTitle>
                <Button variant="ghost" size="sm" className="text-primary font-bold hover:bg-primary/10 rounded-full" onClick={() => navigate("/admin/applications")}>
                  Review All
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {pendingApplications.length === 0 ? (
                <div className="text-center py-20 text-muted-foreground">All applications processed</div>
              ) : (
                <div className="divide-y divide-border/40">
                  {pendingApplications.map((app) => (
                    <div key={app.id} className="flex items-center justify-between p-5 hover:bg-muted/30 transition-colors">
                      <div className="flex items-center gap-4">
                         <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-600">
                            <Building2 className="w-5 h-5" />
                         </div>
                         <div>
                            <p className="font-bold">{app.pharmacyName}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">{app.ownerName}</p>
                         </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <Badge className="rounded-full bg-amber-500/10 text-amber-600 border-none px-3 py-1 font-bold text-[10px] uppercase">
                          Action Required
                        </Badge>
                        <p className="text-[10px] text-muted-foreground font-medium">{formatTimeAgo(app.submittedAt)}</p>
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
