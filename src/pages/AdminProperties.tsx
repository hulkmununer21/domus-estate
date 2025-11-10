import { useEffect, useState } from "react";
import {
  CheckCircle,
  ClipboardList,
  Edit,
  Trash2,
  Home,
  Layers,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import SEO from "@/components/SEO";
import logo from "@/assets/logo.png";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";

const TABS = [
  { key: "published", label: "Published", icon: <CheckCircle className="h-4 w-4 mr-1" /> },
  { key: "pending", label: "Pending", icon: <ClipboardList className="h-4 w-4 mr-1" /> },
  { key: "units", label: "Units", icon: <Layers className="h-4 w-4 mr-1" /> },
  { key: "leases", label: "Leases", icon: <FileText className="h-4 w-4 mr-1" /> },
];

const AdminProperties = () => {
  const [activeTab, setActiveTab] = useState("published");
  const [properties, setProperties] = useState<any[]>([]);
  const [propertyTypes, setPropertyTypes] = useState<any[]>([]);
  const [landlordProfiles, setLandlordProfiles] = useState<any[]>([]);
  const [units, setUnits] = useState<any[]>([]);
  const [leases, setLeases] = useState<any[]>([]);
  const [search, setSearch] = useState("");

  // Fetch property types
  useEffect(() => {
    const fetchPropertyTypes = async () => {
      const { data } = await supabase.from("property_types").select("id, name");
      if (data) setPropertyTypes(data);
    };
    fetchPropertyTypes();
  }, []);

  // Fetch all properties
  useEffect(() => {
    fetchProperties();
  }, []);

  // Fetch all landlord profiles
  useEffect(() => {
    const fetchLandlords = async () => {
      const { data } = await supabase.from("landlord_profiles").select("*");
      if (data) setLandlordProfiles(data);
    };
    fetchLandlords();
  }, []);

  // Fetch all units
  useEffect(() => {
    const fetchUnits = async () => {
      const { data } = await supabase.from("property_units").select("*");
      if (data) setUnits(data);
    };
    fetchUnits();
  }, []);

  // Fetch all leases
  useEffect(() => {
    const fetchLeases = async () => {
      const { data } = await supabase.from("leases").select("*");
      if (data) setLeases(data);
    };
    fetchLeases();
  }, []);

  const fetchProperties = async () => {
    const { data } = await supabase
      .from("properties")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setProperties(data);
  };

  // Helper: Get property type name
  const getPropertyType = (property_type_id: string) =>
    propertyTypes.find((pt: any) => pt.id === property_type_id);

  // Helper: Get landlord profile
  const getLandlord = (landlord_user_id: string) =>
    landlordProfiles.find((lp: any) => lp.user_id === landlord_user_id);

  // Helper: Get property for unit
  const getProperty = (property_id: string) =>
    properties.find((p: any) => p.id === property_id);

  // Helper: Get unit for lease
  const getUnit = (unit_id: string) =>
    units.find((u: any) => u.id === unit_id);

  // Filtered properties
  const publishedProperties = properties.filter(
    (p: any) => p.is_published && p.title?.toLowerCase().includes(search.toLowerCase())
  );
  const pendingProperties = properties.filter(
    (p: any) => !p.is_published && p.title?.toLowerCase().includes(search.toLowerCase())
  );

  // Filtered units
  const filteredUnits = units.filter(
    (u: any) =>
      getProperty(u.property_id)?.title?.toLowerCase().includes(search.toLowerCase()) ||
      u.unit_label?.toLowerCase().includes(search.toLowerCase())
  );

  // Filtered leases
  const filteredLeases = leases.filter(
    (l: any) =>
      getUnit(l.unit_id)?.unit_label?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <SEO
        title="Admin Properties - Domus Servitia"
        description="View and manage all properties, units, and leases as admin."
        canonical="https://domusservitia.co.uk/admin-properties"
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
          <div className="mb-4 flex items-center gap-2">
            <Input
              placeholder="Search..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="max-w-xs"
            />
          </div>

          {/* Published Properties */}
          {activeTab === "published" && (
            <Card className="border-border">
              <CardHeader>
                <CardTitle>Published Properties</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="py-2 px-2 text-left">Title</th>
                        <th className="py-2 px-2 text-left">Type</th>
                        <th className="py-2 px-2 text-left">Units</th>
                        <th className="py-2 px-2 text-left">Address</th>
                        <th className="py-2 px-2 text-left">Owner</th>
                        <th className="py-2 px-2 text-left">Company</th>
                        <th className="py-2 px-2 text-left">Year Built</th>
                        <th className="py-2 px-2 text-left">Published</th>
                        <th className="py-2 px-2 text-left">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {publishedProperties.map(property => (
                        <tr key={property.id} className="border-b border-border hover:bg-muted/40">
                          <td className="py-2 px-2">{property.title}</td>
                          <td className="py-2 px-2">{getPropertyType(property.property_type_id)?.name}</td>
                          <td className="py-2 px-2">{property.total_units ?? ""}</td>
                          <td className="py-2 px-2">
                            {property.address}, {property.city} {property.postal_code}
                          </td>
                          <td className="py-2 px-2">
                            {getLandlord(property.landlord_user_id)
                              ? `${getLandlord(property.landlord_user_id).first_name} ${getLandlord(property.landlord_user_id).last_name}`
                              : ""}
                          </td>
                          <td className="py-2 px-2">
                            {getLandlord(property.landlord_user_id)?.company_name || ""}
                          </td>
                          <td className="py-2 px-2">{property.year_built}</td>
                          <td className="py-2 px-2">
                            {property.is_published ? (
                              <span className="text-green-600 font-semibold">Yes</span>
                            ) : (
                              <span className="text-red-600 font-semibold">No</span>
                            )}
                          </td>
                          <td className="py-2 px-2 text-center flex gap-2 justify-center">
                            <Button variant="ghost" size="icon" aria-label="Edit">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" aria-label="Delete">
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
          )}

          {/* Pending Properties */}
          {activeTab === "pending" && (
            <Card className="border-border">
              <CardHeader>
                <CardTitle>Pending Properties</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="py-2 px-2 text-left">Title</th>
                        <th className="py-2 px-2 text-left">Type</th>
                        <th className="py-2 px-2 text-left">Units</th>
                        <th className="py-2 px-2 text-left">Address</th>
                        <th className="py-2 px-2 text-left">Owner</th>
                        <th className="py-2 px-2 text-left">Company</th>
                        <th className="py-2 px-2 text-left">Year Built</th>
                        <th className="py-2 px-2 text-left">Published</th>
                        <th className="py-2 px-2 text-left">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pendingProperties.map(property => (
                        <tr key={property.id} className="border-b border-border hover:bg-muted/40">
                          <td className="py-2 px-2">{property.title}</td>
                          <td className="py-2 px-2">{getPropertyType(property.property_type_id)?.name}</td>
                          <td className="py-2 px-2">{property.total_units ?? ""}</td>
                          <td className="py-2 px-2">
                            {property.address}, {property.city} {property.postal_code}
                          </td>
                          <td className="py-2 px-2">
                            {getLandlord(property.landlord_user_id)
                              ? `${getLandlord(property.landlord_user_id).first_name} ${getLandlord(property.landlord_user_id).last_name}`
                              : ""}
                          </td>
                          <td className="py-2 px-2">
                            {getLandlord(property.landlord_user_id)?.company_name || ""}
                          </td>
                          <td className="py-2 px-2">{property.year_built}</td>
                          <td className="py-2 px-2">
                            {property.is_published ? (
                              <span className="text-green-600 font-semibold">Yes</span>
                            ) : (
                              <span className="text-red-600 font-semibold">No</span>
                            )}
                          </td>
                          <td className="py-2 px-2 text-center flex gap-2 justify-center">
                            <Button variant="ghost" size="icon" aria-label="Edit">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" aria-label="Delete">
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
          )}

          {/* Units Tab */}
          {activeTab === "units" && (
            <Card className="border-border">
              <CardHeader>
                <CardTitle>Units</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="py-2 px-2 text-left">Unit Label</th>
                        <th className="py-2 px-2 text-left">Property</th>
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
                      {filteredUnits.map(unit => (
                        <tr key={unit.id} className="border-b border-border hover:bg-muted/40">
                          <td className="py-2 px-2">{unit.unit_label}</td>
                          <td className="py-2 px-2">{getProperty(unit.property_id)?.title || ""}</td>
                          <td className="py-2 px-2">{unit.bedrooms}</td>
                          <td className="py-2 px-2">{unit.bathrooms}</td>
                          <td className="py-2 px-2">{unit.area_sqft}</td>
                          <td className="py-2 px-2">{unit.furnished ? "Yes" : "No"}</td>
                          <td className="py-2 px-2">
                            {unit.rent_amount_cents
                              ? `${(unit.rent_amount_cents / 100).toLocaleString()} ${unit.rent_currency || "USD"}`
                              : ""}
                          </td>
                          <td className="py-2 px-2">
                            {unit.deposit_cents
                              ? `${(unit.deposit_cents / 100).toLocaleString()}`
                              : ""}
                          </td>
                          <td className="py-2 px-2">{unit.available_from}</td>
                          <td className="py-2 px-2">{unit.status}</td>
                          <td className="py-2 px-2 text-center flex gap-2 justify-center">
                            <Button variant="ghost" size="icon" aria-label="Edit">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" aria-label="Delete">
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
          )}

          {/* Leases Tab */}
          {activeTab === "leases" && (
            <Card className="border-border">
              <CardHeader>
                <CardTitle>Leases</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="py-2 px-2 text-left">Unit</th>
                        <th className="py-2 px-2 text-left">Property</th>
                        <th className="py-2 px-2 text-left">Status</th>
                        <th className="py-2 px-2 text-left">Start Date</th>
                        <th className="py-2 px-2 text-left">End Date</th>
                        <th className="py-2 px-2 text-left">Rent</th>
                        <th className="py-2 px-2 text-left">Deposit</th>
                        <th className="py-2 px-2 text-left">Payment Day</th>
                        <th className="py-2 px-2 text-left">Signed At</th>
                        <th className="py-2 px-2 text-left">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredLeases.map(lease => {
                        const unit = getUnit(lease.unit_id);
                        const property = unit ? getProperty(unit.property_id) : null;
                        return (
                          <tr key={lease.id} className="border-b border-border hover:bg-muted/40">
                            <td className="py-2 px-2">{unit?.unit_label || ""}</td>
                            <td className="py-2 px-2">{property?.title || ""}</td>
                            <td className="py-2 px-2">{lease.status}</td>
                            <td className="py-2 px-2">{lease.start_date}</td>
                            <td className="py-2 px-2">{lease.end_date}</td>
                            <td className="py-2 px-2">
                              {lease.rent_amount_cents
                                ? `${(lease.rent_amount_cents / 100).toLocaleString()} ${lease.rent_currency || "USD"}`
                                : ""}
                            </td>
                            <td className="py-2 px-2">
                              {lease.deposit_cents
                                ? `${(lease.deposit_cents / 100).toLocaleString()}`
                                : ""}
                            </td>
                            <td className="py-2 px-2">{lease.payment_day_of_month}</td>
                            <td className="py-2 px-2">{lease.signed_at}</td>
                            <td className="py-2 px-2 text-center flex gap-2 justify-center">
                              <Button variant="ghost" size="icon" aria-label="Edit">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" aria-label="Delete">
                                <Trash2 className="h-4 w-4 text-red-600" />
                              </Button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </>
  );
};

export default AdminProperties;