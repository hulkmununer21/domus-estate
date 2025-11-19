import { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Home, Users, FileText, DollarSign, Bell, User, LogOut, X, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import SEO from "@/components/SEO";
import logo from "@/assets/logo.png";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";

const NAV_LINKS = [
  { name: "Properties", icon: <Home className="h-4 w-4 mr-1" />, to: "/landlord-properties" },
  { name: "Messages", icon: <Bell className="h-4 w-4 mr-1" />, to: "/landlord-messages" },
  { name: "Schedules", icon: <Users className="h-4 w-4 mr-1" />, to: "/landlord-schedules" },
  
  { name: "Payments", icon: <DollarSign className="h-4 w-4 mr-1" />, to: "/landlord-payments" },
];

const LandlordPortal = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Notification popup state
  const [showNotifPopup, setShowNotifPopup] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const notifBtnRef = useRef<HTMLButtonElement>(null);

  // Profile modal state
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [editProfile, setEditProfile] = useState<any>(null);
  const [profileLoading, setProfileLoading] = useState(false);

  // Password change state
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Mobile nav state
  const [showMobileNav, setShowMobileNav] = useState(false);

  // Stats
  const [totalProperties, setTotalProperties] = useState(0);
  const [monthlyIncome, setMonthlyIncome] = useState(0);
  const [documentsCount, setDocumentsCount] = useState(0);

  // Properties list
  const [propertiesList, setPropertiesList] = useState<any[]>([]);

  // Recent payments
  const [recentPayments, setRecentPayments] = useState<any[]>([]);

  // Fetch notifications when popup is opened
  useEffect(() => {
    const fetchNotifications = async () => {
      if (!user?.id || !showNotifPopup) return;
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(10);
      if (!error && data) setNotifications(data);
    };
    fetchNotifications();
  }, [user, showNotifPopup]);

  // Fetch landlord profile when modal is opened
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user?.id || !showProfileModal) return;
      setProfileLoading(true);
      const { data, error } = await supabase
        .from("landlord_profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();
      if (!error && data) {
        setProfile(data);
        setEditProfile(data);
      }
      setProfileLoading(false);
    };
    fetchProfile();
  }, [user, showProfileModal]);

  // Fetch stats
  useEffect(() => {
    const fetchStats = async () => {
      if (!user?.id) return;

      // 1. Fetch properties
      const { data: properties } = await supabase
        .from("properties")
        .select("id")
        .eq("landlord_user_id", user.id);

      setTotalProperties(properties?.length || 0);

      // 2. Fetch units for these properties
      const propertyIds = (properties || []).map(p => p.id);
      let units: any[] = [];
      if (propertyIds.length > 0) {
        const { data: unitsData } = await supabase
          .from("property_units")
          .select("id")
          .in("property_id", propertyIds);
        units = unitsData || [];
      }

      // 3. Fetch active leases for these units
      const unitIds = units.map(u => u.id);
      let leases: any[] = [];
      if (unitIds.length > 0) {
        const { data: leasesData } = await supabase
          .from("leases")
          .select("rent_amount, signed_document_id")
          .in("unit_id", unitIds)
          .eq("status", "active");
        leases = leasesData || [];
      }

      // Monthly income
      const monthlyIncomeSum = leases.reduce(
        (sum, lease) => sum + (lease.rent_amount ? Number(lease.rent_amount) : 0),
        0
      );
      setMonthlyIncome(monthlyIncomeSum);

      // Documents: count signed documents for these leases
      const signedDocIds = leases
        .map(l => l.signed_document_id)
        .filter(Boolean);
      let docsCount = 0;
      if (signedDocIds.length > 0) {
        const { data: docs } = await supabase
          .from("assets")
          .select("id")
          .in("id", signedDocIds);
        docsCount = docs?.length || 0;
      }
      setDocumentsCount(docsCount);
    };

    fetchStats();
  }, [user]);

  // Fetch properties for landlord
  useEffect(() => {
    const fetchMyProperties = async () => {
      if (!user?.id) return;

      // 1. Fetch properties for landlord
      const { data: properties } = await supabase
        .from("properties")
        .select("id, title, address, city, postal_code")
        .eq("landlord_user_id", user.id);

      const propertyIds = (properties || []).map(p => p.id);

      // 2. Fetch property units for these properties
      let units: any[] = [];
      if (propertyIds.length > 0) {
        const { data: unitsData } = await supabase
          .from("property_units")
          .select("id, property_id, unit_label, rent_amount")
          .in("property_id", propertyIds);
        units = unitsData || [];
      }

      // 3. Fetch leases for these units
      const unitIds = units.map(u => u.id);
      let leases: any[] = [];
      if (unitIds.length > 0) {
        const { data: leasesData } = await supabase
          .from("leases")
          .select("unit_id, status")
          .in("unit_id", unitIds);
        leases = leasesData || [];
      }

      // 4. Merge and mark status
      const propertiesList = units.map(unit => {
        const property = properties.find(p => p.id === unit.property_id);
        const lease = leases.find(l => l.unit_id === unit.id && l.status === "active");
        return {
          name: property?.title || unit.unit_label,
          location: property
            ? `${property.address}, ${property.city || ""} ${property.postal_code || ""}`
            : "",
          rent: unit.rent_amount ? `£${unit.rent_amount}/mo` : "N/A",
          status: lease ? "Occupied" : "Available",
          image:
            "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=200", // Placeholder, replace with real image if available
        };
      });

      setPropertiesList(propertiesList);
    };

    fetchMyProperties();
  }, [user]);

  // Fetch recent payments
  useEffect(() => {
    const fetchRecentPayments = async () => {
      if (!user?.id) return;

      // 1. Fetch properties for landlord
      const { data: properties } = await supabase
        .from("properties")
        .select("id, title")
        .eq("landlord_user_id", user.id);

      const propertyIds = (properties || []).map(p => p.id);

      // 2. Fetch property units for these properties
      let units: any[] = [];
      if (propertyIds.length > 0) {
        const { data: unitsData } = await supabase
          .from("property_units")
          .select("id, property_id, unit_label")
          .in("property_id", propertyIds);
        units = unitsData || [];
      }

      // 3. Fetch leases for these units (limit to recent 10)
      const unitIds = units.map(u => u.id);
      let leases: any[] = [];
      if (unitIds.length > 0) {
        const { data: leasesData } = await supabase
          .from("leases")
          .select("unit_id, lodger_user_id, rent_amount, start_date, end_date, updated_at")
          .in("unit_id", unitIds)
          .order("updated_at", { ascending: false })
          .limit(10);
        leases = leasesData || [];
      }

      // 4. Fetch lodger profiles for these leases
      const lodgerIds = Array.from(new Set(leases.map(l => l.lodger_user_id).filter(Boolean)));
      let lodgers: any[] = [];
      if (lodgerIds.length > 0) {
        const { data: lodgerData } = await supabase
          .from("lodger_profiles")
          .select("user_id, first_name, last_name")
          .in("user_id", lodgerIds);
        lodgers = lodgerData || [];
      }

      // 5. Merge data for display
      const payments = leases.map(lease => {
        const unit = units.find(u => u.id === lease.unit_id);
        const property = properties.find(p => p.id === unit?.property_id);
        const lodger = lodgers.find(l => l.user_id === lease.lodger_user_id);
        return {
          lodger: lodger ? `${lodger.first_name} ${lodger.last_name}` : "Unknown",
          property: property?.title || unit?.unit_label || "Unknown",
          amount: lease.rent_amount ? `£${lease.rent_amount}` : "N/A",
          date: lease.updated_at
            ? new Date(lease.updated_at).toLocaleDateString()
            : lease.start_date
            ? new Date(lease.start_date).toLocaleDateString()
            : "",
        };
      });

      setRecentPayments(payments);
    };

    fetchRecentPayments();
  }, [user]);

  // Close notification popup when clicking outside
  useEffect(() => {
    if (!showNotifPopup) return;
    const handleClick = (e: MouseEvent) => {
      if (
        notifBtnRef.current &&
        !notifBtnRef.current.contains(e.target as Node) &&
        !(document.getElementById("notif-popup")?.contains(e.target as Node))
      ) {
        setShowNotifPopup(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [showNotifPopup]);

  // Handle profile update
  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileLoading(true);
    const { error } = await supabase
      .from("landlord_profiles")
      .update({
        first_name: editProfile.first_name,
        last_name: editProfile.last_name,
        phone_number: editProfile.phone_number,
        company_name: editProfile.company_name,
        registration_no: editProfile.registration_no,
        tax_id: editProfile.tax_id,
      })
      .eq("user_id", user.id);
    setProfileLoading(false);
    if (error) {
      toast.error("Failed to update profile.");
    } else {
      toast.success("Profile updated!");
      setProfile(editProfile);
      setShowProfileModal(false);
    }
  };

  // Handle password change
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordLoading(true);
    // Re-authenticate user
    const { error: loginError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: oldPassword,
    });
    if (loginError) {
      toast.error("Old password is incorrect.");
      setPasswordLoading(false);
      return;
    }
    // Update password
    const { error: pwError } = await supabase.auth.updateUser({
      password: newPassword,
    });
    setPasswordLoading(false);
    if (pwError) {
      toast.error("Failed to change password.");
    } else {
      toast.success("Password changed!");
      setShowPasswordForm(false);
      setOldPassword("");
      setNewPassword("");
    }
  };

  return (
    <>
      <SEO
        title="Landlord Portal - Domus Servitia"
        description="Manage your property portfolio, view income reports, monitor lodger payments, schedule maintenance, and access important documents."
        canonical="https://domusservitia.co.uk/landlord-portal"
      />
      <div className="min-h-screen bg-muted/30">
        {/* Header */}
        <header className="bg-card border-b border-border sticky top-0 z-50 shadow-sm">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between h-16 relative">
              <img src={logo} alt="Domus Servitia" className="h-10 rounded-lg" />
              {/* Desktop Navigation */}
              <nav className="hidden md:flex gap-2">
                {NAV_LINKS.map(link => (
                  <Button
                    key={link.name}
                    variant="ghost"
                    className="flex items-center gap-1 px-2"
                    onClick={() => navigate(link.to)}
                  >
                    {link.icon}
                    <span className="hidden sm:inline">{link.name}</span>
                  </Button>
                ))}
              </nav>
              {/* Mobile Navigation Button */}
              <div className="md:hidden flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowMobileNav(v => !v)}
                  aria-label="Open navigation"
                >
                  <Menu className="h-6 w-6" />
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Button
                    ref={notifBtnRef}
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowNotifPopup((v) => !v)}
                    aria-label="Show notifications"
                  >
                    <Bell className="h-5 w-5" />
                  </Button>
                  {showNotifPopup && (
                    <div
                      id="notif-popup"
                      className="absolute right-0 mt-2 w-80 bg-card border border-border rounded-lg shadow-lg z-50"
                    >
                      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                        <span className="font-semibold text-base">Notifications</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setShowNotifPopup(false)}
                          aria-label="Close"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="max-h-96 overflow-y-auto px-4 py-2">
                        {notifications.length === 0 ? (
                          <div className="text-sm text-muted-foreground py-6 text-center">
                            No notifications yet.
                          </div>
                        ) : (
                          notifications.map((note, idx) => (
                            <div
                              key={idx}
                              className="py-3 border-b border-border last:border-0"
                            >
                              <div className="font-medium text-sm mb-1">{note.title}</div>
                              <div className="text-xs text-muted-foreground mb-1">{note.body}</div>
                              <div className="text-[10px] text-muted-foreground">
                                {new Date(note.created_at).toLocaleString()}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowProfileModal(true)}
                  aria-label="Show profile"
                >
                  <User className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" onClick={logout}>
                  <LogOut className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
          {/* Mobile Navigation Drawer */}
          {showMobileNav && (
            <div className="fixed inset-0 z-50 bg-black/40 md:hidden" onClick={() => setShowMobileNav(false)}>
              <nav
                className="absolute top-0 right-0 w-64 h-full bg-card border-l border-border shadow-lg flex flex-col pt-8"
                onClick={e => e.stopPropagation()}
              >
                <div className="flex justify-end px-4">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowMobileNav(false)}
                    aria-label="Close navigation"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
                {NAV_LINKS.map(link => (
                  <Button
                    key={link.name}
                    variant="ghost"
                    className="flex items-center gap-2 px-4 py-3 justify-start text-lg"
                    onClick={() => {
                      setShowMobileNav(false);
                      navigate(link.to);
                    }}
                  >
                    {link.icon}
                    {link.name}
                  </Button>
                ))}
              </nav>
            </div>
          )}
        </header>

        {/* Profile Modal */}
        {showProfileModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
            <div className="bg-card rounded-lg shadow-lg w-full max-w-md relative">
              <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                <span className="font-semibold text-lg">Landlord Profile</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowProfileModal(false)}
                  aria-label="Close"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <div className="px-6 py-4">
                {profileLoading ? (
                  <div className="text-center py-8">Loading...</div>
                ) : (
                  <form onSubmit={handleProfileUpdate} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium">First Name</label>
                        <input
                          className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent transition"
                          value={editProfile?.first_name ?? ""}
                          onChange={e =>
                            setEditProfile({ ...editProfile, first_name: e.target.value })
                          }
                          required
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Last Name</label>
                        <input
                          className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent transition"
                          value={editProfile?.last_name ?? ""}
                          onChange={e =>
                            setEditProfile({ ...editProfile, last_name: e.target.value })
                          }
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Phone Number</label>
                      <input
                        className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent transition"
                        value={editProfile?.phone_number ?? ""}
                        onChange={e =>
                          setEditProfile({ ...editProfile, phone_number: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Company Name</label>
                      <input
                        className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent transition"
                        value={editProfile?.company_name ?? ""}
                        onChange={e =>
                          setEditProfile({ ...editProfile, company_name: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Registration No</label>
                      <input
                        className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent transition"
                        value={editProfile?.registration_no ?? ""}
                        onChange={e =>
                          setEditProfile({ ...editProfile, registration_no: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Tax ID</label>
                      <input
                        className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent transition"
                        value={editProfile?.tax_id ?? ""}
                        onChange={e =>
                          setEditProfile({ ...editProfile, tax_id: e.target.value })
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between mt-4">
                      <Button
                        type="submit"
                        className="bg-gradient-gold text-primary font-semibold"
                        disabled={profileLoading}
                      >
                        {profileLoading ? "Saving..." : "Save Changes"}
                      </Button>
                      <Button
                        variant="outline"
                        type="button"
                        onClick={() => setShowPasswordForm(v => !v)}
                      >
                        Change Password
                      </Button>
                    </div>
                  </form>
                )}
                {showPasswordForm && (
                  <form onSubmit={handlePasswordChange} className="mt-6 space-y-3">
                    <div>
                      <label className="text-sm font-medium">Old Password</label>
                      <input
                        className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent transition"
                        type="password"
                        value={oldPassword}
                        onChange={e => setOldPassword(e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">New Password</label>
                      <input
                        className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent transition"
                        type="password"
                        value={newPassword}
                        onChange={e => setNewPassword(e.target.value)}
                        required
                      />
                    </div>
                    <Button
                      type="submit"
                      className="bg-gradient-gold text-primary font-semibold w-full"
                      disabled={passwordLoading}
                    >
                      {passwordLoading ? "Changing..." : "Change Password"}
                    </Button>
                  </form>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="container mx-auto px-4 py-8">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="font-serif text-3xl font-bold text-foreground mb-2">
              Landlord Dashboard
            </h1>
            <p className="text-muted-foreground">
              Manage your properties and monitor performance
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <Card className="border-border">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      Total Properties
                    </p>
                    <p className="text-2xl font-bold text-foreground">{totalProperties}</p>
                  </div>
                  <div className="bg-accent/10 p-3 rounded-full">
                    <Home className="h-6 w-6 text-accent" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-border">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      Monthly Income
                    </p>
                    <p className="text-2xl font-bold text-foreground">£{monthlyIncome.toLocaleString()}</p>
                  </div>
                  <div className="bg-accent/10 p-3 rounded-full">
                    <DollarSign className="h-6 w-6 text-accent" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-border">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Documents</p>
                    <p className="text-2xl font-bold text-foreground">{documentsCount}</p>
                  </div>
                  <div className="bg-accent/10 p-3 rounded-full">
                    <FileText className="h-6 w-6 text-accent" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Grid */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-6">
              {/* Properties List */}
              <Card className="border-border">
                <CardHeader>
                  <CardTitle>My Properties</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {propertiesList.length === 0 ? (
                      <div className="text-sm text-muted-foreground py-6 text-center">
                        No properties found.
                      </div>
                    ) : (
                      propertiesList.map((property, index) => (
                        <div
                          key={index}
                          className="flex gap-4 p-4 border border-border rounded-lg hover:shadow-elegant transition-all"
                        >
                          <img
                            src={property.image}
                            alt={property.name}
                            className="w-24 h-24 object-cover rounded-lg"
                          />
                          <div className="flex-1">
                            <h3 className="font-semibold mb-1">{property.name}</h3>
                            <p className="text-sm text-muted-foreground mb-2">
                              {property.location}
                            </p>
                            <div className="flex items-center justify-between">
                              <span className="font-medium text-accent">
                                {property.rent}
                              </span>
                              <span
                                className={`text-xs px-2 py-1 rounded-full ${
                                  property.status === "Occupied"
                                    ? "bg-green-100 text-green-700"
                                    : "bg-yellow-100 text-yellow-700"
                                }`}
                              >
                                {property.status}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  <Button
                    variant="outline"
                    className="w-full mt-4"
                    onClick={() => navigate("/landlord-properties")}
                  >
                    View All Properties
                  </Button>
                </CardContent>
              </Card>

              {/* Recent Payments */}
              <Card className="border-border">
                <CardHeader>
                  <CardTitle>Recent Payments Received</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentPayments.length === 0 ? (
                      <div className="text-sm text-muted-foreground py-6 text-center">
                        No recent payments found.
                      </div>
                    ) : (
                      recentPayments.map((payment, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between py-3 border-b border-border last:border-0"
                        >
                          <div>
                            <p className="font-medium">{payment.lodger}</p>
                            <p className="text-sm text-muted-foreground">
                              {payment.property}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-green-600">
                              {payment.amount}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {payment.date}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Maintenance Updates */}
              

              {/* Quick Actions */}
              

              {/* Notifications */}
              <Card className="border-border">
                <CardHeader>
                  <CardTitle>Notifications</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {notifications.length === 0 ? (
                      <div className="text-sm text-muted-foreground py-6 text-center">
                        No notifications yet.
                      </div>
                    ) : (
                      notifications.map((note, idx) => (
                        <div
                          key={idx}
                          className="pb-3 border-b border-border last:border-0"
                        >
                          <p className="text-sm font-medium mb-1">{note.title}</p>
                          <p className="text-xs text-muted-foreground">{note.body}</p>
                          <div className="text-[10px] text-muted-foreground">
                            {new Date(note.created_at).toLocaleString()}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default LandlordPortal;
