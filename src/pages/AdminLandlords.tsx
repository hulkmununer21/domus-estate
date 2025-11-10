import { useState, useEffect } from "react";
import {
  Users,
  ClipboardList,
  Settings,
  Search,
  Trash2,
  Mail,
  Eye,
  X,
  ShieldOff,
  Home,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import SEO from "@/components/SEO";
import logo from "@/assets/logo.png";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";

const AdminLandlords = () => {
  const [landlords, setLandlords] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [selectedLandlord, setSelectedLandlord] = useState<any>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    fetchLandlords();
  }, []);

  // Fetch landlords, their emails, and property count
  const fetchLandlords = async () => {
    const { data: landlordProfiles, error } = await supabase
      .from("landlord_profiles")
      .select(
        "user_id,first_name,last_name,phone_number,company_name,registration_no,tax_id,payout_details,created_at"
      );
    if (error || !landlordProfiles) {
      setLandlords([]);
      return;
    }
    // Get emails from auth.users
    const { data: authUsers } = await supabase
      .from("users")
      .select("id,email");
    // Get property ownerships
    const { data: propertyOwners } = await supabase
      .from("property_owners")
      .select("landlord_user_id");
    const landlordsWithDetails = landlordProfiles.map((landlord: any) => {
      const user = authUsers?.find((u: any) => u.id === landlord.user_id);
      const propertyCount = propertyOwners
        ? propertyOwners.filter((p: any) => p.landlord_user_id === landlord.user_id).length
        : 0;
      return {
        ...landlord,
        email: user?.email || "",
        propertyCount,
      };
    });
    setLandlords(landlordsWithDetails);
  };

  const filteredLandlords = landlords.filter(
    landlord =>
      `${landlord.first_name} ${landlord.last_name}`.toLowerCase().includes(search.toLowerCase()) ||
      landlord.email?.toLowerCase().includes(search.toLowerCase()) ||
      landlord.phone_number?.toLowerCase().includes(search.toLowerCase()) ||
      landlord.company_name?.toLowerCase().includes(search.toLowerCase())
  );

  // View Landlord Handler
  const openViewModal = (landlord: any) => {
    setSelectedLandlord(landlord);
    setShowViewModal(true);
  };

  // Delete Landlord Handler
  const handleDeleteLandlord = async (user_id: string) => {
    if (!window.confirm("Are you sure you want to delete this landlord?")) return;
    setFormLoading(true);
    try {
      const { error } = await supabase.from("landlord_profiles").delete().eq("user_id", user_id);
      if (error) throw new Error(error.message);

      toast.success("Landlord deleted!");
      fetchLandlords();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setFormLoading(false);
    }
  };

  // Disable Landlord Handler (placeholder)
  const handleDisableLandlord = (landlord: any) => {
    toast.info(`Disable feature for ${landlord.first_name} will be implemented soon.`);
  };

  // Message Landlord Handler (placeholder)
  const handleMessageLandlord = (landlord: any) => {
    toast.info(`Messaging feature for ${landlord.first_name} will be implemented soon.`);
  };

  // List Properties Handler (placeholder)
  const handleListProperties = (landlord: any) => {
    toast.info(`List properties feature for ${landlord.first_name} will be implemented soon.`);
  };

  return (
    <>
      <SEO
        title="Admin Landlords - Domus Servitia"
        description="Manage landlord accounts and details."
        canonical="https://domusservitia.co.uk/admin-landlords"
      />
      <div className="min-h-screen bg-muted/30">
        {/* Header */}
        <header className="bg-card border-b border-border sticky top-0 z-50 shadow-sm">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between h-16">
              <img src={logo} alt="Domus Servitia" className="h-10 rounded-lg" />
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon">
                  <Settings className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon">
                  <Users className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8">
          {/* Page Title */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="font-serif text-3xl font-bold text-foreground mb-2">
                Landlords Management
              </h1>
              <p className="text-muted-foreground">
                View and manage all landlords in the system.
              </p>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <Card className="border-border">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Total Landlords</p>
                    <p className="text-2xl font-bold text-foreground">{landlords.length}</p>
                  </div>
                  <div className="bg-accent/10 p-3 rounded-full">
                    <Users className="h-6 w-6 text-accent" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-border">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Active</p>
                    <p className="text-2xl font-bold text-green-600">
                      {landlords.length}
                    </p>
                  </div>
                  <div className="bg-accent/10 p-3 rounded-full">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-border">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Total Properties</p>
                    <p className="text-2xl font-bold text-accent">
                      {landlords.reduce((sum, l) => sum + (l.propertyCount || 0), 0)}
                    </p>
                  </div>
                  <div className="bg-accent/10 p-3 rounded-full">
                    <Home className="h-6 w-6 text-accent" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Grid */}
          <div className="grid lg:grid-cols-1 gap-6">
            {/* Landlords List Section */}
            <Card className="border-border">
              <CardHeader>
                <CardTitle>Landlords List</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-4 flex items-center gap-2">
                  <Input
                    placeholder="Search landlords by name, email, phone, or company..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="max-w-xs"
                  />
                  <Search className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="py-2 px-2 text-left">Name</th>
                        <th className="py-2 px-2 text-left">Email</th>
                        <th className="py-2 px-2 text-left">Phone</th>
                        <th className="py-2 px-2 text-left">Company</th>
                        <th className="py-2 px-2 text-left">Reg. No</th>
                        <th className="py-2 px-2 text-left">Tax ID</th>
                        <th className="py-2 px-2 text-left">Properties</th>
                        <th className="py-2 px-2 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredLandlords.map(landlord => (
                        <tr key={landlord.user_id} className="border-b border-border hover:bg-muted/40">
                          <td className="py-2 px-2">{landlord.first_name} {landlord.last_name}</td>
                          <td className="py-2 px-2">{landlord.email}</td>
                          <td className="py-2 px-2">{landlord.phone_number}</td>
                          <td className="py-2 px-2">{landlord.company_name}</td>
                          <td className="py-2 px-2">{landlord.registration_no}</td>
                          <td className="py-2 px-2">{landlord.tax_id}</td>
                          <td className="py-2 px-2">{landlord.propertyCount}</td>
                          <td className="py-2 px-2 text-center flex gap-2 justify-center">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openViewModal(landlord)}
                              aria-label="View"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              aria-label="Message"
                              onClick={() => handleMessageLandlord(landlord)}
                            >
                              <Mail className="h-4 w-4 text-blue-600" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              aria-label="Disable"
                              onClick={() => handleDisableLandlord(landlord)}
                            >
                              <ShieldOff className="h-4 w-4 text-yellow-600" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              aria-label="Delete"
                              onClick={() => handleDeleteLandlord(landlord.user_id)}
                              disabled={formLoading}
                            >
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              aria-label="List Properties"
                              onClick={() => handleListProperties(landlord)}
                            >
                              <Home className="h-4 w-4 text-accent" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* View Landlord Modal */}
        {showViewModal && selectedLandlord && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
            <div className="bg-card rounded-lg shadow-lg w-full max-w-md relative">
              <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                <span className="font-semibold text-lg">Landlord Details</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowViewModal(false)}
                  aria-label="Close"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <div className="px-6 py-4 space-y-3">
                <div>
                  <span className="font-medium">Name:</span> {selectedLandlord.first_name} {selectedLandlord.last_name}
                </div>
                <div>
                  <span className="font-medium">Email:</span> {selectedLandlord.email}
                </div>
                <div>
                  <span className="font-medium">Phone:</span> {selectedLandlord.phone_number}
                </div>
                <div>
                  <span className="font-medium">Company Name:</span> {selectedLandlord.company_name}
                </div>
                <div>
                  <span className="font-medium">Registration No:</span> {selectedLandlord.registration_no}
                </div>
                <div>
                  <span className="font-medium">Tax ID:</span> {selectedLandlord.tax_id}
                </div>
                <div>
                  <span className="font-medium">Payout Details:</span> {selectedLandlord.payout_details ? JSON.stringify(selectedLandlord.payout_details) : ""}
                </div>
                <div>
                  <span className="font-medium">Properties:</span> {selectedLandlord.propertyCount}
                </div>
                <div>
                  <span className="font-medium">Created At:</span> {selectedLandlord.created_at ? new Date(selectedLandlord.created_at).toLocaleString() : ""}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default AdminLandlords;