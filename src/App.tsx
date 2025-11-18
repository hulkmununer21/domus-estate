import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import ScrollToTop from "./components/ScrollToTop";

import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Properties from "./pages/Properties";
import PropertyDetail from "./pages/PropertyDetail";
import About from "./pages/About";
import ServicesPage from "./pages/ServicesPage";
import LodgerPortal from "./pages/LodgerPortal";
import LodgerMessages from "./pages/LodgerMessages";
import LodgerLeases from "./pages/LodgerLeases";
import LandlordPortal from "./pages/LandlordPortal";
import LandlordProperties from "./pages/LandlordProperties";
import LandlordMessages from "./pages/LandlordMessages";
import StaffPortal from "./pages/StaffPortal";
import StaffMessaging from "./pages/StaffMessaging"; 
import AdminPortal from "./pages/AdminPortal";
import AdminLodgers from "./pages/AdminLodgers";
import AdminProperties from "./pages/AdminProperties";
import AdminUnits from "./pages/AdminUnits";
import AdminLandlords from "./pages/AdminLandlords";
import AdminStaff from "./pages/AdminStaff";
import AdminMessages from "./pages/AdminMessages";
import AdminRequests from "./pages/AdminRequests";
import AdminPayments from "./pages/AdminPayments";
import AdminDocuments from "./pages/AdminDocuments";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import Cookies from "./pages/Cookies";
import GDPR from "./pages/GDPR";
import FAQ from "./pages/FAQ";
import SubmitComplaint from "./pages/SubmitComplaint";
import ContactPage from "./pages/ContactPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ScrollToTop />
        <AuthProvider>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/properties" element={<Properties />} />
            <Route path="/property/:id" element={<PropertyDetail />} />
            <Route path="/about" element={<About />} />
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/cookies" element={<Cookies />} />
            <Route path="/gdpr" element={<GDPR />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/submit-complaint" element={<SubmitComplaint />} />
            <Route path="/contact" element={<ContactPage />} />

            {/* Lodger routes */}
            <Route
              path="/lodger-portal"
              element={
                <ProtectedRoute allowedRoles={["lodger"]}>
                  <LodgerPortal />
                </ProtectedRoute>
              }
            />
            <Route
              path="/lodger-messages"
              element={
                <ProtectedRoute allowedRoles={["lodger"]}>
                  <LodgerMessages />
                </ProtectedRoute>
              }
            />
            <Route
              path="/lodger-leases"
              element={
                <ProtectedRoute allowedRoles={["lodger"]}>
                  <LodgerLeases />
                </ProtectedRoute>
              }
            />  

            {/* Landlord routes */}
            <Route
              path="/landlord-portal"
              element={
                <ProtectedRoute allowedRoles={["landlord"]}>
                  <LandlordPortal />
                </ProtectedRoute>
              }
            />
            <Route
              path="/landlord-properties"
              element={
                <ProtectedRoute allowedRoles={["landlord"]}>
                  <LandlordProperties />
                </ProtectedRoute>
              }
            />
            <Route
              path="/landlord-messages"
              element={
                <ProtectedRoute allowedRoles={["landlord"]}>
                  <LandlordMessages />
                </ProtectedRoute>
              }
            />

            {/* Staff routes */}
            <Route
              path="/staff-portal"
              element={
                <ProtectedRoute allowedRoles={["staff"]}>
                  <StaffPortal />
                </ProtectedRoute>
              }
            />
            <Route
              path="/staff-messaging"
              element={
                <ProtectedRoute allowedRoles={["staff"]}>
                  <StaffMessaging />
                </ProtectedRoute>
              }
            />  

            {/* Admin routes */}
            <Route
              path="/admin-portal"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <AdminPortal />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin-units"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <AdminUnits />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin-properties"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <AdminProperties />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin-staff"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <AdminStaff />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin-lodgers"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <AdminLodgers />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin-landlords"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <AdminLandlords />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin-messages"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <AdminMessages />
                </ProtectedRoute>
              }
            />  
            <Route
              path="/admin-requests"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <AdminRequests />
                </ProtectedRoute>
              }
            /> 
            <Route
              path="/admin-payments"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <AdminPayments />
                </ProtectedRoute>
              }
            />     
            <Route
              path="/admin-documents"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <AdminDocuments />
                </ProtectedRoute>
              }
            />  

            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
