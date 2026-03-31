import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Pill, Mail, Lock, ArrowRight } from "lucide-react";
import { useToast } from "../hooks/use-toast";
import { useLanguage } from "../components/LanguageSwitcher";
import { useAuth } from "../components/AuthProvider";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { t } = useLanguage();
  const { login } = useAuth();

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { success, role, error } = await login(email, password);

      if (!success) {
        toast({
          title: "Login Failed",
          description: error || "Invalid email or password. Please try again.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: t("loginSuccess"),
        description: t("loginSuccessDesc"),
      });

      // Redirect to the page they tried to visit or their dashboard
      if (from) {
        navigate(from);
      } else if (role === "admin") {
        navigate("/admin/dashboard");
      } else {
        navigate("/pharmacy/dashboard");
      }
    } catch {
      toast({
        title: "Connection Error",
        description: "Unable to connect to server. Make sure the backend is running.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

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
          <CardTitle className="text-2xl">{t("welcomeBack")}</CardTitle>
          <CardDescription>
            {t("signInToAccess")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">{t("email")}</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder={t("emailPlaceholder")}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">{t("password")}</Label>
                <Link to="/forgot-password" className="text-sm text-primary hover:underline">
                  {t("forgotPassword")}
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <Button type="submit" variant="hero" className="w-full" size="lg" disabled={isLoading}>
              {isLoading ? t("signingIn") : t("signIn")}
              <ArrowRight className="w-4 h-4" />
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
            <span className="text-muted-foreground">{t("dontHaveAccount")} </span>
            <Link to="/register" className="text-primary font-medium hover:underline">
              {t("register")}
            </Link>
          </div>


        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
