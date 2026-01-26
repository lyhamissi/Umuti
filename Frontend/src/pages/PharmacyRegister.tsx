import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Pill, Mail, Lock, ArrowRight, User, Phone, MapPin, Building, Clock, FileText } from "lucide-react";
import { useToast } from "../hooks/use-toast";
import { authApi } from "../lib/api";

const PharmacyRegister = () => {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // User details
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Pharmacy details
  const [pharmacyName, setPharmacyName] = useState("");
  const [pharmacyAddress, setPharmacyAddress] = useState("");
  const [pharmacyPhone, setPharmacyPhone] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [hours, setHours] = useState("8:00 AM - 8:00 PM");

  const validateStep1 = () => {
    if (!name || !email || !phone || !password || !confirmPassword) {
      toast({
        title: "Missing Fields",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return false;
    }
    if (password !== confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "Passwords do not match.",
        variant: "destructive",
      });
      return false;
    }
    if (password.length < 6) {
      toast({
        title: "Weak Password",
        description: "Password must be at least 6 characters.",
        variant: "destructive",
      });
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (!pharmacyName || !pharmacyAddress || !pharmacyPhone) {
      toast({
        title: "Missing Fields",
        description: "Please fill in all required pharmacy details.",
        variant: "destructive",
      });
      return false;
    }
    return true;
  };

  const handleNext = () => {
    console.log("handleNext called, current step:", step);
    if (step === 1 && validateStep1()) {
      console.log("Moving to step 2");
      setStep(2);
    }
  };

  const handleBack = () => {
    setStep(1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("handleSubmit called - step 2 form submitted");
    if (!validateStep2()) {
      console.log("Validation failed");
      return;
    }
    console.log("Validation passed, proceeding with registration");

    setIsLoading(true);

    const registrationData = {
      name,
      email,
      phone,
      password,
      pharmacyName,
      pharmacyAddress,
      pharmacyPhone,
      licenseNumber: licenseNumber || undefined,
      hours,
    };

    console.log("Submitting pharmacy registration:", registrationData);

    try {
      const response = await authApi.registerPharmacy(registrationData);

      console.log("Registration response:", response);

      toast({
        title: "Registration Successful!",
        description: "Please check your email to verify your account.",
      });

      // Navigate to verification page with email
      navigate("/verify-email", { state: { email, isPharmacy: true } });
    } catch (err) {
      console.error("Registration error:", err);
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
          <CardTitle className="text-2xl">Register Your Pharmacy</CardTitle>
          <CardDescription>
            {step === 1 ? "Step 1: Your Personal Information" : "Step 2: Pharmacy Details"}
          </CardDescription>
          {/* Progress indicator */}
          <div className="flex justify-center gap-2 mt-4">
            <div className={`h-2 w-16 rounded-full ${step >= 1 ? "bg-primary" : "bg-muted"}`} />
            <div className={`h-2 w-16 rounded-full ${step >= 2 ? "bg-primary" : "bg-muted"}`} />
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {step === 1 ? (
              <>
                {/* Personal Information */}
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="name"
                      type="text"
                      placeholder="Enter your full name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number *</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+250 788 000 000"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password *</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="Min. 6 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password *</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="Confirm your password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <Button type="button" onClick={handleNext} variant="hero" className="w-full" size="lg">
                  Continue
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </>
            ) : (
              <>
                {/* Pharmacy Information */}
                <div className="space-y-2">
                  <Label htmlFor="pharmacyName">Pharmacy Name *</Label>
                  <div className="relative">
                    <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="pharmacyName"
                      type="text"
                      placeholder="Your Pharmacy Name"
                      value={pharmacyName}
                      onChange={(e) => setPharmacyName(e.target.value)}
                      className="pl-10"
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
                      type="text"
                      placeholder="KG 123 St, Kigali"
                      value={pharmacyAddress}
                      onChange={(e) => setPharmacyAddress(e.target.value)}
                      className="pl-10"
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
                      value={pharmacyPhone}
                      onChange={(e) => setPharmacyPhone(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="licenseNumber">License Number (Optional)</Label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="licenseNumber"
                      type="text"
                      placeholder="PHR-2024-XXXXX"
                      value={licenseNumber}
                      onChange={(e) => setLicenseNumber(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="hours">Operating Hours</Label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="hours"
                      type="text"
                      placeholder="8:00 AM - 8:00 PM"
                      value={hours}
                      onChange={(e) => setHours(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button type="button" onClick={handleBack} variant="outline" className="flex-1" size="lg">
                    Back
                  </Button>
                  <Button type="submit" variant="hero" className="flex-1" size="lg" disabled={isLoading}>
                    {isLoading ? "Submitting..." : "Submit Application"}
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </>
            )}
          </form>

          <div className="mt-6 text-center text-sm">
            <span className="text-muted-foreground">Already have an account? </span>
            <Link to="/login" className="text-primary font-medium hover:underline">
              Sign In
            </Link>
          </div>

          <div className="mt-4 p-4 bg-secondary rounded-lg">
            <p className="text-sm text-muted-foreground text-center">
              <strong>Note:</strong> After registration, you'll need to verify your email and wait for admin approval before you can access your dashboard.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PharmacyRegister;
