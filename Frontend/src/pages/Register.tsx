import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Pill, Mail, Lock, Building2, User, Phone, MapPin, ArrowRight, Clock, Upload, FileText, X } from "lucide-react";
import { useToast } from "../hooks/use-toast";
import { authApi } from "../lib/api";

const Register = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // User registration state
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userPhone, setUserPhone] = useState("");
  const [userPassword, setUserPassword] = useState("");
  const [userConfirmPassword, setUserConfirmPassword] = useState("");

  // Pharmacy registration state
  const [ownerName, setOwnerName] = useState("");
  const [pharmacyEmail, setPharmacyEmail] = useState("");
  const [ownerPhone, setOwnerPhone] = useState("");
  const [pharmacyPassword, setPharmacyPassword] = useState("");
  const [pharmacyConfirmPassword, setPharmacyConfirmPassword] = useState("");
  const [pharmacyName, setPharmacyName] = useState("");
  const [pharmacyAddress, setPharmacyAddress] = useState("");
  const [pharmacyPhone, setPharmacyPhone] = useState("");
  const [licenseFile, setLicenseFile] = useState<File | null>(null);
  const [hours, setHours] = useState("8:00 AM - 8:00 PM");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please upload a file smaller than 5MB.",
          variant: "destructive",
        });
        return;
      }
      setLicenseFile(file);
    }
  };

  const removeFile = () => {
    setLicenseFile(null);
  };

  const handleUserRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (userPassword !== userConfirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "Passwords do not match.",
        variant: "destructive",
      });
      return;
    }

    if (userPassword.length < 6) {
      toast({
        title: "Weak Password",
        description: "Password must be at least 6 characters.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      await authApi.register({
        name: userName,
        email: userEmail,
        phone: userPhone || undefined,
        password: userPassword,
      });

      toast({
        title: "Registration Successful!",
        description: "Please check your email to verify your account.",
      });

      navigate("/verify-email", { state: { email: userEmail, isPharmacy: false } });
    } catch (err) {
      const error = err as Error;
      toast({
        title: "Registration Failed",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePharmacyRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (pharmacyPassword !== pharmacyConfirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "Passwords do not match.",
        variant: "destructive",
      });
      return;
    }

    if (pharmacyPassword.length < 6) {
      toast({
        title: "Weak Password",
        description: "Password must be at least 6 characters.",
        variant: "destructive",
      });
      return;
    }

    if (ownerPhone.length < 10) {
      toast({
        title: "Invalid Phone",
        description: "Please enter a valid phone number (at least 10 digits).",
        variant: "destructive",
      });
      return;
    }

    if (pharmacyPhone.length < 10) {
      toast({
        title: "Invalid Pharmacy Phone",
        description: "Please enter a valid pharmacy phone number (at least 10 digits).",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      await authApi.registerPharmacy({
        name: ownerName,
        email: pharmacyEmail,
        phone: ownerPhone,
        password: pharmacyPassword,
        pharmacyName,
        pharmacyAddress,
        pharmacyPhone,
        hours,
      });

      toast({
        title: "Registration Successful!",
        description: "Please check your email to verify your account.",
      });

      navigate("/verify-email", { state: { email: pharmacyEmail, isPharmacy: true } });
    } catch (err) {
      const error = err as Error;
      toast({
        title: "Registration Failed",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen gradient-hero flex items-center justify-center p-4 py-12">
      <div className="absolute top-8 left-8">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-md">
            <Pill className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold text-gradient">UMUTI</span>
        </Link>
      </div>

      <Card className="w-full max-w-lg animate-slide-up shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Create Account</CardTitle>
          <CardDescription>
            Join UMUTI to find medicines or register your pharmacy
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="user" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="user" className="flex items-center gap-2">
                <User className="w-4 h-4" />
                User
              </TabsTrigger>
              <TabsTrigger value="pharmacy" className="flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                Pharmacy
              </TabsTrigger>
            </TabsList>

            <TabsContent value="user">
              <form onSubmit={handleUserRegister} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="userName">Full Name *</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="userName"
                      placeholder="John Doe"
                      className="pl-10"
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="userEmail">Email *</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="userEmail"
                      type="email"
                      placeholder="you@example.com"
                      className="pl-10"
                      value={userEmail}
                      onChange={(e) => setUserEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="userPhone">Phone (Optional)</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="userPhone"
                      type="tel"
                      placeholder="+250 788 000 000"
                      className="pl-10"
                      value={userPhone}
                      onChange={(e) => setUserPhone(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="userPassword">Password *</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="userPassword"
                      type="password"
                      placeholder="Min. 6 characters"
                      className="pl-10"
                      value={userPassword}
                      onChange={(e) => setUserPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="userConfirmPassword">Confirm Password *</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="userConfirmPassword"
                      type="password"
                      placeholder="Confirm your password"
                      className="pl-10"
                      value={userConfirmPassword}
                      onChange={(e) => setUserConfirmPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <Button type="submit" variant="hero" className="w-full" size="lg" disabled={isLoading}>
                  {isLoading ? "Creating Account..." : "Create Account"}
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="pharmacy">
              <form onSubmit={handlePharmacyRegister} className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                {/* Owner Information */}
                <div className="pb-2 border-b">
                  <h3 className="font-medium text-sm text-muted-foreground">Owner Information</h3>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ownerName">Owner Full Name *</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="ownerName"
                      placeholder="John Doe"
                      className="pl-10"
                      value={ownerName}
                      onChange={(e) => setOwnerName(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pharmacyEmail">Email *</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="pharmacyEmail"
                      type="email"
                      placeholder="pharmacy@example.com"
                      className="pl-10"
                      value={pharmacyEmail}
                      onChange={(e) => setPharmacyEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ownerPhone">Phone Number *</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="ownerPhone"
                      type="tel"
                      placeholder="+250 788 000 000"
                      className="pl-10"
                      value={ownerPhone}
                      onChange={(e) => setOwnerPhone(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pharmacyPassword">Password *</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="pharmacyPassword"
                      type="password"
                      placeholder="Min. 6 characters"
                      className="pl-10"
                      value={pharmacyPassword}
                      onChange={(e) => setPharmacyPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pharmacyConfirmPassword">Confirm Password *</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="pharmacyConfirmPassword"
                      type="password"
                      placeholder="Confirm your password"
                      className="pl-10"
                      value={pharmacyConfirmPassword}
                      onChange={(e) => setPharmacyConfirmPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* Pharmacy Information */}
                <div className="pb-2 border-b pt-4">
                  <h3 className="font-medium text-sm text-muted-foreground">Pharmacy Information</h3>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pharmacyName">Pharmacy Name *</Label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="pharmacyName"
                      placeholder="PharmaCare Plus"
                      className="pl-10"
                      value={pharmacyName}
                      onChange={(e) => setPharmacyName(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pharmacyAddress">Pharmacy Address *</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="pharmacyAddress"
                      placeholder="KG 7 Ave, Kigali"
                      className="pl-10"
                      value={pharmacyAddress}
                      onChange={(e) => setPharmacyAddress(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pharmacyPhone">Pharmacy Phone *</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="pharmacyPhone"
                      type="tel"
                      placeholder="+250 788 000 000"
                      className="pl-10"
                      value={pharmacyPhone}
                      onChange={(e) => setPharmacyPhone(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="licenseDoc">License Document (Optional)</Label>
                  <p className="text-xs text-muted-foreground">Upload your pharmacy license (PDF, JPG, PNG - Max 5MB)</p>

                  {!licenseFile ? (
                    <label
                      htmlFor="licenseDoc"
                      className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-secondary/50 transition-colors"
                    >
                      <div className="flex flex-col items-center justify-center py-4">
                        <Upload className="w-6 h-6 text-muted-foreground mb-1" />
                        <p className="text-xs text-muted-foreground">
                          <span className="font-medium text-primary">Click to upload</span>
                        </p>
                      </div>
                      <Input
                        id="licenseDoc"
                        type="file"
                        className="hidden"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={handleFileChange}
                      />
                    </label>
                  ) : (
                    <div className="flex items-center justify-between p-3 border border-border rounded-lg bg-secondary/50">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                          <FileText className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium truncate max-w-[180px]">{licenseFile.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {(licenseFile.size / 1024).toFixed(1)} KB
                          </p>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={removeFile}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="hours">Operating Hours</Label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="hours"
                      placeholder="8:00 AM - 8:00 PM"
                      className="pl-10"
                      value={hours}
                      onChange={(e) => setHours(e.target.value)}
                    />
                  </div>
                </div>

                <Button type="submit" variant="hero" className="w-full" size="lg" disabled={isLoading}>
                  {isLoading ? "Submitting Application..." : "Submit Application"}
                  <ArrowRight className="w-4 h-4" />
                </Button>

                <p className="text-xs text-muted-foreground text-center">
                  Your application will be reviewed by our admin team. You'll receive an email once approved.
                </p>
              </form>
            </TabsContent>
          </Tabs>

          <div className="mt-6 text-center text-sm">
            <span className="text-muted-foreground">Already have an account? </span>
            <Link to="/login" className="text-primary font-medium hover:underline">
              Sign In
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Register;
