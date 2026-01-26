import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Pill, Mail, CheckCircle, ArrowRight, RefreshCw } from "lucide-react";
import { useToast } from "../hooks/use-toast";
import { authApi } from "../lib/api";

const VerifyEmail = () => {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const email = (location.state as { email?: string; isPharmacy?: boolean })?.email || "";
  const isPharmacy = (location.state as { email?: string; isPharmacy?: boolean })?.isPharmacy || false;

  useEffect(() => {
    if (!email) {
      navigate("/login");
    }
  }, [email, navigate]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) {
      // Handle paste
      const pastedValue = value.slice(0, 6);
      const newOtp = [...otp];
      for (let i = 0; i < pastedValue.length; i++) {
        if (i + index < 6) {
          newOtp[i + index] = pastedValue[i];
        }
      }
      setOtp(newOtp);
      const nextIndex = Math.min(index + pastedValue.length, 5);
      inputRefs.current[nextIndex]?.focus();
    } else {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      if (value && index < 5) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const otpCode = otp.join("");
    if (otpCode.length !== 6) {
      toast({
        title: "Invalid OTP",
        description: "Please enter the complete 6-digit code.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      await authApi.verifyEmail(email, otpCode);
      setIsVerified(true);
      toast({
        title: "Email Verified!",
        description: isPharmacy
          ? "Your email is verified. Please wait for admin approval."
          : "Your email is verified. You can now login.",
      });
    } catch (err) {
      const error = err as Error;
      toast({
        title: "Verification Failed",
        description: error.message || "Invalid or expired OTP. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setIsResending(true);

    try {
      await authApi.resendOtp(email);
      setCountdown(60);
      toast({
        title: "OTP Sent",
        description: "A new verification code has been sent to your email.",
      });
    } catch (err) {
      const error = err as Error;
      toast({
        title: "Failed to Resend",
        description: error.message || "Could not resend OTP. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsResending(false);
    }
  };

  if (isVerified) {
    return (
      <div className="min-h-screen gradient-hero flex items-center justify-center p-4">
        <div className="absolute top-8 left-8">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-md">
              <Pill className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-gradient">UMUTI</span>
          </Link>
        </div>

        <Card className="w-full max-w-md animate-slide-up shadow-xl">
          <CardContent className="pt-8 pb-8 text-center">
            <div className="w-20 h-20 rounded-full bg-success/10 mx-auto mb-6 flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-success" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Email Verified!</h2>
            {isPharmacy ? (
              <>
                <p className="text-muted-foreground mb-6">
                  Your email has been verified successfully. Your pharmacy application is now pending admin approval.
                  You will receive an email once your application is reviewed.
                </p>
                <div className="p-4 bg-warning/10 rounded-lg mb-6">
                  <p className="text-sm text-warning-foreground">
                    <strong>Note:</strong> You cannot login until your pharmacy is approved by an admin.
                  </p>
                </div>
              </>
            ) : (
              <p className="text-muted-foreground mb-6">
                Your email has been verified successfully. You can now login to your account.
              </p>
            )}
            <Button onClick={() => navigate("/login")} variant="hero" className="w-full" size="lg">
              Go to Login
              <ArrowRight className="w-4 h-4" />
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-hero flex items-center justify-center p-4">
      <div className="absolute top-8 left-8">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-md">
            <Pill className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold text-gradient">UMUTI</span>
        </Link>
      </div>

      <Card className="w-full max-w-md animate-slide-up shadow-xl">
        <CardHeader className="text-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 mx-auto mb-4 flex items-center justify-center">
            <Mail className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Verify Your Email</CardTitle>
          <CardDescription>
            We've sent a 6-digit verification code to
            <br />
            <span className="font-medium text-foreground">{email}</span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* OTP Input */}
            <div className="flex justify-center gap-2">
              {otp.map((digit, index) => (
                <Input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value.replace(/\D/g, ""))}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-12 h-14 text-center text-xl font-bold"
                />
              ))}
            </div>

            <Button onClick={handleVerify} variant="hero" className="w-full" size="lg" disabled={isLoading}>
              {isLoading ? "Verifying..." : "Verify Email"}
              <CheckCircle className="w-4 h-4" />
            </Button>

            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-2">Didn't receive the code?</p>
              <Button
                onClick={handleResendOtp}
                variant="ghost"
                size="sm"
                disabled={isResending || countdown > 0}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isResending ? "animate-spin" : ""}`} />
                {countdown > 0 ? `Resend in ${countdown}s` : "Resend Code"}
              </Button>
            </div>

            <div className="text-center">
              <Link to="/login" className="text-sm text-primary hover:underline">
                Back to Login
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VerifyEmail;
