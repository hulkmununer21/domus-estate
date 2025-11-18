import { useEffect, useState } from "react";
import {
  CheckCircle,
  Edit,
  Trash2,
  Eye,
  Plus,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import SEO from "@/components/SEO";
import logo from "@/assets/logo.png";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const TABS = [
  { key: "published", label: "Published", icon: <CheckCircle className="h-4 w-4 mr-1" /> },
  { key: "units", label: "Units", icon: <Eye className="h-4 w-4 mr-1" /> },
  { key: "leases", label: "Leases", icon: <Eye className="h-4 w-4 mr-1" /> },
];

const AdminProperties = () => {
  const [activeTab, setActiveTab] = useState("published");
  const [properties, setProperties] = useState<any[]>([]);
  const [propertyTypes, setPropertyTypes] = useState<any[]>([]);
  const [units, setUnits] = useState<any[]>([]);
  const [landlords, setLandlords] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [showAddProperty, setShowAddProperty] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<any>(null);

  // Leases tab state
  const [leases, setLeases] = useState<any[]>([]);
  const [leasesUnits, setLeasesUnits] = useState<any>({});
  const [leasesUnitImages, setLeasesUnitImages] = useState<any>({});
  const [leasesLodgers, setLeasesLodgers] = useState<any>({});
  const [leasesLoading, setLeasesLoading] = useState(true);
  const [viewLease, setViewLease] = useState<any>(null);

  useEffect(() => {
    fetchPropertyTypes();
    fetchProperties();
    fetchUnits();
    fetchLandlords();
    if (activeTab === "leases") {
      fetchLeasesTabData();
    }
    // eslint-disable-next-line
  }, [activeTab]);

  const fetchPropertyTypes = async () => {
    const { data } = await supabase.from("property_types").select("id, name");
    if (data) setPropertyTypes(data);
  };

  const fetchProperties = async () => {
    const { data } = await supabase
      .from("properties")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setProperties(data);
  };

  const fetchUnits = async () => {
    const { data } = await supabase.from("property_units").select("*");
    if (data) setUnits(data);
  };

  const fetchLandlords = async () => {
    const { data } = await supabase
      .from("landlord_profiles")
      .select("user_id, first_name, last_name, company_name");
    if (data) setLandlords(data);
  };

  // Leases Tab Data
  const fetchLeasesTabData = async () => {
    setLeasesLoading(true);
    // 1. Fetch all leases
    const { data: leaseRows } = await supabase
      .from("leases")
      .select("*")
      .order("created_at", { ascending: false });
    setLeases(leaseRows || []);

    // 2. Fetch units for these leases
    const unitIds = (leaseRows || []).map(l => l.unit_id).filter(Boolean);
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
    setLeasesUnits(unitsMap);

    // 3. Fetch primary images for units
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
    setLeasesUnitImages(imagesMap);

    // 4. Fetch lodger profiles
    const lodgerIds = (leaseRows || []).map(l => l.lodger_user_id).filter(Boolean);
    let lodgersMap: any = {};
    if (lodgerIds.length > 0) {
      const { data: lodgerRows } = await supabase
        .from("lodger_profiles")
        .select("user_id, first_name, last_name, email")
        .in("user_id", lodgerIds);
      lodgerRows?.forEach(l => {
        lodgersMap[l.user_id] = l;
      });
    }
    setLeasesLodgers(lodgersMap);

    setLeasesLoading(false);
  };

  // Add Property Modal Logic
  const [newProperty, setNewProperty] = useState({
    title: "",
    property_type_id: "",
    address: "",
    city: "",
    postal_code: "",
    year_built: "",
    landlord_user_id: "",
    description: "",
  });

  const handleAddProperty = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProperty.landlord_user_id) {
      toast.error("Please select a landlord.");
      return;
    }
    const { error } = await supabase.from("properties").insert([newProperty]);
    if (error) {
      toast.error("Failed to add property.");
    } else {
      toast.success("Property added!");
      setShowAddProperty(false);
      setNewProperty({
        title: "",
        property_type_id: "",
        address: "",
        city: "",
        postal_code: "",
        year_built: "",
        landlord_user_id: "",
        description: "",
      });
      fetchProperties();
    }
  };

  // Delete property logic
  const handleDeleteProperty = async (propertyId: string) => {
    const linkedUnits = units.filter((u: any) => u.property_id === propertyId);
    if (linkedUnits.length > 0) {
      toast.error("Cannot delete property with one or more units. Delete units first.");
      return;
    }
    const { error } = await supabase.from("properties").delete().eq("id", propertyId);
    if (error) {
      toast.error("Failed to delete property.");
    } else {
      toast.success("Property deleted.");
      fetchProperties();
    }
  };

  // View Modal Logic
  const openViewModal = (property: any) => {
    setSelectedProperty(property);
    setShowViewModal(true);
  };

  // Edit Modal Logic
  const [editProperty, setEditProperty] = useState<any>(null);

  const openEditModal = (property: any) => {
    setEditProperty({
      ...property,
    });
    setShowEditModal(true);
  };

  const handleEditProperty = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editProperty) return;
    const { id, landlord_user_id, ...updateData } = editProperty;
    const { error } = await supabase
      .from("properties")
      .update(updateData)
      .eq("id", id);
    if (error) {
      toast.error("Failed to update property.");
    } else {
      toast.success("Property updated!");
      setShowEditModal(false);
      setEditProperty(null);
      fetchProperties();
    }
  };

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

        <div className="container mx-auto px-2 sm:px-4 py-8">
          <div className="mb-4 flex items-center gap-2">
            <Input
              placeholder="Search..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="max-w-xs"
            />
          </div>

          {/* Published Properties Tab */}
          {activeTab === "published" && (
            <Card className="border-border">
              <CardHeader>
                <CardTitle>Published Properties</CardTitle>
                <Button
                  variant="default"
                  className="ml-auto flex items-center gap-1"
                  onClick={() => setShowAddProperty(true)}
                >
                  <Plus className="h-4 w-4" />
                  Add Property
                </Button>
              </CardHeader>
              <CardContent>
                <div className="w-full overflow-x-auto">
                  <table className="min-w-[900px] w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="py-2 px-2 min-w-[120px] text-left">Title</th>
                        <th className="py-2 px-2 min-w-[100px] text-left">Type</th>
                        <th className="py-2 px-2 min-w-[60px] text-left">Units</th>
                        <th className="py-2 px-2 min-w-[180px] text-left">Address</th>
                        <th className="py-2 px-2 min-w-[120px] text-left">Landlord</th>
                        <th className="py-2 px-2 min-w-[120px] text-left">Company</th>
                        <th className="py-2 px-2 min-w-[80px] text-left">Year Built</th>
                        <th className="py-2 px-2 min-w-[80px] text-left">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {properties
                        .filter(
                          (p: any) =>
                            p.title?.toLowerCase().includes(search.toLowerCase())
                        )
                        .map(property => {
                          const landlord = landlords.find(l => l.user_id === property.landlord_user_id);
                          return (
                            <tr key={property.id} className="border-b border-border hover:bg-muted/40">
                              <td className="py-2 px-2">{property.title}</td>
                              <td className="py-2 px-2">
                                {propertyTypes.find(pt => pt.id === property.property_type_id)?.name || ""}
                              </td>
                              <td className="py-2 px-2">
                                {units.filter((u: any) => u.property_id === property.id).length}
                              </td>
                              <td className="py-2 px-2">
                                {property.address}, {property.city} {property.postal_code}
                              </td>
                              <td className="py-2 px-2">
                                {landlord
                                  ? `${landlord.first_name} ${landlord.last_name}`
                                  : ""}
                              </td>
                              <td className="py-2 px-2">
                                {landlord?.company_name || ""}
                              </td>
                              <td className="py-2 px-2">{property.year_built}</td>
                              <td className="py-2 px-2 text-center flex gap-2 justify-center">
                                <Button
                                  variant="outline"
                                  size="icon"
                                  aria-label="View"
                                  onClick={() => openViewModal(property)}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  aria-label="Edit"
                                  onClick={() => openEditModal(property)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="destructive"
                                  size="icon"
                                  aria-label="Delete"
                                  onClick={() => handleDeleteProperty(property.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
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

          {/* Add Property Modal */}
          {showAddProperty && (
            <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
              <Card className="w-full max-w-lg border-border">
                <CardHeader>
                  <CardTitle>Add Property</CardTitle>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-4 right-4"
                    onClick={() => setShowAddProperty(false)}
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </CardHeader>
                <CardContent>
                  <form className="space-y-4" onSubmit={handleAddProperty}>
                    <Input
                      placeholder="Title"
                      value={newProperty.title}
                      onChange={e => setNewProperty({ ...newProperty, title: e.target.value })}
                      required
                    />
                    <select
                      className="w-full border rounded px-2 py-2"
                      value={newProperty.property_type_id}
                      onChange={e => setNewProperty({ ...newProperty, property_type_id: e.target.value })}
                      required
                    >
                      <option value="">Select Type</option>
                      {propertyTypes.map(pt => (
                        <option key={pt.id} value={pt.id}>{pt.name}</option>
                      ))}
                    </select>
                    <Input
                      placeholder="Address"
                      value={newProperty.address}
                      onChange={e => setNewProperty({ ...newProperty, address: e.target.value })}
                      required
                    />
                    <Input
                      placeholder="City"
                      value={newProperty.city}
                      onChange={e => setNewProperty({ ...newProperty, city: e.target.value })}
                      required
                    />
                    <Input
                      placeholder="Postal Code"
                      value={newProperty.postal_code}
                      onChange={e => setNewProperty({ ...newProperty, postal_code: e.target.value })}
                      required
                    />
                    <Input
                      placeholder="Year Built"
                      value={newProperty.year_built}
                      onChange={e => setNewProperty({ ...newProperty, year_built: e.target.value })}
                      required
                    />
                    <textarea
                      className="w-full border rounded px-2 py-2"
                      placeholder="Description"
                      value={newProperty.description}
                      onChange={e => setNewProperty({ ...newProperty, description: e.target.value })}
                    />
                    <select
                      className="w-full border rounded px-2 py-2"
                      value={newProperty.landlord_user_id}
                      onChange={e => setNewProperty({ ...newProperty, landlord_user_id: e.target.value })}
                      required
                    >
                      <option value="">Assign Landlord</option>
                      {landlords.map(l => (
                        <option key={l.user_id} value={l.user_id}>
                          {l.first_name} {l.last_name} {l.company_name ? `(${l.company_name})` : ""}
                        </option>
                      ))}
                    </select>
                    <div className="flex gap-2 justify-end">
                      <Button variant="outline" type="button" onClick={() => setShowAddProperty(false)}>
                        Cancel
                      </Button>
                      <Button type="submit">Add Property</Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
          )}

          {/* View Property Modal */}
          {showViewModal && selectedProperty && (
            <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
              <Card className="w-full max-w-lg border-border">
                <CardHeader>
                  <CardTitle>View Property</CardTitle>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-4 right-4"
                    onClick={() => setShowViewModal(false)}
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div>
                      <strong>Title:</strong> {selectedProperty.title}
                    </div>
                    <div>
                      <strong>Type:</strong> {propertyTypes.find(pt => pt.id === selectedProperty.property_type_id)?.name || ""}
                    </div>
                    <div>
                      <strong>Address:</strong> {selectedProperty.address}, {selectedProperty.city} {selectedProperty.postal_code}
                    </div>
                    <div>
                      <strong>Year Built:</strong> {selectedProperty.year_built}
                    </div>
                    <div>
                      <strong>Description:</strong> {selectedProperty.description}
                    </div>
                    <div>
                      <strong>Landlord:</strong> {
                        landlords.find(l => l.user_id === selectedProperty.landlord_user_id)
                          ? `${landlords.find(l => l.user_id === selectedProperty.landlord_user_id).first_name} ${landlords.find(l => l.user_id === selectedProperty.landlord_user_id).last_name}`
                          : ""
                      }
                    </div>
                    <div>
                      <strong>Company:</strong> {
                        landlords.find(l => l.user_id === selectedProperty.landlord_user_id)?.company_name || ""
                      }
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Edit Property Modal */}
          {showEditModal && editProperty && (
            <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
              <Card className="w-full max-w-lg border-border">
                <CardHeader>
                  <CardTitle>Edit Property</CardTitle>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-4 right-4"
                    onClick={() => setShowEditModal(false)}
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </CardHeader>
                <CardContent>
                  <form className="space-y-4" onSubmit={handleEditProperty}>
                    <Input
                      placeholder="Title"
                      value={editProperty.title}
                      onChange={e => setEditProperty({ ...editProperty, title: e.target.value })}
                      required
                    />
                    <select
                      className="w-full border rounded px-2 py-2"
                      value={editProperty.property_type_id}
                      onChange={e => setEditProperty({ ...editProperty, property_type_id: e.target.value })}
                      required
                    >
                      <option value="">Select Type</option>
                      {propertyTypes.map(pt => (
                        <option key={pt.id} value={pt.id}>{pt.name}</option>
                      ))}
                    </select>
                    <Input
                      placeholder="Address"
                      value={editProperty.address}
                      onChange={e => setEditProperty({ ...editProperty, address: e.target.value })}
                      required
                    />
                    <Input
                      placeholder="City"
                      value={editProperty.city}
                      onChange={e => setEditProperty({ ...editProperty, city: e.target.value })}
                      required
                    />
                    <Input
                      placeholder="Postal Code"
                      value={editProperty.postal_code}
                      onChange={e => setEditProperty({ ...editProperty, postal_code: e.target.value })}
                      required
                    />
                    <Input
                      placeholder="Year Built"
                      value={editProperty.year_built}
                      onChange={e => setEditProperty({ ...editProperty, year_built: e.target.value })}
                      required
                    />
                    <textarea
                      className="w-full border rounded px-2 py-2"
                      placeholder="Description"
                      value={editProperty.description}
                      onChange={e => setEditProperty({ ...editProperty, description: e.target.value })}
                    />
                    {/* Landlord is not editable */}
                    <div className="flex gap-2 justify-end">
                      <Button variant="outline" type="button" onClick={() => setShowEditModal(false)}>
                        Cancel
                      </Button>
                      <Button type="submit">Save Changes</Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Units Tab */}
          {activeTab === "units" && (
            <Card className="border-border">
              <CardHeader>
                <CardTitle>Units</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="w-full overflow-x-auto">
                  <table className="min-w-[900px] w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="py-2 px-2 min-w-[120px] text-left">Unit Label</th>
                        <th className="py-2 px-2 min-w-[120px] text-left">Property</th>
                        <th className="py-2 px-2 min-w-[80px] text-left">Bedrooms</th>
                        <th className="py-2 px-2 min-w-[80px] text-left">Bathrooms</th>
                        <th className="py-2 px-2 min-w-[100px] text-left">Area (sqft)</th>
                        <th className="py-2 px-2 min-w-[80px] text-left">Furnished</th>
                        <th className="py-2 px-2 min-w-[100px] text-left">Rent</th>
                        <th className="py-2 px-2 min-w-[100px] text-left">Deposit</th>
                        <th className="py-2 px-2 min-w-[120px] text-left">Available From</th>
                        <th className="py-2 px-2 min-w-[80px] text-left">Status</th>
                        <th className="py-2 px-2 min-w-[80px] text-left">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {units.map(unit => (
                        <tr key={unit.id} className="border-b border-border hover:bg-muted/40">
                          <td className="py-2 px-2">{unit.unit_label}</td>
                          <td className="py-2 px-2">{properties.find(p => p.id === unit.property_id)?.title || ""}</td>
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
                            <Button variant="outline" size="icon" aria-label="View">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="icon" aria-label="Edit">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="destructive" size="icon" aria-label="Delete">
                              <Trash2 className="h-4 w-4" />
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
                {leasesLoading ? (
                  <div>Loading leases...</div>
                ) : leases.length === 0 ? (
                  <div>No leases found.</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="py-2 px-2 text-left">Unit</th>
                          <th className="py-2 px-2 text-left">Image</th>
                          <th className="py-2 px-2 text-left">Lodger</th>
                          <th className="py-2 px-2 text-left">Email</th>
                          <th className="py-2 px-2 text-left">Status</th>
                          <th className="py-2 px-2 text-left">Start</th>
                          <th className="py-2 px-2 text-left">End</th>
                          <th className="py-2 px-2 text-center">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {leases.map(lease => {
                          const unit = leasesUnits[lease.unit_id];
                          const unitLabel = unit?.unit_label || "N/A";
                          const unitImage = leasesUnitImages[lease.unit_id] ||
                            "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400";
                          const lodger = leasesLodgers[lease.lodger_user_id];
                          const leaseStatus =
                            !lease.signed_at && !lease.signed_document_id
                              ? "Pending Signature"
                              : lease.status;
                          return (
                            <tr key={lease.id} className="border-b border-border hover:bg-muted/40">
                              <td className="py-2 px-2">{unitLabel}</td>
                              <td className="py-2 px-2">
                                <img
                                  src={unitImage}
                                  alt={unitLabel}
                                  className="w-12 h-12 object-cover rounded"
                                />
                              </td>
                              <td className="py-2 px-2">
                                {lodger
                                  ? `${lodger.first_name} ${lodger.last_name}`
                                  : "N/A"}
                              </td>
                              <td className="py-2 px-2">{lodger?.email || "N/A"}</td>
                              <td className="py-2 px-2">{leaseStatus}</td>
                              <td className="py-2 px-2">{lease.start_date || "N/A"}</td>
                              <td className="py-2 px-2">{lease.end_date || "N/A"}</td>
                              <td className="py-2 px-2 text-center">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setViewLease(lease)}
                                >
                                  View
                                </Button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
                {/* Lease Details Modal */}
                {viewLease && (
                  <Dialog open={!!viewLease} onOpenChange={() => setViewLease(null)}>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Lease Details</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-2">
                        <div>
                          <span className="font-semibold">Unit:</span> {leasesUnits[viewLease.unit_id]?.unit_label || "N/A"}
                        </div>
                        <div>
                          <span className="font-semibold">Lodger:</span>{" "}
                          {leasesLodgers[viewLease.lodger_user_id]
                            ? `${leasesLodgers[viewLease.lodger_user_id].first_name} ${leasesLodgers[viewLease.lodger_user_id].last_name}`
                            : "N/A"}
                        </div>
                        <div>
                          <span className="font-semibold">Email:</span> {leasesLodgers[viewLease.lodger_user_id]?.email || "N/A"}
                        </div>
                        <div>
                          <span className="font-semibold">Status:</span>{" "}
                          {!viewLease.signed_at && !viewLease.signed_document_id
                            ? "Pending Signature"
                            : viewLease.status}
                        </div>
                        <div>
                          <span className="font-semibold">Start Date:</span> {viewLease.start_date || "N/A"}
                        </div>
                        <div>
                          <span className="font-semibold">End Date:</span> {viewLease.end_date || "N/A"}
                        </div>
                        <div>
                          <span className="font-semibold">Rent Amount:</span> £{viewLease.rent_amount || "N/A"}
                        </div>
                        <div>
                          <span className="font-semibold">Currency:</span> {viewLease.rent_currency || "N/A"}
                        </div>
                        <div>
                          <span className="font-semibold">Created At:</span> {viewLease.created_at}
                        </div>
                        <div>
                          <span className="font-semibold">Updated At:</span> {viewLease.updated_at}
                        </div>
                      </div>
                      <div className="flex justify-end mt-4">
                        <Button variant="outline" onClick={() => setViewLease(null)}>
                          Close
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </>
  );
};

export default AdminProperties;