import { useState, useEffect } from "react";
import AdminSidebar from "../../components/AdminSidebar";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Card, CardContent } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Search, Building2, MapPin, Phone, MoreVertical, Eye, Trash2, RefreshCw, Loader2, Mail, Clock } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../../components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../components/ui/dialog";
import { useToast } from "../../hooks/use-toast";
import { adminApi } from "../../lib/api";
import type { Pharmacy, User } from "../../lib/api";

interface PharmacyWithOwner extends Pharmacy {
  owner?: User;
  _count?: {
    medicines: number;
  };
}

const AdminPharmacies = () => {
  const [pharmacies, setPharmacies] = useState<PharmacyWithOwner[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPharmacy, setSelectedPharmacy] = useState<PharmacyWithOwner | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const { toast } = useToast();

  const fetchPharmacies = async () => {
    try {
      setIsLoading(true);
      const response = await adminApi.getPharmacies(true); // Get verified pharmacies
      if (response.data?.pharmacies) {
        setPharmacies(response.data.pharmacies as PharmacyWithOwner[]);
      }
    } catch (err) {
      const error = err as Error;
      toast({
        title: "Error",
        description: error.message || "Failed to fetch pharmacies",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPharmacies();
  }, []);

  const filteredPharmacies = pharmacies.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.owner?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleToggleVerification = async (pharmacy: PharmacyWithOwner) => {
    try {
      await adminApi.togglePharmacyVerification(pharmacy.id);
      toast({
        title: pharmacy.isVerified ? "Pharmacy suspended" : "Pharmacy verified",
        description: `${pharmacy.name} has been ${pharmacy.isVerified ? "suspended" : "verified"}.`
      });
      fetchPharmacies();
    } catch (err) {
      const error = err as Error;
      toast({
        title: "Error",
        description: error.message || "Failed to update pharmacy status",
        variant: "destructive",
      });
    }
  };

  const viewPharmacy = (pharmacy: PharmacyWithOwner) => {
    setSelectedPharmacy(pharmacy);
    setIsViewOpen(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <AdminSidebar>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Approved Pharmacies</h1>
            <p className="text-muted-foreground mt-1">Manage all registered pharmacies on the platform</p>
          </div>
          <Button variant="outline" size="sm" onClick={fetchPharmacies} disabled={isLoading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
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
              Verified: {pharmacies.filter(p => p.isVerified).length}
            </Badge>
          </div>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <Card>
            <CardContent className="py-12 flex flex-col items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
              <p className="text-muted-foreground">Loading pharmacies...</p>
            </CardContent>
          </Card>
        ) : pharmacies.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Building2 className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No approved pharmacies yet</p>
              <p className="text-sm text-muted-foreground mt-1">Pharmacies will appear here after being approved</p>
            </CardContent>
          </Card>
        ) : (
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
                              <p className="text-sm text-muted-foreground">{pharmacy.owner?.name || "Owner"}</p>
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
                          <span className="font-medium">{pharmacy._count?.medicines || 0}</span>
                          <span className="text-muted-foreground"> items</span>
                        </td>
                        <td className="py-4 px-6">
                          <Badge className={pharmacy.isVerified ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"}>
                            {pharmacy.isVerified ? "Active" : "Suspended"}
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
                              <DropdownMenuItem onClick={() => viewPharmacy(pharmacy)}>
                                <Eye className="w-4 h-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleToggleVerification(pharmacy)}>
                                {pharmacy.isVerified ? "Suspend" : "Activate"}
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
        )}

        {!isLoading && filteredPharmacies.length === 0 && pharmacies.length > 0 && (
          <div className="text-center py-12">
            <Building2 className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No pharmacies match your search</p>
          </div>
        )}

        {/* View Pharmacy Dialog */}
        <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Pharmacy Details</DialogTitle>
            </DialogHeader>
            {selectedPharmacy && (
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl gradient-primary flex items-center justify-center">
                    <Building2 className="w-8 h-8 text-primary-foreground" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">{selectedPharmacy.name}</h3>
                    <Badge className={selectedPharmacy.isVerified ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"}>
                      {selectedPharmacy.isVerified ? "Verified" : "Suspended"}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-4">
                  {selectedPharmacy.owner && (
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-medium text-primary">
                          {selectedPharmacy.owner.name?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Owner</p>
                        <p className="font-medium">{selectedPharmacy.owner.name}</p>
                      </div>
                    </div>
                  )}

                  {selectedPharmacy.email && (
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary">
                      <Mail className="w-5 h-5 text-primary" />
                      <div>
                        <p className="text-xs text-muted-foreground">Email</p>
                        <p className="font-medium">{selectedPharmacy.email}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary">
                    <Phone className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-xs text-muted-foreground">Phone</p>
                      <p className="font-medium">{selectedPharmacy.phone}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary">
                    <MapPin className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-xs text-muted-foreground">Address</p>
                      <p className="font-medium">{selectedPharmacy.address}</p>
                    </div>
                  </div>

                  {selectedPharmacy.hours && (
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary">
                      <Clock className="w-5 h-5 text-primary" />
                      <div>
                        <p className="text-xs text-muted-foreground">Operating Hours</p>
                        <p className="font-medium">{selectedPharmacy.hours}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary">
                    <Building2 className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-xs text-muted-foreground">Medicines in Inventory</p>
                      <p className="font-medium">{selectedPharmacy._count?.medicines || 0} items</p>
                    </div>
                  </div>

                  <div className="text-sm text-muted-foreground">
                    Joined: {formatDate(selectedPharmacy.createdAt)}
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setIsViewOpen(false)}
                  >
                    Close
                  </Button>
                  <Button
                    variant={selectedPharmacy.isVerified ? "destructive" : "default"}
                    className="flex-1"
                    onClick={() => {
                      handleToggleVerification(selectedPharmacy);
                      setIsViewOpen(false);
                    }}
                  >
                    {selectedPharmacy.isVerified ? "Suspend Pharmacy" : "Activate Pharmacy"}
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminSidebar>
  );
};

export default AdminPharmacies;
