import { useEffect, useState } from "react";
import {
  Home,
  ClipboardList,
  Calendar,
  CheckCircle,
  Eye,
  FileText,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import SEO from "@/components/SEO";
import logo from "@/assets/logo.png";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabaseClient";

const TABS = [
  { key: "properties", label: "Properties", icon: <Home className="h-4 w-4 mr-1" /> },
  { key: "units", label: "Units", icon: <ClipboardList className="h-4 w-4 mr-1" /> },
  { key: "leases", label: "Leases/Bookings", icon: <Calendar className="h-4 w-4 mr-1" /> },
];

const LandlordProperties = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const landlordUserId = user?.id;

  // State
  const [activeTab, setActiveTab] = useState("properties");
  const [properties, setProperties] = useState<any[]>([]);
  const [units, setUnits] = useState<any[]>([]);
  const [leases, setLeases] = useState<any[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<any>(null);
  const [search, setSearch] = useState("");
  const [propertyTypeOptions, setPropertyTypeOptions] = useState<any[]>([]);
  const [lodgers, setLodgers] = useState<any[]>([]);
  const [assets, setAssets] = useState<any[]>([]);

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

  // Fetch leases for units
  useEffect(() => {
    if (!units.length) return;
    fetchLeases();
  }, [units]);

  // Fetch lodger profiles and assets for leases
  useEffect(() => {
    if (!leases.length) return;

    // Lodger profiles
    const lodgerIds = Array.from(new Set(leases.map(l => l.lodger_user_id).filter(Boolean)));
    if (lodgerIds.length > 0) {
      supabase
        .from("lodger_profiles")
        .select("user_id, first_name, last_name, email")
        .in("user_id", lodgerIds)
        .then(({ data }) => setLodgers(data || []));
    } else {
      setLodgers([]);
    }

    // Assets (signed documents)
    const assetIds = Array.from(
      new Set(leases.map(l => l.signed_document_id).filter(Boolean))
    );
    if (assetIds.length > 0) {
      supabase
        .from("assets")
        .select("id, file_name, public_url")
        .in("id", assetIds)
        .then(({ data }) => setAssets(data || []));
    } else {
      setAssets([]);
    }
  }, [leases]);

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

  // Helper to get lodger info
  const getLodgerInfo = (userId: string) => {
    return lodgers.find(l => l.user_id === userId);
  };

  // Helper to get unit info
  const getUnitInfo = (unitId: string) => {
    return units.find(u => u.id === unitId);
  };

  // Helper to get signed document asset
  const getSignedDocument = (assetId: string) => {
    return assets.find(a => a.id === assetId);
  };

  return (
    <>
      <SEO
        title="Landlord Properties - Domus Servitia"
        description="View your properties, units, and leases/bookings."
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
                    <p className="text-sm text-muted-foreground mb-1">Leases</p>
                    <p className="text-2xl font-bold text-foreground">{leases.length}</p>
                  </div>
                  <div className="bg-accent/10 p-3 rounded-full">
                    <Calendar className="h-6 w-6 text-accent" />
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
                          <th className="py-2 px-2 text-left">Year Built</th>
                          <th className="py-2 px-2 text-left">Status</th>
                          <th className="py-2 px-2 text-left">Units</th>
                          <th className="py-2 px-2 text-left">View</th>
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
                              <td className="py-2 px-2">{property.year_built}</td>
                              <td className="py-2 px-2">
                                {property.is_published ? (
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
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleSelectProperty(property)}
                                  aria-label="View Units"
                                >
                                  View Units
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

          {/* Units Tab */}
          {activeTab === "units" && selectedProperty && (
            <div>
              <Card className="border-border">
                <CardHeader>
                  <CardTitle>
                    Units for {selectedProperty.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="py-2 px-2 text-left">Unit Label</th>
                          <th className="py-2 px-2 text-left">Bedrooms</th>
                          <th className="py-2 px-2 text-left">Bathrooms</th>
                          <th className="py-2 px-2 text-left">Area (sqft)</th>
                          <th className="py-2 px-2 text-left">Furnished</th>
                          <th className="py-2 px-2 text-left">Rent</th>
                          <th className="py-2 px-2 text-left">Deposit</th>
                          <th className="py-2 px-2 text-left">Available From</th>
                          <th className="py-2 px-2 text-left">Status</th>
                          <th className="py-2 px-2 text-left">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {units
                          .filter((u: any) => u.property_id === selectedProperty.id)
                          .map(unit => (
                            <tr key={unit.id} className="border-b border-border hover:bg-muted/40">
                              <td className="py-2 px-2">{unit.unit_label}</td>
                              <td className="py-2 px-2">{unit.bedrooms}</td>
                              <td className="py-2 px-2">{unit.bathrooms}</td>
                              <td className="py-2 px-2">{unit.area_sqft}</td>
                              <td className="py-2 px-2">{unit.furnished ? "Yes" : "No"}</td>
                              <td className="py-2 px-2">
                                {unit.rent_amount
                                  ? `${(unit.rent_amount).toLocaleString()} ${unit.rent_currency || "USD"}`
                                  : ""}
                              </td>
                              <td className="py-2 px-2">
                                {unit.deposit_amount
                                  ? `${(unit.deposit_amount).toLocaleString()}`
                                  : ""}
                              </td>
                              <td className="py-2 px-2">{unit.available_from}</td>
                              <td className="py-2 px-2">{unit.status}</td>
                              <td className="py-2 px-2 flex gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => navigate(`/property/${unit.id}`)}
                                  aria-label="Preview Property"
                                >
                                  <Eye className="h-4 w-4 mr-1" /> Preview
                                </Button>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="mt-4">
                    <Button variant="outline" onClick={() => setActiveTab("properties")}>
                      Back to Properties
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Leases Tab */}
          {activeTab === "leases" && (
            <div>
              <Card className="border-border">
                <CardHeader>
                  <CardTitle>Leases/Bookings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="py-2 px-2 text-left">Unit</th>
                          <th className="py-2 px-2 text-left">Lodger Name</th>
                          <th className="py-2 px-2 text-left">Lease Status</th>
                          <th className="py-2 px-2 text-left">Start Date</th>
                          <th className="py-2 px-2 text-left">End Date</th>
                          <th className="py-2 px-2 text-left">Rent Amount</th>
                          <th className="py-2 px-2 text-left">Signed At</th>
                          <th className="py-2 px-2 text-left">Signed Document</th>
                        </tr>
                      </thead>
                      <tbody>
                        {leases.map(lease => {
                          const unit = getUnitInfo(lease.unit_id);
                          const lodger = getLodgerInfo(lease.lodger_user_id);
                          const signedDoc = getSignedDocument(lease.signed_document_id);
                          return (
                            <tr key={lease.id} className="border-b border-border hover:bg-muted/40">
                              <td className="py-2 px-2">{unit?.unit_label || ""}</td>
                              <td className="py-2 px-2">{lodger ? `${lodger.first_name} ${lodger.last_name}` : ""}</td>
                              <td className="py-2 px-2">{lease.status}</td>
                              <td className="py-2 px-2">{lease.start_date}</td>
                              <td className="py-2 px-2">{lease.end_date}</td>
                              <td className="py-2 px-2">
                                {lease.rent_amount
                                  ? `${(lease.rent_amount).toLocaleString()} ${lease.rent_currency || "USD"}`
                                  : ""}
                              </td>
                              <td className="py-2 px-2">{lease.signed_at}</td>
                              <td className="py-2 px-2">
                                {signedDoc ? (
                                  <a
                                    href={signedDoc.public_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1 text-accent underline"
                                  >
                                    <FileText className="h-4 w-4" />
                                    {signedDoc.file_name || "Document"}
                                  </a>
                                ) : (
                                  <span className="text-muted-foreground">No Document</span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default LandlordProperties;