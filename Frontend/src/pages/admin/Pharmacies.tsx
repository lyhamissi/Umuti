import { useState } from "react";
import AdminSidebar from "../../components/AdminSidebar";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Search, Building2, MapPin, Phone, MoreVertical, Eye, Trash2 } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../../components/ui/dropdown-menu";
import { useToast } from "../../hooks/use-toast";

interface Pharmacy {
  id: string;
  name: string;
  owner: string;
  email: string;
  phone: string;
  address: string;
  medicines: number;
  status: "active" | "suspended";
  joinedAt: string;
}

const initialPharmacies: Pharmacy[] = [
  { id: "1", name: "PharmaCare Plus", owner: "Jean Pierre Habimana", email: "contact@pharmacare.rw", phone: "+250 788 123 456", address: "KG 7 Ave, Kigali", medicines: 156, status: "active", joinedAt: "2024-06-15" },
  { id: "2", name: "HealthFirst Pharmacy", owner: "Alice Mukamana", email: "info@healthfirst.rw", phone: "+250 788 234 567", address: "KN 3 St, Nyarugenge", medicines: 203, status: "active", joinedAt: "2024-07-20" },
  { id: "3", name: "MediPlus Drugstore", owner: "Patrick Nkurunziza", email: "mediplus@mail.rw", phone: "+250 788 345 678", address: "KK 15 Ave, Kicukiro", medicines: 89, status: "active", joinedAt: "2024-08-10" },
  { id: "4", name: "City Pharmacy", owner: "Grace Ingabire", email: "city@pharmacy.rw", phone: "+250 788 456 789", address: "KG 11 Ave, Gasabo", medicines: 45, status: "suspended", joinedAt: "2024-09-05" },
];

const AdminPharmacies = () => {
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>(initialPharmacies);
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  const filteredPharmacies = pharmacies.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.owner.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleStatus = (id: string) => {
    setPharmacies(pharmacies.map(p => 
      p.id === id ? { ...p, status: p.status === "active" ? "suspended" as const : "active" as const } : p
    ));
    toast({ title: "Pharmacy status updated" });
  };

  const deletePharmacy = (id: string) => {
    setPharmacies(pharmacies.filter(p => p.id !== id));
    toast({ title: "Pharmacy removed" });
  };

  return (
    <AdminSidebar>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Approved Pharmacies</h1>
          <p className="text-muted-foreground mt-1">Manage all registered pharmacies on the platform</p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input 
              placeholder="Search pharmacies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Badge variant="outline" className="py-2 px-4">
              Total: {pharmacies.length}
            </Badge>
            <Badge className="bg-success/10 text-success py-2 px-4">
              Active: {pharmacies.filter(p => p.status === "active").length}
            </Badge>
          </div>
        </div>

        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">Pharmacy</th>
                    <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground hidden md:table-cell">Contact</th>
                    <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground hidden lg:table-cell">Medicines</th>
                    <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">Status</th>
                    <th className="text-right py-4 px-6 text-sm font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPharmacies.map((pharmacy) => (
                    <tr key={pharmacy.id} className="border-b border-border last:border-0 hover:bg-secondary/30">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                            <Building2 className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{pharmacy.name}</p>
                            <p className="text-sm text-muted-foreground">{pharmacy.owner}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6 hidden md:table-cell">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm">
                            <Phone className="w-3 h-3 text-muted-foreground" />
                            {pharmacy.phone}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <MapPin className="w-3 h-3" />
                            {pharmacy.address}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6 hidden lg:table-cell">
                        <span className="font-medium">{pharmacy.medicines}</span>
                        <span className="text-muted-foreground"> items</span>
                      </td>
                      <td className="py-4 px-6">
                        <Badge className={pharmacy.status === "active" ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"}>
                          {pharmacy.status === "active" ? "Active" : "Suspended"}
                        </Badge>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => toggleStatus(pharmacy.id)}>
                              {pharmacy.status === "active" ? "Suspend" : "Activate"}
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive" onClick={() => deletePharmacy(pharmacy.id)}>
                              <Trash2 className="w-4 h-4 mr-2" />
                              Remove
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {filteredPharmacies.length === 0 && (
          <div className="text-center py-12">
            <Building2 className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No pharmacies found</p>
          </div>
        )}
      </div>
    </AdminSidebar>
  );
};

export default AdminPharmacies;
