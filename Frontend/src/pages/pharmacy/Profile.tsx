import { useState } from "react";
import PharmacySidebar from "../../components/PharmacySidebar";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Avatar, AvatarFallback } from "../../components/ui/avatar";
import { Building2, Mail, Phone, MapPin, Clock, Save } from "lucide-react";
import { useToast } from "../../hooks/use-toast";

const PharmacyProfile = () => {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    name: "PharmaCare Plus",
    email: "contact@pharmacare.rw",
    phone: "+250 788 123 456",
    address: "KG 7 Ave, Kigali",
    openingHours: "8:00 AM - 9:00 PM",
    ownerName: "Jean Pierre Habimana",
    license: "PHR-2024-001234",
  });

  const handleSave = () => {
    setIsEditing(false);
    toast({ title: "Profile updated successfully" });
  };

  return (
    <PharmacySidebar>
      <div className="space-y-6 max-w-3xl">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Pharmacy Profile</h1>
          <p className="text-muted-foreground mt-1">View and manage your pharmacy details</p>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center gap-4 pb-4">
            <Avatar className="w-20 h-20">
              <AvatarFallback className="gradient-primary text-2xl text-primary-foreground">
                {profile.name.split(" ").map(n => n[0]).join("")}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <CardTitle className="text-xl">{profile.name}</CardTitle>
              <p className="text-sm text-muted-foreground">License: {profile.license}</p>
            </div>
            <Button 
              variant={isEditing ? "hero" : "outline"} 
              onClick={() => isEditing ? handleSave() : setIsEditing(true)}
            >
              {isEditing ? (
                <>
                  <Save className="w-4 h-4" />
                  Save Changes
                </>
              ) : "Edit Profile"}
            </Button>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-primary" />
                  Pharmacy Name
                </Label>
                <Input 
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  disabled={!isEditing}
                />
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-primary" />
                  Email
                </Label>
                <Input 
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  disabled={!isEditing}
                />
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-primary" />
                  Phone Number
                </Label>
                <Input 
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  disabled={!isEditing}
                />
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-primary" />
                  Opening Hours
                </Label>
                <Input 
                  value={profile.openingHours}
                  onChange={(e) => setProfile({ ...profile, openingHours: e.target.value })}
                  disabled={!isEditing}
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-primary" />
                  Address
                </Label>
                <Input 
                  value={profile.address}
                  onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                  disabled={!isEditing}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Owner Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label>Owner Name</Label>
              <Input 
                value={profile.ownerName}
                onChange={(e) => setProfile({ ...profile, ownerName: e.target.value })}
                disabled={!isEditing}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </PharmacySidebar>
  );
};

export default PharmacyProfile;
