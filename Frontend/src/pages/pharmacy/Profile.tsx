import { useState, useEffect } from "react";
import PharmacySidebar from "../../components/PharmacySidebar";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card";
import { Avatar, AvatarFallback } from "../../components/ui/avatar";
import { 
  Building2, 
  Mail, 
  Phone, 
  MapPin, 
  Clock, 
  Save, 
  Loader2, 
  BadgeCheck, 
  FileText, 
  User, 
  Globe,
  Settings,
  Activity,
  ChevronRight
} from "lucide-react";
import { useToast } from "../../hooks/use-toast";
import { pharmacyApi } from "../../lib/api";
import { Badge } from "../../components/ui/badge";

const PharmacyProfile = () => {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [profile, setProfile] = useState({
    id: "",
    name: "",
    email: "",
    phone: "",
    address: "",
    openingHours: "",
    ownerName: "",
    license: "",
  });

  useEffect(() => {
    const fetchPharmacy = async () => {
      try {
        setIsLoading(true);
        const response = await pharmacyApi.getMine();
        if (response.data) {
          const ph = response.data;
          setProfile({
            id: ph.id,
            name: ph.name,
            email: ph.email || "",
            phone: ph.phone,
            address: ph.address,
            openingHours: ph.hours || "",
            ownerName: ph.owner?.name || "",
            license: ph.licenseNumber || "",
          });
        }
      } catch (err) {
        const error = err as any;
        toast({ 
          title: "Error", 
          description: error.message || "Failed to load pharmacy details",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchPharmacy();
  }, [toast]);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await pharmacyApi.update({
        name: profile.name,
        email: profile.email,
        phone: profile.phone,
        address: profile.address,
        hours: profile.openingHours,
      });
      setIsEditing(false);
      toast({ title: "Profile updated", description: "Changes have been saved successfully" });
    } catch (err) {
      const error = err as any;
      toast({ 
        title: "Update failed", 
        description: error.message || "Failed to update pharmacy details",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <PharmacySidebar>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </PharmacySidebar>
    );
  }

  return (
    <PharmacySidebar>
      <div className="max-w-6xl mx-auto space-y-10 pb-10 animate-fade-in">
        
        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/10 via-background to-secondary/20 border border-border/50 p-8 md:p-12">
           <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[100px] -mr-32 -mt-32 rounded-full" />
           <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-500/10 blur-[80px] -ml-24 -mb-24 rounded-full" />
           
           <div className="flex flex-col md:flex-row items-center gap-8 relative">
              <div className="relative group">
                <Avatar className="w-32 h-32 md:w-40 md:h-40 border-4 border-background shadow-2xl transition-all duration-500 group-hover:scale-105">
                  <AvatarFallback className="bg-gradient-to-br from-primary to-emerald-500 text-4xl text-white font-bold">
                    {profile.name ? profile.name.charAt(0).toUpperCase() : <Building2 className="w-12 h-12" />}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-2 -right-2 bg-background p-2 rounded-full shadow-lg border border-border">
                   <div className="bg-emerald-500 p-1.5 rounded-full">
                      <BadgeCheck className="w-4 h-4 text-white" />
                   </div>
                </div>
              </div>

              <div className="flex-1 text-center md:text-left space-y-4">
                 <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                    <h1 className="text-3xl md:text-5xl font-black tracking-tight">{profile.name || "Loading..."}</h1>
                    <Badge className="bg-primary/10 text-primary border-primary/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                       Verified Pharmacy
                    </Badge>
                 </div>
                 <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-muted-foreground font-medium">
                    <div className="flex items-center gap-2 bg-muted/30 px-3 py-1.5 rounded-lg border border-border/40">
                       <FileText className="w-4 h-4 text-primary" />
                       License: {profile.license}
                    </div>
                    <div className="flex items-center gap-2 bg-muted/30 px-3 py-1.5 rounded-lg border border-border/40">
                       <User className="w-4 h-4 text-primary" />
                       Owner: {profile.ownerName}
                    </div>
                 </div>
              </div>

              <div className="flex flex-col gap-3 min-w-[200px]">
                 <Button 
                    variant={isEditing ? "hero" : "outline"}
                    size="lg"
                    className="rounded-2xl font-bold shadow-xl transition-all duration-300 transform active:scale-95"
                    onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                    disabled={isSaving}
                 >
                    {isSaving ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : isEditing ? (
                      <Save className="w-4 h-4 mr-2" />
                    ) : (
                      <Settings className="w-4 h-4 mr-2" />
                    )}
                    {isEditing ? "Save Changes" : "Edit Profile"}
                 </Button>
                 {isEditing && (
                    <Button variant="ghost" onClick={() => setIsEditing(false)} className="rounded-2xl text-muted-foreground">
                       Cancel
                    </Button>
                 )}
              </div>
           </div>
        </div>

        <div className="grid lg:grid-cols-5 gap-8">
           
           {/* General Information */}
           <div className="lg:col-span-3 space-y-8">
              <Card className="glass-card border-none overflow-hidden h-full">
                 <CardHeader className="border-b border-border/40 bg-muted/10">
                    <div className="flex items-center gap-3">
                       <div className="p-2 rounded-xl bg-primary/10 text-primary">
                          <Building2 className="w-5 h-5" />
                       </div>
                       <div>
                          <CardTitle>Business Details</CardTitle>
                          <CardDescription>Official registration and contact info</CardDescription>
                       </div>
                    </div>
                 </CardHeader>
                 <CardContent className="p-8 space-y-8">
                    <div className="grid md:grid-cols-2 gap-8">
                       <div className="space-y-3">
                          <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Pharmacy Name</Label>
                          <div className="relative group">
                             <Building2 className="absolute left-3 top-3 w-4 h-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
                             <Input 
                                className="pl-10 h-12 bg-muted/20 border-border/50 focus:border-primary/50 transition-all rounded-xl"
                                value={profile.name}
                                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                                disabled={!isEditing}
                             />
                          </div>
                       </div>

                       <div className="space-y-3">
                          <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Official Email</Label>
                          <div className="relative group">
                             <Mail className="absolute left-3 top-3 w-4 h-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
                             <Input 
                                className="pl-10 h-12 bg-muted/20 border-border/50 focus:border-primary/50 transition-all rounded-xl"
                                type="email"
                                value={profile.email}
                                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                                disabled={!isEditing}
                             />
                          </div>
                       </div>

                       <div className="space-y-3">
                          <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Phone Number</Label>
                          <div className="relative group">
                             <Phone className="absolute left-3 top-3 w-4 h-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
                             <Input 
                                className="pl-10 h-12 bg-muted/20 border-border/50 focus:border-primary/50 transition-all rounded-xl"
                                value={profile.phone}
                                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                                disabled={!isEditing}
                             />
                          </div>
                       </div>

                       <div className="space-y-3">
                          <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">License Number</Label>
                          <div className="relative group">
                             <FileText className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                             <Input 
                                className="pl-10 h-12 bg-muted/10 border-border/30 rounded-xl"
                                value={profile.license}
                                disabled
                             />
                          </div>
                       </div>
                    </div>
                    
                    <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10 flex items-center justify-between">
                       <div className="flex items-center gap-3">
                          <div className="p-2 rounded-full bg-primary/20">
                             <Activity className="w-4 h-4 text-primary" />
                          </div>
                          <div>
                             <p className="text-sm font-bold">Verification Status</p>
                             <p className="text-[10px] text-muted-foreground">Your pharmacy is fully verified and listed on the network.</p>
                          </div>
                       </div>
                       <BadgeCheck className="w-6 h-6 text-primary" />
                    </div>
                 </CardContent>
              </Card>
           </div>

           {/* Location & Hours */}
           <div className="lg:col-span-2 space-y-8">
              <Card className="glass-card border-none overflow-hidden h-full">
                 <CardHeader className="border-b border-border/40 bg-muted/10">
                    <div className="flex items-center gap-3">
                       <div className="p-2 rounded-xl bg-orange-500/10 text-orange-500">
                          <MapPin className="w-5 h-5" />
                       </div>
                       <div>
                          <CardTitle>Operations</CardTitle>
                          <CardDescription>Location and serving times</CardDescription>
                       </div>
                    </div>
                 </CardHeader>
                 <CardContent className="p-8 space-y-8">
                    <div className="space-y-3">
                       <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Physical Address</Label>
                       <div className="relative group">
                          <MapPin className="absolute left-3 top-3 w-4 h-4 text-muted-foreground transition-colors group-focus-within:text-orange-500" />
                          <Input 
                             className="pl-10 h-12 bg-muted/20 border-border/50 focus:border-orange-500/50 transition-all rounded-xl"
                             value={profile.address}
                             onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                             disabled={!isEditing}
                          />
                       </div>
                    </div>

                    <div className="space-y-3">
                       <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Opening Hours</Label>
                       <div className="relative group">
                          <Clock className="absolute left-3 top-3 w-4 h-4 text-muted-foreground transition-colors group-focus-within:text-orange-500" />
                          <Input 
                             className="pl-10 h-12 bg-muted/20 border-border/50 focus:border-orange-500/50 transition-all rounded-xl"
                             value={profile.openingHours}
                             onChange={(e) => setProfile({ ...profile, openingHours: e.target.value })}
                             disabled={!isEditing}
                             placeholder="e.g., Mon-Fri: 8AM-10PM"
                          />
                       </div>
                    </div>

                    <div className="pt-4 space-y-4">
                       <div className="flex items-center justify-between text-sm font-medium p-3 rounded-xl bg-muted/30 border border-border/40">
                          <div className="flex items-center gap-2">
                             <Globe className="w-4 h-4 text-muted-foreground" />
                             Online Pharmacy
                          </div>
                          <Badge variant="outline" className="text-emerald-500 border-emerald-500/20 bg-emerald-500/5">Active</Badge>
                       </div>
                       <div className="flex items-center justify-between text-sm font-medium p-3 rounded-xl bg-muted/30 border border-border/40">
                          <div className="flex items-center gap-2">
                             <Activity className="w-4 h-4 text-muted-foreground" />
                             Emergency Service
                          </div>
                          <Badge variant="outline" className="text-orange-500 border-orange-500/20 bg-orange-500/5">24/7 Available</Badge>
                       </div>
                    </div>
                 </CardContent>
              </Card>
           </div>
        </div>

        {/* Footer info or decorative element */}
        <div className="p-8 rounded-3xl bg-card/40 backdrop-blur-sm border border-border flex flex-col md:flex-row items-center justify-between gap-6">
           <div className="space-y-2 text-center md:text-left">
              <p className="text-xl font-bold">Integrate with UMUTI Network</p>
              <p className="text-sm text-muted-foreground max-w-lg">Get more visibility and manage your inventory seamlessly by keeping your profile updated.</p>
           </div>
           <Button variant="link" className="text-primary font-bold group">
              View Public Page <ChevronRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
           </Button>
        </div>
      </div>
    </PharmacySidebar>
  );
};

export default PharmacyProfile;
