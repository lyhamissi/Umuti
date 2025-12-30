import { useState } from "react";
import AdminSidebar from "../../components/AdminSidebar";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../components/ui/dialog";
import { Check, X, Eye, Building2, MapPin, Phone, Mail, User, FileText, ExternalLink } from "lucide-react";
import { useToast } from "../../hooks/use-toast";

interface Application {
  id: string;
  pharmacyName: string;
  ownerName: string;
  email: string;
  phone: string;
  address: string;
  status: "pending" | "approved" | "rejected";
  submittedAt: string;
  licenseDocument: {
    name: string;
    size: string;
    url: string;
  };
}

const initialApplications: Application[] = [
  {
    id: "1",
    pharmacyName: "Kigali Central Pharmacy",
    ownerName: "Marie Claire Uwimana",
    email: "marie@kigalipharmacy.rw",
    phone: "+250 788 111 222",
    address: "KN 5 Ave, Nyarugenge, Kigali",
    status: "pending",
    submittedAt: "2025-01-15",
    licenseDocument: {
      name: "pharmacy_license_2025.pdf",
      size: "1.2 MB",
      url: "#",
    },
  },
  {
    id: "2",
    pharmacyName: "Hope Drugstore",
    ownerName: "Emmanuel Niyonzima",
    email: "emmanuel@hopedrug.rw",
    phone: "+250 788 333 444",
    address: "KG 12 St, Gasabo, Kigali",
    status: "pending",
    submittedAt: "2025-01-14",
    licenseDocument: {
      name: "hope_drugstore_license.pdf",
      size: "856 KB",
      url: "#",
    },
  },
  {
    id: "3",
    pharmacyName: "Sunrise Pharmacy",
    ownerName: "Ange Uwimana",
    email: "ange@sunrise.rw",
    phone: "+250 788 555 666",
    address: "KK 8 Ave, Kicukiro, Kigali",
    status: "pending",
    submittedAt: "2025-01-13",
    licenseDocument: {
      name: "sunrise_pharmacy_cert.jpg",
      size: "2.4 MB",
      url: "#",
    },
  },
];

const AdminApplications = () => {
  const [applications, setApplications] = useState<Application[]>(initialApplications);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const { toast } = useToast();

  const handleApprove = (id: string) => {
    setApplications(applications.map(app => 
      app.id === id ? { ...app, status: "approved" as const } : app
    ));
    toast({ 
      title: "Application Approved",
      description: "The pharmacy has been approved and notified.",
    });
    setIsViewOpen(false);
  };

  const handleReject = (id: string) => {
    setApplications(applications.map(app => 
      app.id === id ? { ...app, status: "rejected" as const } : app
    ));
    toast({ 
      title: "Application Rejected",
      description: "The pharmacy has been notified of the rejection.",
    });
    setIsViewOpen(false);
  };

  const viewApplication = (app: Application) => {
    setSelectedApp(app);
    setIsViewOpen(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge className="bg-warning/10 text-warning">Pending</Badge>;
      case "approved":
        return <Badge className="bg-success/10 text-success">Approved</Badge>;
      case "rejected":
        return <Badge className="bg-destructive/10 text-destructive">Rejected</Badge>;
      default:
        return null;
    }
  };

  const pendingApps = applications.filter(a => a.status === "pending");
  const processedApps = applications.filter(a => a.status !== "pending");

  return (
    <AdminSidebar>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Pharmacy Applications</h1>
          <p className="text-muted-foreground mt-1">Review and manage pharmacy registration requests</p>
        </div>

        {/* Pending Applications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Pending Applications
              {pendingApps.length > 0 && (
                <Badge className="bg-warning/10 text-warning">{pendingApps.length}</Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {pendingApps.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No pending applications</p>
            ) : (
              <div className="space-y-4">
                {pendingApps.map((app) => (
                  <div key={app.id} className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-secondary/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center">
                        <Building2 className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold">{app.pharmacyName}</p>
                        <p className="text-sm text-muted-foreground">{app.ownerName}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={() => viewApplication(app)}>
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                      <Button variant="default" size="sm" className="bg-success hover:bg-success/90" onClick={() => handleApprove(app.id)}>
                        <Check className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm" className="text-destructive hover:text-destructive" onClick={() => handleReject(app.id)}>
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Processed Applications */}
        {processedApps.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Processed Applications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {processedApps.map((app) => (
                  <div key={app.id} className="flex items-center justify-between p-4 rounded-lg border border-border">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center">
                        <Building2 className="w-6 h-6 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-semibold">{app.pharmacyName}</p>
                        <p className="text-sm text-muted-foreground">{app.ownerName}</p>
                      </div>
                    </div>
                    {getStatusBadge(app.status)}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* View Dialog */}
        <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Application Details</DialogTitle>
            </DialogHeader>
            {selectedApp && (
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl gradient-primary flex items-center justify-center">
                    <Building2 className="w-8 h-8 text-primary-foreground" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">{selectedApp.pharmacyName}</h3>
                    <p className="text-muted-foreground">Submitted: {selectedApp.submittedAt}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary">
                    <User className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-xs text-muted-foreground">Owner</p>
                      <p className="font-medium">{selectedApp.ownerName}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary">
                    <Mail className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-xs text-muted-foreground">Email</p>
                      <p className="font-medium">{selectedApp.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary">
                    <Phone className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-xs text-muted-foreground">Phone</p>
                      <p className="font-medium">{selectedApp.phone}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary">
                    <MapPin className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-xs text-muted-foreground">Address</p>
                      <p className="font-medium">{selectedApp.address}</p>
                    </div>
                  </div>

                  {/* License Document Section */}
                  <div className="p-4 rounded-lg border border-primary/20 bg-primary/5">
                    <div className="flex items-center gap-2 mb-3">
                      <FileText className="w-5 h-5 text-primary" />
                      <p className="font-semibold text-sm">License Document</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <FileText className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{selectedApp.licenseDocument.name}</p>
                          <p className="text-xs text-muted-foreground">{selectedApp.licenseDocument.size}</p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(selectedApp.licenseDocument.url, '_blank')}
                      >
                        <ExternalLink className="w-4 h-4 mr-1" />
                        View
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button 
                    variant="outline" 
                    className="flex-1 text-destructive hover:text-destructive"
                    onClick={() => handleReject(selectedApp.id)}
                  >
                    <X className="w-4 h-4 mr-2" />
                    Reject
                  </Button>
                  <Button 
                    variant="hero"
                    className="flex-1"
                    onClick={() => handleApprove(selectedApp.id)}
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Approve
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

export default AdminApplications;
