import { useEffect, useState } from "react";
import {
  Home,
  ClipboardList,
  Users,
  Calendar,
  Plus,
  Edit,
  Trash2,
  X,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import SEO from "@/components/SEO";
import logo from "@/assets/logo.png";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";

const TABS = [
  { key: "properties", label: "Properties", icon: <Home className="h-4 w-4 mr-1" /> },
  { key: "units", label: "Units", icon: <ClipboardList className="h-4 w-4 mr-1" /> },
  { key: "lodgers", label: "Lodgers", icon: <Users className="h-4 w-4 mr-1" /> },
  { key: "leases", label: "Leases/Bookings", icon: <Calendar className="h-4 w-4 mr-1" /> },
];

const LandlordProperties = () => {
  const { user } = useAuth();
  const landlordUserId = user?.id;

  // State
  const [activeTab, setActiveTab] = useState("properties");
  const [properties, setProperties] = useState<any[]>([]);
  const [units, setUnits] = useState<any[]>([]);
  const [lodgers, setLodgers] = useState<any[]>([]);
  const [leases, setLeases] = useState<any[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<any>(null);
  const [selectedUnit, setSelectedUnit] = useState<any>(null);
  const [showAddPropertyModal, setShowAddPropertyModal] = useState(false);
  const [showEditPropertyModal, setShowEditPropertyModal] = useState(false);
  const [showAddUnitModal, setShowAddUnitModal] = useState(false);
  const [showEditUnitModal, setShowEditUnitModal] = useState(false);
  const [propertyForm, setPropertyForm] = useState<any>({});
  const [unitForm, setUnitForm] = useState<any>({});
  const [formLoading, setFormLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [propertyTypeOptions, setPropertyTypeOptions] = useState<any[]>([]);

  // Fetch property types for dropdown
  useEffect(() => {
    const fetchPropertyTypes = async () => {
      const { data } = await supabase
        .from("property_types")
        .select("id, name");
      if (data) setPropertyTypeOptions(data);
    };
    fetchPropertyTypes();
  }, []);

  // Fetch properties for landlord
  useEffect(() => {
    if (!landlordUserId) return;
    fetchProperties();
  }, [landlordUserId]);

  // Fetch units for landlord's properties
  useEffect(() => {
    if (!properties.length) return;
    fetchUnits();
  }, [properties]);

  // Fetch lodgers for units
  useEffect(() => {
    if (!units.length) return;
    fetchLodgers();
    fetchLeases();
  }, [units]);

  const fetchProperties = async () => {
    const { data } = await supabase
      .from("properties")
      .select("*")
      .eq("landlord_user_id", landlordUserId)
      .order("created_at", { ascending: false });
    if (data) setProperties(data);
  };

  const fetchUnits = async () => {
    const propertyIds = properties.map((p: any) => p.id);
    if (!propertyIds.length) {
      setUnits([]);
      return;
    }
    const { data } = await supabase
      .from("property_units")
      .select("*")
      .in("property_id", propertyIds);
    if (data) setUnits(data);
  };

  const fetchLodgers = async () => {
    const unitIds = units.map((u: any) => u.id);
    if (!unitIds.length) {
      setLodgers([]);
      return;
    }
    const { data: leaseData } = await supabase
      .from("leases")
      .select("lodger_user_id")
      .in("unit_id", unitIds)
      .eq("status", "occupied");
    const lodgerIds = leaseData?.map((l: any) => l.lodger_user_id) ?? [];
    if (!lodgerIds.length) {
      setLodgers([]);
      return;
    }
    const { data: lodgerProfiles } = await supabase
      .from("lodger_profiles")
      .select("*")
      .in("user_id", lodgerIds);
    setLodgers(lodgerProfiles || []);
  };

  const fetchLeases = async () => {
    const unitIds = units.map((u: any) => u.id);
    if (!unitIds.length) {
      setLeases([]);
      return;
    }
    const { data } = await supabase
      .from("leases")
      .select("*")
      .in("unit_id", unitIds);
    if (data) setLeases(data);
  };

  // Handlers for selecting property/unit
  const handleSelectProperty = (property: any) => {
    setSelectedProperty(property);
    setActiveTab("units");
  };

  const handleSelectUnit = (unit: any) => {
    setSelectedUnit(unit);
    setActiveTab("lodgers");
  };

  // Add Property Modal
  const handleAddProperty = () => {
    setPropertyForm({});
    setShowAddPropertyModal(true);
  };

  const handlePropertyFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setPropertyForm({ ...propertyForm, [e.target.name]: e.target.value });
  };

  const submitAddProperty = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);

    const insertData = {
      title: propertyForm.title,
      description: propertyForm.description || "",
      property_type_id: propertyForm.property_type_id,
      address: propertyForm.address,
      city: propertyForm.city,
      postal_code: propertyForm.postal_code,
      year_built: propertyForm.year_built ? Number(propertyForm.year_built) : null,
      total_units: propertyForm.total_units ? Number(propertyForm.total_units) : null,
      landlord_user_id: landlordUserId,
      status: false,
      is_published: false,
      created_at: new Date().toISOString(),
    };

    if (
      !propertyForm.title ||
      !propertyForm.property_type_id ||
      !propertyForm.address ||
      !propertyForm.city ||
      !propertyForm.postal_code
    ) {
      toast.error("Title, Property Type, Address, City, and Postal Code are required.");
      setFormLoading(false);
      return;
    }

    const { error } = await supabase
      .from("properties")
      .insert([insertData]);
    setFormLoading(false);
    if (error) {
      toast.error("Failed to add property.");
    } else {
      toast.success("Property added! Awaiting admin approval.");
      setShowAddPropertyModal(false);
      fetchProperties();
    }
  };

  return (
    <>
      <SEO
        title="Landlord Properties - Domus Servitia"
        description="Manage your properties, units, lodgers, and leases/bookings."
        canonical="https://domusservitia.co.uk/landlord-properties"
      />
      <div className="min-h-screen bg-muted/30">
        {/* Header */}
        <header className="bg-card border-b border-border sticky top-0 z-50 shadow-sm">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between h-16">
              <img src={logo} alt="Domus Servitia" className="h-10 rounded-lg" />
              <nav className="flex gap-2">
                {TABS.map(tab => (
                  <Button
                    key={tab.key}
                    variant={activeTab === tab.key ? "default" : "outline"}
                    className="flex items-center"
                    onClick={() => setActiveTab(tab.key)}
                  >
                    {tab.icon}
                    {tab.label}
                  </Button>
                ))}
              </nav>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8">
          {/* Quick Stats */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Card className="border-border">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Total Properties</p>
                    <p className="text-2xl font-bold text-foreground">{properties.length}</p>
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
                    <p className="text-sm text-muted-foreground mb-1">Units</p>
                    <p className="text-2xl font-bold text-foreground">{units.length}</p>
                  </div>
                  <div className="bg-accent/10 p-3 rounded-full">
                    <ClipboardList className="h-6 w-6 text-accent" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-border">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Active Lodgers</p>
                    <p className="text-2xl font-bold text-foreground">{lodgers.length}</p>
                  </div>
                  <div className="bg-accent/10 p-3 rounded-full">
                    <Users className="h-6 w-6 text-accent" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Properties Tab */}
          {activeTab === "properties" && (
            <div>
              <div className="mb-4 flex items-center gap-2">
                <Input
                  placeholder="Search properties..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="max-w-xs"
                />
                <Button onClick={handleAddProperty} variant="default">
                  <Plus className="h-4 w-4 mr-1" />
                  Add Property
                </Button>
              </div>
              <Card className="border-border">
                <CardHeader>
                  <CardTitle>My Properties</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="py-2 px-2 text-left">Title</th>
                          <th className="py-2 px-2 text-left">Type</th>
                          <th className="py-2 px-2 text-left">Address</th>
                          <th className="py-2 px-2 text-left">Status</th>
                          <th className="py-2 px-2 text-left">Units</th>
                          <th className="py-2 px-2 text-left">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {properties
                          .filter(
                            property =>
                              property.title?.toLowerCase().includes(search.toLowerCase())
                          )
                          .map(property => (
                            <tr key={property.id} className="border-b border-border hover:bg-muted/40">
                              <td className="py-2 px-2">{property.title}</td>
                              <td className="py-2 px-2">
                                {propertyTypeOptions.find(pt => pt.id === property.property_type_id)?.name || ""}
                              </td>
                              <td className="py-2 px-2">
                                {property.address}, {property.city} {property.postal_code}
                              </td>
                              <td className="py-2 px-2">
                                {property.status ? (
                                  <span className="text-green-600 font-semibold flex items-center gap-1">
                                    <CheckCircle className="h-4 w-4" /> Approved
                                  </span>
                                ) : (
                                  <span className="text-yellow-600 font-semibold">Pending</span>
                                )}
                              </td>
                              <td className="py-2 px-2">
                                {
                                  units.filter((u: any) => u.property_id === property.id).length
                                }
                              </td>
                              <td className="py-2 px-2 flex gap-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleSelectProperty(property)}
                                  aria-label="View Units"
                                >
                                  <ClipboardList className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => setShowEditPropertyModal(true)}
                                  aria-label="Edit"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  aria-label="Delete"
                                  onClick={() => toast.info("Delete property feature coming soon.")}
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
          )}

          {/* Add Property Modal (Scrollable) */}
          {showAddPropertyModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
              <div className="bg-card rounded-lg shadow-lg w-full max-w-md relative p-0 flex flex-col">
                <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                  <span className="font-semibold text-lg">Add Property</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowAddPropertyModal(false)}
                    aria-label="Close"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
                <div
                  className="overflow-y-auto px-6 py-4"
                  style={{ maxHeight: "70vh" }}
                >
                  <form onSubmit={submitAddProperty} className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Title</label>
                      <input
                        name="title"
                        className="w-full px-3 py-2 border border-border rounded-md"
                        value={propertyForm.title || ""}
                        onChange={handlePropertyFormChange}
                        required
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Description</label>
                      <textarea
                        name="description"
                        className="w-full px-3 py-2 border border-border rounded-md"
                        value={propertyForm.description || ""}
                        onChange={handlePropertyFormChange}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Property Type</label>
                      <select
                        name="property_type_id"
                        className="w-full px-3 py-2 border border-border rounded-md"
                        value={propertyForm.property_type_id || ""}
                        onChange={handlePropertyFormChange}
                        required
                      >
                        <option value="">Select type</option>
                        {propertyTypeOptions.map(type => (
                          <option key={type.id} value={type.id}>
                            {type.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Address</label>
                      <input
                        name="address"
                        className="w-full px-3 py-2 border border-border rounded-md"
                        value={propertyForm.address || ""}
                        onChange={handlePropertyFormChange}
                        required
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">City</label>
                      <input
                        name="city"
                        className="w-full px-3 py-2 border border-border rounded-md"
                        value={propertyForm.city || ""}
                        onChange={handlePropertyFormChange}
                        required
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Postal Code</label>
                      <input
                        name="postal_code"
                        className="w-full px-3 py-2 border border-border rounded-md"
                        value={propertyForm.postal_code || ""}
                        onChange={handlePropertyFormChange}
                        required
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Year Built</label>
                      <input
                        name="year_built"
                        type="number"
                        className="w-full px-3 py-2 border border-border rounded-md"
                        value={propertyForm.year_built || ""}
                        onChange={handlePropertyFormChange}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Total Units</label>
                      <input
                        name="total_units"
                        type="number"
                        className="w-full px-3 py-2 border border-border rounded-md"
                        value={propertyForm.total_units || ""}
                        onChange={handlePropertyFormChange}
                      />
                    </div>
                    <Button type="submit" disabled={formLoading} className="w-full">
                      {formLoading ? "Adding..." : "Add Property"}
                    </Button>
                  </form>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default LandlordProperties;