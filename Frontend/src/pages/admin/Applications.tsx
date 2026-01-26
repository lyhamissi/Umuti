import { useState, useEffect } from "react";
import AdminSidebar from "../../components/AdminSidebar";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "../../components/ui/dialog";
import { Textarea } from "../../components/ui/textarea";
import { Check, X, Eye, Building2, MapPin, Phone, Mail, User, FileText, ExternalLink, Loader2, RefreshCw } from "lucide-react";
import { useToast } from "../../hooks/use-toast";
import { adminApi } from "../../lib/api";
import type { PharmacyApplication } from "../../lib/api";

const AdminApplications = () => {
  const [applications, setApplications] = useState<PharmacyApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState<PharmacyApplication | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const fetchApplications = async () => {
    try {
      setIsLoading(true);
      const data = await adminApi.getApplications();
      setApplications(data.applications);
    } catch (err) {
      const error = err as Error;
      toast({
        title: "Error",
        description: error.message || "Failed to fetch applications",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleApprove = async (id: string) => {
    setIsProcessing(true);
    try {
      await adminApi.approveApplication(id);
      toast({
        title: "Application Approved",
        description: "The pharmacy has been approved and notified via email.",
      });
      setIsViewOpen(false);
      fetchApplications();
    } catch (err) {
      const error = err as Error;
      toast({
        title: "Error",
        description: error.message || "Failed to approve application",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const openRejectDialog = (app: PharmacyApplication) => {
    setSelectedApp(app);
    setRejectionReason("");
    setIsRejectDialogOpen(true);
  };

  const handleReject = async () => {
    if (!selectedApp) return;

    if (rejectionReason.length < 10) {
      toast({
        title: "Reason Required",
        description: "Please provide a rejection reason (at least 10 characters).",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    try {
      await adminApi.rejectApplication(selectedApp.id, rejectionReason);
      toast({
        title: "Application Rejected",
        description: "The pharmacy has been notified via email with the rejection reason.",
      });
      setIsRejectDialogOpen(false);
      setIsViewOpen(false);
      fetchApplications();
    } catch (err) {
      const error = err as Error;
      toast({
        title: "Error",
        description: error.message || "Failed to reject application",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const viewApplication = (app: PharmacyApplication) => {
    setSelectedApp(app);
    setIsViewOpen(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return <Badge className="bg-warning/10 text-warning">Pending</Badge>;
      case "APPROVED":
        return <Badge className="bg-success/10 text-success">Approved</Badge>;
      case "REJECTED":
        return <Badge className="bg-destructive/10 text-destructive">Rejected</Badge>;
      default:
        return null;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const pendingApps = applications.filter(a => a.status === "PENDING");
  const processedApps = applications.filter(a => a.status !== "PENDING");

  return (
    <AdminSidebar>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Pharmacy Applications</h1>
            <p className="text-muted-foreground mt-1">Review and manage pharmacy registration requests</p>
          </div>
          <Button variant="outline" size="sm" onClick={fetchApplications} disabled={isLoading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <Card>
            <CardContent className="py-12 flex flex-col items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
              <p className="text-muted-foreground">Loading applications...</p>
            </CardContent>
          </Card>
        ) : (
          <>
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
                          <Button
                            variant="default"
                            size="sm"
                            className="bg-success hover:bg-success/90"
                            onClick={() => handleApprove(app.id)}
                            disabled={isProcessing}
                          >
                            <Check className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-destructive hover:text-destructive"
                            onClick={() => openRejectDialog(app)}
                            disabled={isProcessing}
                          >
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
                            {app.status === "REJECTED" && app.rejectionReason && (
                              <p className="text-xs text-destructive mt-1">Reason: {app.rejectionReason}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-muted-foreground">
                            {app.reviewedAt && formatDate(app.reviewedAt)}
                          </span>
                          {getStatusBadge(app.status)}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </>
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
                    <p className="text-muted-foreground">Submitted: {formatDate(selectedApp.submittedAt)}</p>
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
                  {selectedApp.licenseNumber && (
                    <div className="p-4 rounded-lg border border-primary/20 bg-primary/5">
                      <div className="flex items-center gap-2 mb-3">
                        <FileText className="w-5 h-5 text-primary" />
                        <p className="font-semibold text-sm">License Information</p>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <FileText className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">License #{selectedApp.licenseNumber}</p>
                            {selectedApp.licenseDocument && (
                              <p className="text-xs text-muted-foreground">Document attached</p>
                            )}
                          </div>
                        </div>
                        {selectedApp.licenseDocument && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(selectedApp.licenseDocument!, '_blank')}
                          >
                            <ExternalLink className="w-4 h-4 mr-1" />
                            View
                          </Button>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {selectedApp.status === "PENDING" && (
                  <div className="flex gap-3 pt-4">
                    <Button
                      variant="outline"
                      className="flex-1 text-destructive hover:text-destructive"
                      onClick={() => {
                        setIsViewOpen(false);
                        openRejectDialog(selectedApp);
                      }}
                      disabled={isProcessing}
                    >
                      <X className="w-4 h-4 mr-2" />
                      Reject
                    </Button>
                    <Button
                      variant="hero"
                      className="flex-1"
                      onClick={() => handleApprove(selectedApp.id)}
                      disabled={isProcessing}
                    >
                      {isProcessing ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Check className="w-4 h-4 mr-2" />
                      )}
                      Approve
                    </Button>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Rejection Reason Dialog */}
        <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Reject Application</DialogTitle>
              <DialogDescription>
                Please provide a reason for rejecting this application. This will be sent to the pharmacy owner via email.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Textarea
                placeholder="Enter rejection reason (minimum 10 characters)..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={4}
                className="resize-none"
              />
              <p className="text-xs text-muted-foreground mt-2">
                {rejectionReason.length}/10 characters minimum
              </p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsRejectDialogOpen(false)} disabled={isProcessing}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleReject}
                disabled={isProcessing || rejectionReason.length < 10}
              >
                {isProcessing ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <X className="w-4 h-4 mr-2" />
                )}
                Reject Application
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminSidebar>
  );
};

export default AdminApplications;
