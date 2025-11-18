import { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Home, CreditCard, FileText, MessageSquare, Bell, User, LogOut, X, Calendar, ClipboardList } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import SEO from "@/components/SEO";
import logo from "@/assets/logo.png";
import { supabase } from "@/lib/supabaseClient";

// Navigation options for Lodger Portal
const NAV_LINKS = [
  { name: "Leases", icon: <ClipboardList className="h-4 w-4 mr-1" />, to: "/lodger-leases" },
  { name: "Messages", icon: <MessageSquare className="h-4 w-4 mr-1" />, to: "/lodger-messages" },
  { name: "Schedules", icon: <Calendar className="h-4 w-4 mr-1" />, to: "/lodger-schedules" },
];

// Utility to calculate time before expiry
function getTimeBeforeExpiry(dueDate: string) {
  const now = new Date();
  const due = new Date(dueDate);
  const diffMs = due.getTime() - now.getTime();
  if (diffMs <= 0) return "Expired";
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  return `${diffDays} days, ${diffHours} hours`;
}

// PendingInvoices component
const PendingInvoices = ({ userId }: { userId: string }) => {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [units, setUnits] = useState<any>({});
  const [unitImages, setUnitImages] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInvoicesAndUnits = async () => {
      setLoading(true);
      // 1. Fetch invoices for this lodger
      const { data: invoiceRows } = await supabase
        .from("invoices")
        .select("*")
        .eq("issued_to_user_id", userId)
        .eq("status", "issued")
        .order("due_date", { ascending: true });

      setInvoices(invoiceRows || []);

      // 2. Fetch units for these invoices
      const unitIds = (invoiceRows || []).map(inv => inv.unit_id).filter(Boolean);
      let unitsMap: any = {};
      if (unitIds.length > 0) {
        const { data: unitRows } = await supabase
          .from("property_units")
          .select("*")
          .in("id", unitIds);
        unitRows?.forEach(u => {
          unitsMap[u.id] = u;
        });
      }
      setUnits(unitsMap);

      // 3. Fetch primary images for these units
      let imagesMap: any = {};
      if (unitIds.length > 0) {
        const { data: imageRows } = await supabase
          .from("property_unit_images")
          .select("unit_id, asset_id, is_primary")
          .in("unit_id", unitIds)
          .eq("is_primary", true);

        const assetIds = imageRows?.map(img => img.asset_id).filter(Boolean);
        let assetsMap: any = {};
        if (assetIds.length > 0) {
          const { data: assetRows } = await supabase
            .from("assets")
            .select("id, public_url")
            .in("id", assetIds);
          assetRows?.forEach(a => {
            assetsMap[a.id] = a.public_url;
          });
        }
        imageRows?.forEach(img => {
          imagesMap[img.unit_id] = assetsMap[img.asset_id] || "";
        });
      }
      setUnitImages(imagesMap);

      setLoading(false);
    };

    if (userId) fetchInvoicesAndUnits();
  }, [userId]);

  if (loading) {
    return (
      <Card className="border-border mb-6">
        <CardHeader>
          <CardTitle>Pending Invoices</CardTitle>
        </CardHeader>
        <CardContent>
          <div>Loading invoices...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border mb-6">
      <CardHeader>
        <CardTitle>Pending Invoices</CardTitle>
      </CardHeader>
      <CardContent>
        {invoices.length === 0 ? (
          <div>No pending invoices.</div>
        ) : (
          <div className="space-y-4">
            {invoices.map(inv => {
              const unit = units[inv.unit_id];
              const unitLabel = unit?.unit_label || "N/A";
              const unitImage = unitImages[inv.unit_id] ||
                "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400";
              return (
                <div key={inv.id} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                  <div className="flex items-center gap-4">
                    <img
                      src={unitImage}
                      alt={unitLabel}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <div>
                      <p className="font-medium">Invoice #{inv.number}</p>
                      <p className="text-sm text-muted-foreground">{inv.notes}</p>
                      <p className="text-xs text-muted-foreground">
                        Unit: <span className="font-semibold">{unitLabel}</span>
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Due: {new Date(inv.due_date).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-accent">
                        Time before expiry: {getTimeBeforeExpiry(inv.due_date)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-lg">
                      £{inv.total} {inv.currency}
                    </p>
                    <Button className="mt-2 bg-gradient-gold text-primary font-semibold">
                      Pay Now
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const LodgerPortal = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Notification popup state
  const [showNotifPopup, setShowNotifPopup] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const notifBtnRef = useRef<HTMLButtonElement>(null);

  // Mobile nav state
  const [showMobileNav, setShowMobileNav] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user?.id) return;
      const { data, error } = await supabase
        .from("lodger_profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();
      if (!error && data) setProfile(data);
      setLoading(false);
    };
    fetchProfile();
  }, [user]);

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

  // Close popup when clicking outside
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

  return (
    <>
      <SEO
        title="Lodger Portal - Domus Servitia"
        description="Access your lodger dashboard to manage rent payments, view property details, submit complaints, and communicate with property management."
        canonical="https://domusservitia.co.uk/lodger-portal"
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
                  <Home className="h-6 w-6" />
                </Button>
              </div>
              <div className="flex items-center gap-4">
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
                <Button variant="ghost" size="icon">
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

        <div className="container mx-auto px-4 py-8">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="font-serif text-3xl font-bold text-foreground mb-2">
              {loading
                ? "Loading..."
                : profile
                ? `Welcome back, ${profile.first_name || user?.email.split("@")[0]}!`
                : "Welcome back!"}
            </h1>
            <p className="text-muted-foreground">
              Manage your lodging, payments, and communications
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <Card className="border-border">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Current Rent</p>
                    <p className="text-2xl font-bold text-foreground">
                      {profile?.current_rent ? `£${profile.current_rent}/mo` : "£750/mo"}
                    </p>
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
                    <p className="text-sm text-muted-foreground mb-1">Next Payment</p>
                    <p className="text-2xl font-bold text-foreground">
                      {profile?.next_payment_due_in_days
                        ? `${profile.next_payment_due_in_days} days`
                        : "15 days"}
                    </p>
                  </div>
                  <div className="bg-accent/10 p-3 rounded-full">
                    <CreditCard className="h-6 w-6 text-accent" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Documents</p>
                    <p className="text-2xl font-bold text-foreground">
                      {profile?.documents_count ?? 8}
                    </p>
                  </div>
                  <div className="bg-accent/10 p-3 rounded-full">
                    <FileText className="h-6 w-6 text-accent" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Messages</p>
                    <p className="text-2xl font-bold text-foreground">
                      {profile?.messages_count ?? 3}
                    </p>
                  </div>
                  <div className="bg-accent/10 p-3 rounded-full">
                    <MessageSquare className="h-6 w-6 text-accent" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Grid */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-6">
              {/* Pending Invoices Section with real data */}
              <PendingInvoices userId={user?.id ?? ""} />

              {/* Property Details */}
              <Card className="border-border">
                <CardHeader>
                  <CardTitle>My Property</CardTitle>
                </CardHeader>
                <CardContent>
                  {profile?.property_unit_id ? (
                    <PropertyDetails propertyUnitId={profile.property_unit_id} />
                  ) : (
                    <div>No property assigned yet.</div>
                  )}
                </CardContent>
              </Card>

              {/* Recent Payments */}
              <Card className="border-border">
                <CardHeader>
                  <CardTitle>Recent Payments</CardTitle>
                </CardHeader>
                <CardContent>
                  <RecentPayments userId={user?.id ?? ""} />
                  <Button variant="outline" className="w-full mt-4">
                    View All Payments
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Quick Actions */}
              <Card className="border-border">
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full bg-gradient-gold text-primary font-semibold">
                    <CreditCard className="h-4 w-4 mr-2" />
                    Pay Rent
                  </Button>
                  <Button variant="outline" className="w-full">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Submit Complaint
                  </Button>
                  <Button variant="outline" className="w-full">
                    <FileText className="h-4 w-4 mr-2" />
                    View Documents
                  </Button>
                </CardContent>
              </Card>

              {/* Notifications */}
              <Card className="border-border">
                <CardHeader>
                  <CardTitle>Notifications</CardTitle>
                </CardHeader>
                <CardContent>
                  <Notifications userId={user?.id ?? ""} />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

// Fetch and display property details
const PropertyDetails = ({ propertyUnitId }: { propertyUnitId: string }) => {
  const [property, setProperty] = useState<any>(null);

  useEffect(() => {
    const fetchProperty = async () => {
      const { data, error } = await supabase
        .from("property_units")
        .select("*")
        .eq("id", propertyUnitId)
        .single();
      if (!error && data) setProperty(data);
    };
    if (propertyUnitId) fetchProperty();
  }, [propertyUnitId]);

  if (!property) return <div>Loading property...</div>;

  return (
    <div className="flex gap-4">
      <img
        src={property.image_url || "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400"}
        alt="Property"
        className="w-32 h-32 object-cover rounded-lg"
      />
      <div className="flex-1">
        <h3 className="font-semibold text-lg mb-2">
          {property.name || "Modern City Centre Studio"}
        </h3>
        <p className="text-sm text-muted-foreground mb-2">
          {property.address || "Manchester City Centre, M1 1AA"}
        </p>
        <div className="flex gap-4 text-sm">
          <span>{property.bedrooms ?? 1} Bed</span>
          <span>{property.bathrooms ?? 1} Bath</span>
          <span>{property.size_sqft ?? 450} sqft</span>
        </div>
      </div>
    </div>
  );
};

// Fetch and display recent payments
const RecentPayments = ({ userId }: { userId: string }) => {
  const [payments, setPayments] = useState<any[]>([]);

  useEffect(() => {
    const fetchPayments = async () => {
      const { data, error } = await supabase
        .from("payments")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(3);
      if (!error && data) setPayments(data);
    };
    if (userId) fetchPayments();
  }, [userId]);

  if (!payments.length) return <div>No payments found.</div>;

  return (
    <div className="space-y-4">
      {payments.map((payment, index) => (
        <div
          key={index}
          className="flex items-center justify-between py-3 border-b border-border last:border-0"
        >
          <div>
            <p className="font-medium">{new Date(payment.created_at).toLocaleDateString()}</p>
            <p className="text-sm text-muted-foreground">
              {payment.description || "Monthly Rent"}
            </p>
          </div>
          <div className="text-right">
            <p className="font-semibold">£{payment.amount}</p>
            <p className={`text-sm ${payment.status === "Paid" ? "text-green-600" : "text-red-600"}`}>
              {payment.status}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

// Fetch and display notifications
const Notifications = ({ userId }: { userId: string }) => {
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    const fetchNotifications = async () => {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(5);
      if (!error && data) setNotifications(data);
    };
    if (userId) fetchNotifications();
  }, [userId]);

  if (!notifications.length) return <div>No notifications yet.</div>;

  return (
    <div className="space-y-4">
      {notifications.map((note, idx) => (
        <div key={idx} className="pb-3 border-b border-border last:border-0">
          <p className="text-sm font-medium mb-1">{note.title}</p>
          <p className="text-xs text-muted-foreground">{note.body}</p>
        </div>
      ))}
    </div>
  );
};

export default LodgerPortal;
// filepath: /home/hulkmununer/domus/src/pages/LodgerPortal.tsx