import { useState, useEffect } from "react";
import {
  Users,
  ClipboardList,
  Settings,
  Search,
  Trash2,
  Mail,
  Eye,
  CheckCircle,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import SEO from "@/components/SEO";
import logo from "@/assets/logo.png";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";

const AdminLodgers = () => {
  const [lodgers, setLodgers] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [selectedLodger, setSelectedLodger] = useState<any>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    fetchLodgers();
  }, []);

  // Fetch lodgers and their emails from auth.users
  const fetchLodgers = async () => {
    const { data: lodgerProfiles, error } = await supabase
      .from("lodger_profiles")
      .select(
        "user_id,first_name,last_name,phone_number,dob,employment_status,emergency_contact_name,emergency_contact_phone,notes,created_at"
      );
    if (error || !lodgerProfiles) {
      setLodgers([]);
      return;
    }
    // Get emails from auth.users
    const { data: authUsers } = await supabase
      .from("users")
      .select("id,email");
    const lodgersWithEmail = lodgerProfiles.map((lodger: any) => {
      const user = authUsers?.find((u: any) => u.id === lodger.user_id);
      return { ...lodger, email: user?.email || "" };
    });
    setLodgers(lodgersWithEmail);
  };

  const filteredLodgers = lodgers.filter(
    lodger =>
      `${lodger.first_name} ${lodger.last_name}`.toLowerCase().includes(search.toLowerCase()) ||
      lodger.email?.toLowerCase().includes(search.toLowerCase()) ||
      lodger.phone_number?.toLowerCase().includes(search.toLowerCase()) ||
      lodger.employment_status?.toLowerCase().includes(search.toLowerCase()) ||
      lodger.emergency_contact_name?.toLowerCase().includes(search.toLowerCase())
  );

  // View Lodger Handler
  const openViewModal = (lodger: any) => {
    setSelectedLodger(lodger);
    setShowViewModal(true);
  };

  // Delete Lodger Handler
  const handleDeleteLodger = async (user_id: string) => {
    if (!window.confirm("Are you sure you want to delete this lodger?")) return;
    setFormLoading(true);
    try {
      const { error } = await supabase.from("lodger_profiles").delete().eq("user_id", user_id);
      if (error) throw new Error(error.message);

      toast.success("Lodger deleted!");
      fetchLodgers();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setFormLoading(false);
    }
  };

  // Placeholder for messaging
  const handleMessageLodger = (lodger: any) => {
    toast.info(`Messaging feature for ${lodger.first_name} will be implemented soon.`);
  };

  return (
    <>
      <SEO
        title="Admin Lodgers - Domus Servitia"
        description="Manage lodger accounts and details."
        canonical="https://domusservitia.co.uk/admin-lodgers"
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
                Lodgers Management
              </h1>
              <p className="text-muted-foreground">
                View and manage all lodgers in the system.
              </p>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <Card className="border-border">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Total Lodgers</p>
                    <p className="text-2xl font-bold text-foreground">{lodgers.length}</p>
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
                      {lodgers.length}
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
                    <p className="text-sm text-muted-foreground mb-1">Scheduled Tasks</p>
                    <p className="text-2xl font-bold text-accent">
                      0
                    </p>
                  </div>
                  <div className="bg-accent/10 p-3 rounded-full">
                    <ClipboardList className="h-6 w-6 text-accent" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Grid */}
          <div className="grid lg:grid-cols-1 gap-6">
            {/* Lodgers List Section */}
            <Card className="border-border">
              <CardHeader>
                <CardTitle>Lodgers List</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-4 flex items-center gap-2">
                  <Input
                    placeholder="Search lodgers by name, email, phone, employment, or emergency contact..."
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
                        <th className="py-2 px-2 text-left">DOB</th>
                        <th className="py-2 px-2 text-left">Employment</th>
                        <th className="py-2 px-2 text-left">Emergency Contact</th>
                        <th className="py-2 px-2 text-left">Emergency Phone</th>
                        <th className="py-2 px-2 text-left">Notes</th>
                        <th className="py-2 px-2 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredLodgers.map(lodger => (
                        <tr key={lodger.user_id} className="border-b border-border hover:bg-muted/40">
                          <td className="py-2 px-2">{lodger.first_name} {lodger.last_name}</td>
                          <td className="py-2 px-2">{lodger.email}</td>
                          <td className="py-2 px-2">{lodger.phone_number}</td>
                          <td className="py-2 px-2">{lodger.dob ? lodger.dob.split("T")[0] : ""}</td>
                          <td className="py-2 px-2">{lodger.employment_status}</td>
                          <td className="py-2 px-2">{lodger.emergency_contact_name}</td>
                          <td className="py-2 px-2">{lodger.emergency_contact_phone}</td>
                          <td className="py-2 px-2">{lodger.notes}</td>
                          <td className="py-2 px-2 text-center flex gap-2 justify-center">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openViewModal(lodger)}
                              aria-label="View"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              aria-label="Message"
                              onClick={() => handleMessageLodger(lodger)}
                            >
                              <Mail className="h-4 w-4 text-blue-600" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              aria-label="Delete"
                              onClick={() => handleDeleteLodger(lodger.user_id)}
                              disabled={formLoading}
                            >
                              <Trash2 className="h-4 w-4 text-red-600" />
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

        {/* View Lodger Modal */}
        {showViewModal && selectedLodger && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
            <div className="bg-card rounded-lg shadow-lg w-full max-w-md relative">
              <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                <span className="font-semibold text-lg">Lodger Details</span>
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
                  <span className="font-medium">Name:</span> {selectedLodger.first_name} {selectedLodger.last_name}
                </div>
                <div>
                  <span className="font-medium">Email:</span> {selectedLodger.email}
                </div>
                <div>
                  <span className="font-medium">Phone:</span> {selectedLodger.phone_number}
                </div>
                <div>
                  <span className="font-medium">Date of Birth:</span> {selectedLodger.dob ? selectedLodger.dob.split("T")[0] : ""}
                </div>
                <div>
                  <span className="font-medium">Employment Status:</span> {selectedLodger.employment_status}
                </div>
                <div>
                  <span className="font-medium">Emergency Contact Name:</span> {selectedLodger.emergency_contact_name}
                </div>
                <div>
                  <span className="font-medium">Emergency Contact Phone:</span> {selectedLodger.emergency_contact_phone}
                </div>
                <div>
                  <span className="font-medium">Notes:</span> {selectedLodger.notes}
                </div>
                <div>
                  <span className="font-medium">Created At:</span> {selectedLodger.created_at ? new Date(selectedLodger.created_at).toLocaleString() : ""}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default AdminLodgers;