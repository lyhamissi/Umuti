import { Toaster } from "./components/ui/toaster";
import { Toaster as Sonner } from "./components/ui/sonner";
import { TooltipProvider } from "./components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { LanguageProvider } from "./components/LanguageSwitcher";
import { AuthProvider } from "./components/AuthProvider";
import ProtectedRoute from "./components/ProtectedRoute";
import Index from "./pages/Index";
import Search from "./pages/Search";
import Login from "./pages/Login";
import Register from "./pages/Register";
import About from "./pages/About";
import ForgotPassword from "./pages/ForgotPassword";
import PharmacyRegister from "./pages/PharmacyRegister";
import VerifyEmail from "./pages/VerifyEmail";
import PharmacyDashboard from "./pages/pharmacy/Dashboard";
import PharmacyMedicines from "./pages/pharmacy/Medicines";
import PharmacyProfile from "./pages/pharmacy/Profile";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminApplications from "./pages/admin/Applications";
import AdminPharmacies from "./pages/admin/Pharmacies";
import AdminProfile from "./pages/admin/Profile";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();
const App = () => (
  <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
    <LanguageProvider>
      <AuthProvider>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Index />} />
                <Route path="/search" element={<Search />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/pharmacy/register" element={<PharmacyRegister />} />
                <Route path="/verify-email" element={<VerifyEmail />} />
                <Route path="/about" element={<About />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />

                {/* Protected Pharmacy Routes */}
                <Route path="/pharmacy/dashboard" element={
                  <ProtectedRoute allowedRoles={["pharmacy"]}>
                    <PharmacyDashboard />
                  </ProtectedRoute>
                } />
                <Route path="/pharmacy/medicines" element={
                  <ProtectedRoute allowedRoles={["pharmacy"]}>
                    <PharmacyMedicines />
                  </ProtectedRoute>
                } />
                <Route path="/pharmacy/profile" element={
                  <ProtectedRoute allowedRoles={["pharmacy"]}>
                    <PharmacyProfile />
                  </ProtectedRoute>
                } />

                {/* Protected Admin Routes */}
                <Route path="/admin/dashboard" element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <AdminDashboard />
                  </ProtectedRoute>
                } />
                <Route path="/admin/applications" element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <AdminApplications />
                  </ProtectedRoute>
                } />
                <Route path="/admin/pharmacies" element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <AdminPharmacies />
                  </ProtectedRoute>
                } />
                <Route path="/admin/profile" element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <AdminProfile />
                  </ProtectedRoute>
                } />

                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </QueryClientProvider>
      </AuthProvider>
    </LanguageProvider>
  </ThemeProvider>
);

export default App;
