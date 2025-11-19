import { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Home, CreditCard, FileText, MessageSquare, Bell, User, LogOut, X, Calendar, ClipboardList } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import SEO from "@/components/SEO";
import logo from "@/assets/logo.png";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";
import { useForm } from "react-hook-form";

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

// Utility to generate a random reference string
function generatePaymentReference(length = 16) {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let ref = "";
  for (let i = 0; i < length; i++) {
    ref += chars[Math.floor(Math.random() * chars.length)];
  }
  return ref;
}

// Simulated Payment Modal
const SimulatedPaymentModal = ({
  open,
  onClose,
  invoice,
  unit,
  userId,
  refreshInvoices,
}) => {
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);

    // 1. Update invoice status to 'paid'
    await supabase
      .from("invoices")
      .update({ status: "paid", updated_at: new Date().toISOString() })
      .eq("id", invoice.id);

    // 2. Insert into payments table
    const reference = generatePaymentReference();
    await supabase.from("payments").insert([
      {
        invoice_id: invoice.id,
        user_id: userId,
        amount: invoice.total,
        currency: invoice.currency,
        payment_method: "card",
        status: "successful",
        paid_at: new Date().toISOString(),
        reference,
        created_at: new Date().toISOString(),
      },
    ]);

    // 3. Insert into leases table (if not exists)
    await supabase.from("leases").insert([
      {
        unit_id: invoice.unit_id,
        status: "pending_signature",
        start_date: new Date().toISOString().slice(0, 10),
        rent_amount: invoice.subtotal,
        rent_currency: invoice.currency,
        lodger_user_id: userId,
        invoice_id: invoice.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ]);

    // 4. Insert notification for the lodger
    await supabase.from("notifications").insert([
      {
        user_id: userId,
        type: "lease",
        title: "Lease Process Started",
        body: "We have received your payment. Your property will be ready as soon as we link an agreement document to your rented property.",
        channel: "web",
        sent_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
      },
    ]);

    setLoading(false);
    setSuccess(true);
    toast.success("Payment successful!");
    refreshInvoices();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {success ? "Payment Successful" : `Pay Invoice #${invoice.number}`}
          </DialogTitle>
        </DialogHeader>
        {success ? (
          <div className="text-center">
            <p className="mb-4">Your payment was successful!</p>
            <Button onClick={onClose}>Close</Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <p className="font-semibold mb-1">Amount: £{invoice.total} {invoice.currency}</p>
              <p className="text-sm mb-1">Unit: {unit?.unit_label}</p>
              <p className="text-sm mb-1">Due Date: {invoice.due_date}</p>
            </div>
            <Input
              required
              placeholder="Card Number"
              value={cardNumber}
              onChange={e => setCardNumber(e.target.value)}
              maxLength={19}
            />
            <div className="flex gap-2">
              <Input
                required
                placeholder="MM/YY"
                value={expiry}
                onChange={e => setExpiry(e.target.value)}
                maxLength={5}
              />
              <Input
                required
                placeholder="CVC"
                value={cvc}
                onChange={e => setCvc(e.target.value)}
                maxLength={4}
              />
            </div>
            <Input
              required
              placeholder="Name on Card"
              value={name}
              onChange={e => setName(e.target.value)}
            />
            <Button type="submit" disabled={loading}>
              {loading ? "Processing..." : "Submit Payment"}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

// PendingInvoices component with payment modal
const PendingInvoices = ({ userId }: { userId: string }) => {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [units, setUnits] = useState<any>({});
  const [unitImages, setUnitImages] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [payModalOpen, setPayModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);

  useEffect(() => {
    fetchInvoicesAndUnits();
    // eslint-disable-next-line
  }, [userId]);

  const fetchInvoicesAndUnits = async () => {
    setLoading(true);
    const { data: invoiceRows } = await supabase
      .from("invoices")
      .select("*")
      .eq("issued_to_user_id", userId)
      .eq("status", "issued")
      .order("due_date", { ascending: true });

    setInvoices(invoiceRows || []);

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

  const handlePayNow = (invoice: any) => {
    setSelectedInvoice(invoice);
    setPayModalOpen(true);
  };

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
    <>
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
                      <Button
                        className="mt-2 bg-gradient-gold text-primary font-semibold"
                        onClick={() => handlePayNow(inv)}
                      >
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
      {payModalOpen && selectedInvoice && (
        <SimulatedPaymentModal
          open={payModalOpen}
          onClose={() => {
            setPayModalOpen(false);
            setSelectedInvoice(null);
          }}
          invoice={selectedInvoice}
          unit={units[selectedInvoice.unit_id]}
          userId={userId}
          refreshInvoices={fetchInvoicesAndUnits}
        />
      )}
    </>
  );
};

const LodgerPortal = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  // Quick stats
  const [activeLease, setActiveLease] = useState<any>(null);
  const [nextPaymentDays, setNextPaymentDays] = useState<number | null>(null);
  const [documentsCount, setDocumentsCount] = useState<number>(0);

  // Notification popup state
  const [showNotifPopup, setShowNotifPopup] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const notifBtnRef = useRef<HTMLButtonElement>(null);

  // Mobile nav state
  const [showMobileNav, setShowMobileNav] = useState(false);

  // Profile modal state
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileEditMode, setProfileEditMode] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordMode, setPasswordMode] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [profile, setProfile] = useState<any>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors }
  } = useForm();

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user?.id) return;
      const { data } = await supabase
        .from("lodger_profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();
      if (data) {
        setProfile(data);
        reset(data);
      } else {
        // If no profile, set defaults for insert
        reset({
          email: user?.email || "",
          first_name: "",
          last_name: "",
          phone_number: "",
          dob: "",
          employment_status: "",
          emergency_contact_name: "",
          emergency_contact_phone: "",
          notes: "",
        });
      }
    };
    fetchProfile();
  }, [user, reset]);

  // Insert or update profile
  const handleProfileSave = async (data: any) => {
    setProfileLoading(true);
    let result;
    if (profile) {
      // Update
      result = await supabase
        .from("lodger_profiles")
        .update({
          first_name: data.first_name,
          last_name: data.last_name,
          phone_number: data.phone_number,
          dob: data.dob,
          employment_status: data.employment_status,
          emergency_contact_name: data.emergency_contact_name,
          emergency_contact_phone: data.emergency_contact_phone,
          notes: data.notes,
        })
        .eq("user_id", user.id);
    } else {
      // Insert
      result = await supabase
        .from("lodger_profiles")
        .insert([{
          user_id: user.id,
          email: user.email,
          first_name: data.first_name,
          last_name: data.last_name,
          phone_number: data.phone_number,
          dob: data.dob,
          employment_status: data.employment_status,
          emergency_contact_name: data.emergency_contact_name,
          emergency_contact_phone: data.emergency_contact_phone,
          notes: data.notes,
        }]);
    }
    if (!result.error) {
      toast.success("Profile updated successfully!");
      setProfileEditMode(false);
      setShowProfileModal(false);
      // Refresh profile
      const { data: newProfile } = await supabase
        .from("lodger_profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();
      setProfile(newProfile);
      reset(newProfile);
    } else {
      toast.error("Failed to update profile.");
    }
    setProfileLoading(false);
  };

  // Password change handler
  const handlePasswordChange = async (data: any) => {
    setPasswordLoading(true);
    setPasswordError("");
    setPasswordSuccess("");
    if (data.new_password !== data.confirm_password) {
      setPasswordError("New passwords do not match.");
      setPasswordLoading(false);
      return;
    }
    // Re-authenticate user with old password
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: data.old_password,
    });
    if (signInError) {
      setPasswordError("Old password is incorrect.");
      setPasswordLoading(false);
      return;
    }
    // Update password
    const { error: updateError } = await supabase.auth.updateUser({
      password: data.new_password,
    });
    if (updateError) {
      setPasswordError("Failed to update password.");
    } else {
      setPasswordSuccess("Password updated successfully!");
      setPasswordMode(false);
    }
    setPasswordLoading(false);
  };

  useEffect(() => {
    const fetchLeaseStats = async () => {
      if (!user?.id) return;

      // 1. Fetch active lease for current rent
      const { data: leaseRows } = await supabase
        .from("leases")
        .select("*")
        .eq("lodger_user_id", user.id);

      // Find active lease
      const active = (leaseRows || []).find(l => l.status === "active");
      setActiveLease(active || null);

      // 2. Calculate next payment days (days between start_date and end_date)
      if (active && active.start_date && active.end_date) {
        const start = new Date(active.start_date);
        const end = new Date(active.end_date);
        const diffMs = end.getTime() - start.getTime();
        const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
        setNextPaymentDays(diffDays);
      } else {
        setNextPaymentDays(null);
      }

      // 3. Count documents: leases with signed_at and signed_document_id
      const docsCount = (leaseRows || []).filter(
        l => l.signed_at && l.signed_document_id
      ).length;
      setDocumentsCount(docsCount);
    };
    fetchLeaseStats();
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

  // Logout function
  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

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
                <Button variant="ghost" size="icon" onClick={() => setShowProfileModal(true)}>
                  <User className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" onClick={handleLogout}>
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
                      {activeLease
                        ? `£${activeLease.rent_amount}/${activeLease.rent_currency || "GBP"}`
                        : "Not available"}
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
                      {nextPaymentDays !== null
                        ? `${nextPaymentDays} days`
                        : "Not available"}
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
                      {documentsCount}
                    </p>
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
              {/* Pending Invoices Section with real data */}
              <PendingInvoices userId={user?.id ?? ""} />

              {/* Property Details - show all leases for lodger */}
              <Card className="border-border">
                <CardHeader>
                  <CardTitle>My Properties</CardTitle>
                </CardHeader>
                <CardContent>
                  <LodgerProperties lodgerUserId={user?.id ?? ""} />
                </CardContent>
              </Card>

              {/* Recent Payments - scrollable */}
              <Card className="border-border">
                <CardHeader>
                  <CardTitle>Recent Payments</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollablePayments userId={user?.id ?? ""} />
                </CardContent>
              </Card>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Quick Actions - only submit complaint */}
              <Card className="border-border">
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Link to="/lodger-messages">
                    <Button variant="outline" className="w-full">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Submit Complaint
                    </Button>
                  </Link>
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

      {/* Profile Modal */}
      <Dialog open={showProfileModal} onOpenChange={setShowProfileModal}>
        <DialogContent className="max-w-md w-full p-0">
          <DialogHeader>
            <DialogTitle>
              {passwordMode ? "Change Password" : profileEditMode ? "Edit Profile" : "User Profile"}
            </DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4"
              onClick={() => {
                setShowProfileModal(false);
                setProfileEditMode(false);
                setPasswordMode(false);
                setPasswordError("");
                setPasswordSuccess("");
              }}
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </Button>
          </DialogHeader>
          <div className="p-2 max-h-[70vh] overflow-y-auto transition-all">
            {!passwordMode ? (
              <form
                className="space-y-4"
                onSubmit={handleSubmit(handleProfileSave)}
              >
                <div>
                  <label className="block mb-1 font-medium">Email</label>
                  <Input
                    type="email"
                    {...register("email")}
                    value={user?.email || ""}
                    readOnly
                    className="bg-muted"
                  />
                </div>
                <div>
                  <label className="block mb-1 font-medium">First Name</label>
                  <Input
                    {...register("first_name", { required: true })}
                    disabled={!profileEditMode}
                  />
                </div>
                <div>
                  <label className="block mb-1 font-medium">Last Name</label>
                  <Input
                    {...register("last_name", { required: true })}
                    disabled={!profileEditMode}
                  />
                </div>
                <div>
                  <label className="block mb-1 font-medium">Phone Number</label>
                  <Input
                    {...register("phone_number")}
                    disabled={!profileEditMode}
                  />
                </div>
                <div>
                  <label className="block mb-1 font-medium">Date of Birth</label>
                  <Input
                    type="date"
                    {...register("dob")}
                    disabled={!profileEditMode}
                  />
                </div>
                <div>
                  <label className="block mb-1 font-medium">Employment Status</label>
                  <Input
                    {...register("employment_status")}
                    disabled={!profileEditMode}
                  />
                </div>
                <div>
                  <label className="block mb-1 font-medium">Emergency Contact Name</label>
                  <Input
                    {...register("emergency_contact_name")}
                    disabled={!profileEditMode}
                  />
                </div>
                <div>
                  <label className="block mb-1 font-medium">Emergency Contact Phone</label>
                  <Input
                    {...register("emergency_contact_phone")}
                    disabled={!profileEditMode}
                  />
                </div>
                <div>
                  <label className="block mb-1 font-medium">Notes</label>
                  <Input
                    {...register("notes")}
                    disabled={!profileEditMode}
                  />
                </div>
                <div className="flex gap-2 justify-end sticky bottom-0 bg-card py-2">
                  {!profileEditMode ? (
                    <>
                      <Button
                        variant="outline"
                        type="button"
                        onClick={() => setPasswordMode(true)}
                      >
                        Change Password
                      </Button>
                      <Button
                        variant="default"
                        type="button"
                        onClick={() => setProfileEditMode(true)}
                      >
                        {profile ? "Edit" : "Create"}
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        variant="outline"
                        type="button"
                        onClick={() => {
                          setProfileEditMode(false);
                          reset(profile || {});
                        }}
                        disabled={profileLoading}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={profileLoading}
                      >
                        {profileLoading ? "Saving..." : profile ? "Update" : "Create"}
                      </Button>
                    </>
                  )}
                </div>
              </form>
            ) : (
              <form
                className="space-y-4"
                onSubmit={handleSubmit(handlePasswordChange)}
              >
                <div>
                  <label className="block mb-1 font-medium">Old Password</label>
                  <Input
                    type="password"
                    {...register("old_password", { required: true })}
                  />
                </div>
                <div>
                  <label className="block mb-1 font-medium">New Password</label>
                  <Input
                    type="password"
                    {...register("new_password", { required: true })}
                  />
                </div>
                <div>
                  <label className="block mb-1 font-medium">Confirm New Password</label>
                  <Input
                    type="password"
                    {...register("confirm_password", { required: true })}
                  />
                </div>
                {passwordError && (
                  <div className="text-red-600 text-sm">{passwordError}</div>
                )}
                {passwordSuccess && (
                  <div className="text-green-600 text-sm">{passwordSuccess}</div>
                )}
                <div className="flex gap-2 justify-end sticky bottom-0 bg-card py-2">
                  <Button
                    variant="outline"
                    type="button"
                    onClick={() => {
                      setPasswordMode(false);
                      setPasswordError("");
                      setPasswordSuccess("");
                    }}
                    disabled={passwordLoading}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={passwordLoading}>
                    {passwordLoading ? "Updating..." : "Update Password"}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

// Fetch and display all properties linked to the lodger (all leases)
const LodgerProperties = ({ lodgerUserId }: { lodgerUserId: string }) => {
  const [leases, setLeases] = useState<any[]>([]);
  const [units, setUnits] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeasesAndUnits = async () => {
      const { data: leaseRows } = await supabase
        .from("leases")
        .select("*")
        .eq("lodger_user_id", lodgerUserId);
      setLeases(leaseRows || []);
      const unitIds = (leaseRows || []).map(l => l.unit_id).filter(Boolean);
      let unitsMap: any = {};
      if (unitIds.length > 0) {
        const { data: unitRows } = await supabase
          .from("property_units")
          .select("*")
          .in("id", unitIds);
        unitRows?.forEach(u => { unitsMap[u.id] = u; });
      }
      setUnits(unitsMap);
      setLoading(false);
    };
    if (lodgerUserId) fetchLeasesAndUnits();
  }, [lodgerUserId]);

  if (loading) return <div>Loading properties...</div>;
  if (!leases.length) return <div>No properties found.</div>;

  return (
    <div className="space-y-4">
      {leases.map(lease => {
        const unit = units[lease.unit_id];
        return (
          <div key={lease.id} className="flex gap-4 items-center border-b pb-4">
            <img
              src={unit?.image_url || "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400"}
              alt={unit?.unit_label || "Unit"}
              className="w-20 h-20 object-cover rounded-lg"
            />
            <div>
              <div className="font-semibold">{unit?.unit_label || "N/A"}</div>
              <div className="text-sm text-muted-foreground">{unit?.unit_description || "No description"}</div>
              <div className="text-xs text-muted-foreground">
                {unit?.bedrooms ?? 1} Bed, {unit?.bathrooms ?? 1} Bath, {unit?.area_sqft ?? 450} sqft
              </div>
              <div className="text-sm mt-1">
                <span className="font-semibold">Lease Status:</span>{" "}
                <span className="px-2 py-1 rounded bg-muted-foreground/10">{lease.status}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

// Fetch and display all payments, scrollable
const ScrollablePayments = ({ userId }: { userId: string }) => {
  const [payments, setPayments] = useState<any[]>([]);
  useEffect(() => {
    const fetchPayments = async () => {
      const { data } = await supabase
        .from("payments")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
      setPayments(data || []);
    };
    if (userId) fetchPayments();
  }, [userId]);
  if (!payments.length) return <div>No payments found.</div>;
  return (
    <div style={{ maxHeight: 300, overflowY: "auto" }}>
      {payments.map((payment, idx) => (
        <div key={idx} className="flex items-center justify-between py-3 border-b border-border last:border-0">
          <div>
            <p className="font-medium">{new Date(payment.created_at).toLocaleDateString()}</p>
            <p className="text-sm text-muted-foreground">{payment.description || "Monthly Rent"}</p>
          </div>
          <div className="text-right">
            <p className="font-semibold">£{payment.amount}</p>
            <p className={`text-sm ${payment.status === "Paid" ? "text-green-600" : "text-red-600"}`}>{payment.status}</p>
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