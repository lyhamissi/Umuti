import { useState } from "react";
import AdminSidebar from "../../components/AdminSidebar";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card";
import { Avatar, AvatarFallback } from "../../components/ui/avatar";
import { 
  Shield, 
  Mail, 
  User, 
  Save, 
  Loader2, 
  Lock, 
  KeyRound, 
  Activity,
  BadgeCheck,
  Settings
} from "lucide-react";
import { useToast } from "../../hooks/use-toast";
import { useAuth } from "../../components/AuthProvider";
import { userApi } from "../../lib/api";
import { Badge } from "../../components/ui/badge";

const AdminProfile = () => {
  const { toast } = useToast();
  const { user, refreshUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsLoadingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  
  const [profile, setProfile] = useState({
    name: user?.name || "",
    email: user?.email || "",
    role: user?.role || "ADMIN",
  });

  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleSave = async () => {
    try {
      setIsLoadingProfile(true);
      await userApi.updateProfile({
        name: profile.name,
      });
      await refreshUser();
      setIsEditing(false);
      toast({ title: "Profile updated", description: "Your profile information has been saved successfully." });
    } catch (err) {
      const error = err as any;
      toast({ 
        title: "Update failed", 
        description: error.message || "Failed to update profile",
        variant: "destructive"
      });
    } finally {
      setIsLoadingProfile(false);
    }
  };

  const handlePasswordUpdate = async () => {
    if (passwords.newPassword !== passwords.confirmPassword) {
      toast({ 
        title: "Validation Error", 
        description: "New passwords do not match",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsChangingPassword(true);
      await userApi.changePassword(passwords.currentPassword, passwords.newPassword);
      setPasswords({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      toast({ title: "Password changed", description: "Your security credentials have been updated." });
    } catch (err) {
      const error = err as any;
      toast({ 
        title: "Update failed", 
        description: error.message || "Failed to update password",
        variant: "destructive"
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <AdminSidebar>
      <div className="max-w-6xl mx-auto space-y-10 pb-10 animate-fade-in">
        
        {/* Header Section */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/10 via-background to-secondary/20 border border-border/50 p-8 md:p-12">
           <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[100px] -mr-32 -mt-32 rounded-full" />
           <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-500/10 blur-[80px] -ml-24 -mb-24 rounded-full" />
           
           <div className="flex flex-col md:flex-row items-center gap-8 relative">
              <div className="relative group">
                <Avatar className="w-32 h-32 md:w-40 md:h-40 border-4 border-background shadow-2xl scale-100 transition-transform duration-500 group-hover:scale-105">
                  <AvatarFallback className="bg-gradient-to-br from-primary to-emerald-500 text-4xl text-white font-bold">
                    {profile.name.charAt(0).toUpperCase()}
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
                    <h1 className="text-3xl md:text-5xl font-black tracking-tight">{profile.name}</h1>
                    <Badge className="bg-primary/10 text-primary border-primary/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                       {profile.role}
                    </Badge>
                 </div>
                 <p className="text-lg text-muted-foreground max-w-xl">
                    System Administrator for the UMUTI Network. Managing security, pharmacies, and platform integrity.
                 </p>
                 <div className="flex items-center justify-center md:justify-start gap-4 pt-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium bg-muted/30 px-3 py-1.5 rounded-lg border border-border/40">
                       <Mail className="w-4 h-4" />
                       {profile.email}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium bg-muted/30 px-3 py-1.5 rounded-lg border border-border/40">
                       <Activity className="w-4 h-4" />
                       Last updated 2 days ago
                    </div>
                 </div>
              </div>

              <div className="flex flex-col gap-3 min-w-[160px]">
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
           
           {/* Account Information */}
           <div className="lg:col-span-3 space-y-8">
              <Card className="glass-card border-none overflow-hidden h-full">
                 <CardHeader className="border-b border-border/40 bg-muted/10">
                    <div className="flex items-center gap-3">
                       <div className="p-2 rounded-xl bg-primary/10 text-primary">
                          <User className="w-5 h-5" />
                       </div>
                       <div>
                          <CardTitle>Account Information</CardTitle>
                          <CardDescription>Update your personal and contact details</CardDescription>
                       </div>
                    </div>
                 </CardHeader>
                 <CardContent className="p-8 space-y-8">
                    <div className="grid md:grid-cols-2 gap-8">
                       <div className="space-y-3">
                          <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Full Name</Label>
                          <div className="relative group">
                             <User className="absolute left-3 top-3 w-4 h-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
                             <Input 
                                className="pl-10 h-12 bg-muted/20 border-border/50 focus:border-primary/50 transition-all rounded-xl"
                                value={profile.name}
                                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                                disabled={!isEditing}
                                placeholder="Admin Name"
                             />
                          </div>
                          {isEditing && <p className="text-[10px] text-muted-foreground ml-1">Visible to other administrators and in activity logs.</p>}
                       </div>

                       <div className="space-y-3">
                          <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Email Address</Label>
                          <div className="relative group">
                             <Mail className="absolute left-3 top-3 w-4 h-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
                             <Input 
                                className="pl-10 h-12 bg-muted/20 border-border/50 focus:border-primary/50 transition-all rounded-xl"
                                type="email"
                                value={profile.email}
                                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                                disabled={!isEditing}
                                placeholder="admin@umuti.com"
                             />
                          </div>
                          {isEditing && <p className="text-[10px] text-muted-foreground ml-1">Used for notifications and security alerts.</p>}
                       </div>
                    </div>

                    <div className="space-y-3">
                       <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">System Role</Label>
                       <div className="relative">
                          <Shield className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                          <Input 
                             className="pl-10 h-12 bg-muted/10 border-border/30 rounded-xl"
                             value={profile.role}
                             disabled
                          />
                       </div>
                       <p className="text-[10px] text-amber-500 font-medium ml-1 flex items-center gap-1">
                          <Lock className="w-3 h-3" /> Root administrator access level. Role cannot be changed.
                       </p>
                    </div>
                 </CardContent>
              </Card>
           </div>

           {/* Security / Password Section */}
           <div className="lg:col-span-2 space-y-8">
              <Card className="glass-card border-none overflow-hidden h-full">
                 <CardHeader className="border-b border-border/40 bg-muted/10">
                    <div className="flex items-center gap-3">
                       <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-500">
                          <KeyRound className="w-5 h-5" />
                       </div>
                       <div>
                          <CardTitle>Security</CardTitle>
                          <CardDescription>Update your login credentials</CardDescription>
                       </div>
                    </div>
                 </CardHeader>
                 <CardContent className="p-8 space-y-6">
                    <div className="space-y-3">
                       <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Current Password</Label>
                       <Input 
                          type="password" 
                          className="h-12 bg-muted/20 border-border/50 rounded-xl"
                          placeholder="••••••••" 
                          value={passwords.currentPassword}
                          onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
                       />
                    </div>
                    
                    <div className="space-y-3 pt-2">
                       <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">New Password</Label>
                       <Input 
                          type="password" 
                          className="h-12 bg-muted/20 border-border/50 rounded-xl focus:ring-indigo-500/20"
                          placeholder="Create a strong password" 
                          value={passwords.newPassword}
                          onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                       />
                    </div>

                    <div className="space-y-3">
                       <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Confirm Password</Label>
                       <Input 
                          type="password" 
                          className="h-12 bg-muted/20 border-border/50 rounded-xl focus:ring-indigo-500/20"
                          placeholder="Re-enter new password" 
                          value={passwords.confirmPassword}
                          onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                       />
                    </div>

                    <Button 
                       className="w-full h-12 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-700 hover:to-indigo-600 font-bold shadow-lg shadow-indigo-500/20 transition-all mt-4" 
                       onClick={handlePasswordUpdate}
                       disabled={isChangingPassword || !passwords.currentPassword || !passwords.newPassword}
                    >
                       {isChangingPassword ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Lock className="w-4 h-4 mr-2" />}
                       Update Security Keys
                    </Button>

                    <div className="mt-6 p-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/10 flex items-start gap-3">
                        <Activity className="w-4 h-4 text-indigo-500 mt-0.5 shrink-0" />
                        <p className="text-[10px] text-muted-foreground leading-relaxed">
                           <strong>Security Tip:</strong> Enabling Two-Factor Authentication (2FA) is recommended for all administrator accounts to prevent unauthorized access.
                        </p>
                    </div>
                 </CardContent>
              </Card>
           </div>
        </div>
      </div>
    </AdminSidebar>
  );
};

export default AdminProfile;
