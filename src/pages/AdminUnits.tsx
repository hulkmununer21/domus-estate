import { useEffect, useState } from "react";
import { Eye, Edit, Trash2, Plus, X, Image as ImageIcon, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import SEO from "@/components/SEO";
import logo from "@/assets/logo.png";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";

const AdminUnits = () => {
  const [units, setUnits] = useState<any[]>([]);
  const [properties, setProperties] = useState<any[]>([]);
  const [features, setFeatures] = useState<any[]>([]);
  const [unitImages, setUnitImages] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [showAddUnit, setShowAddUnit] = useState(false);
  const [showEditUnit, setShowEditUnit] = useState(false);
  const [showPreviewUnit, setShowPreviewUnit] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState<any>(null);

  // add/edit form state (omit is_published)
  const [unitForm, setUnitForm] = useState<any>({
    property_id: "",
    unit_label: "",
    bedrooms: 1,
    bathrooms: 1,
    area_sqft: 0,
    furnished: false,
    rent_amount: 0,
    rent_currency: "USD",
    deposit_amount: 0,
    available_from: "",
    status: "draft",
    unit_description: "",
    unit_features: [],
    is_featured: false,
  });

  const [unitImageFiles, setUnitImageFiles] = useState<File[]>([]);
  const [editFeatures, setEditFeatures] = useState<string[]>([]);
  const [editImages, setEditImages] = useState<any[]>([]);
  const [editImageFiles, setEditImageFiles] = useState<File[]>([]);

  useEffect(() => {
    fetchUnits();
    fetchProperties();
    fetchFeatures();
    fetchUnitImages();
  }, []);

  const fetchUnits = async () => {
    const { data, error } = await supabase.from("property_units").select("*");
    if (error) {
      console.error("Fetch Units Error:", error);
      toast.error("Failed to fetch units.");
      return;
    }
    setUnits(data || []);
  };

  const fetchProperties = async () => {
    const { data, error } = await supabase.from("properties").select("id, title");
    if (error) {
      console.error("Fetch Properties Error:", error);
      toast.error("Failed to fetch properties.");
      return;
    }
    setProperties(data || []);
  };

  const fetchFeatures = async () => {
    const { data, error } = await supabase.from("features").select("*");
    if (error) {
      console.error("Fetch Features Error:", error);
      toast.error("Failed to fetch features.");
      return;
    }
    setFeatures(data || []);
  };

  const fetchUnitImages = async () => {
    const { data, error } = await supabase
      .from("property_unit_images")
      .select("unit_id, asset_id, is_primary, sort_order, id");
    if (error) {
      console.error("Fetch Unit Images Error:", error);
      toast.error("Failed to fetch unit images.");
      return;
    }
    if (!data) {
      setUnitImages([]);
      return;
    }
    const imagesWithUrls = await Promise.all(
      data.map(async (img: any) => {
        let url = "";
        if (img.asset_id) {
          const { data: asset, error: assetError } = await supabase
            .from("assets")
            .select("public_url")
            .eq("id", img.asset_id)
            .single();
          if (assetError) {
            console.error("Fetch Asset Error:", assetError);
          }
          url = asset?.public_url || "";
        }
        return { ...img, public_url: url };
      })
    );
    setUnitImages(imagesWithUrls);
  };

  // helper: get primary image URL for unit (is_primary === true)
  const getPrimaryImageForUnit = (unitId: string) => {
    const img = unitImages.find((ui: any) => ui.unit_id === unitId && ui.is_primary);
    return img?.public_url || "";
  };

  // File inputs
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setUnitImageFiles(Array.from(e.target.files));
  };

  const handleEditImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setEditImageFiles(Array.from(e.target.files));
  };

  // Add Unit (features saved in unit_features jsonb, images uploaded to storage and linked)
  const handleAddUnit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const rent_amount = Number(unitForm.rent_amount);
      const deposit_amount = Number(unitForm.deposit_amount);

      const { data: unitData, error: unitError } = await supabase
        .from("property_units")
        .insert([{ 
          ...unitForm, 
          rent_amount, 
          deposit_amount, 
          unit_features: unitForm.unit_features,
          is_featured: unitForm.is_featured,
        }])
        .select()
        .single();

      if (unitError || !unitData) {
        console.error("Add Unit Error:", unitError);
        toast.error("Failed to add unit.");
        return;
      }

      // upload images and link
      for (let i = 0; i < unitImageFiles.length; i++) {
        const file = unitImageFiles[i];
        const fileName = `${Date.now()}_${i}_${file.name}`;
        const { error: uploadError } = await supabase.storage.from("unit-images").upload(fileName, file);

        if (uploadError) {
          console.error("Image Upload Error:", uploadError);
          toast.error(`Image ${file.name} upload failed.`);
          continue;
        }

        const publicUrl = supabase.storage.from("unit-images").getPublicUrl(fileName).data?.publicUrl || "";

        const { data: assetData, error: assetError } = await supabase
          .from("assets")
          .insert([{
            storage_provider: "supabase",
            bucket: "unit-images",
            file_key: fileName,
            file_name: file.name,
            public_url: publicUrl,
            content_type: file.type,
            byte_size: file.size,
          }])
          .select()
          .single();

        if (assetError || !assetData) {
          console.error("Asset Insert Error:", assetError);
          toast.error(`Failed to save metadata for ${file.name}.`);
          continue;
        }

        const { error: linkError } = await supabase.from("property_unit_images").insert([{
          unit_id: unitData.id,
          asset_id: assetData.id,
          is_primary: i === 0,
          sort_order: i,
        }]);

        if (linkError) console.error("Image Link Error:", linkError);
      }

      toast.success("Unit added.");
      setShowAddUnit(false);
      setUnitForm({
        property_id: "",
        unit_label: "",
        bedrooms: 1,
        bathrooms: 1,
        area_sqft: 0,
        furnished: false,
        rent_amount: 0,
        rent_currency: "USD",
        deposit_amount: 0,
        available_from: "",
        status: "draft",
        unit_description: "",
        unit_features: [],
        is_featured: false,
      });
      setUnitImageFiles([]);
      await fetchUnits();
      await fetchUnitImages();
    } catch (err) {
      console.error("Unhandled Add Unit Error:", err);
      toast.error("Unexpected error adding unit.");
    }
  };

  // Open edit modal
  const openEditUnit = (unit: any) => {
    setEditFeatures(unit.unit_features || []);
    setUnitForm({ ...unit, unit_features: unit.unit_features || [], is_featured: !!unit.is_featured });
    const imagesForUnit = unitImages.filter((img: any) => img.unit_id === unit.id);
    setEditImages(imagesForUnit);
    setEditImageFiles([]);
    setSelectedUnit(unit);
    setShowEditUnit(true);
  };

  // Edit unit
  const handleEditUnit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { id, ...updateData } = unitForm;
      const rent_amount = Number(updateData.rent_amount);
      const deposit_amount = Number(updateData.deposit_amount);

      const { error } = await supabase
        .from("property_units")
        .update({ 
          ...updateData, 
          rent_amount, 
          deposit_amount, 
          unit_features: unitForm.unit_features,
          is_featured: unitForm.is_featured,
        })
        .eq("id", id);

      if (error) {
        console.error("Edit Unit Error:", error);
        toast.error("Failed to update unit.");
        return;
      }

      toast.success("Unit updated.");
      setShowEditUnit(false);
      setUnitForm({
        property_id: "",
        unit_label: "",
        bedrooms: 1,
        bathrooms: 1,
        area_sqft: 0,
        furnished: false,
        rent_amount: 0,
        rent_currency: "USD",
        deposit_amount: 0,
        available_from: "",
        status: "draft",
        unit_description: "",
        unit_features: [],
        is_featured: false,
      });
      setUnitImageFiles([]);
      await fetchUnits();
      await fetchUnitImages();
    } catch (err) {
      console.error("Unhandled Edit Unit Error:", err);
      toast.error("Unexpected error updating unit.");
    }
  };

  // Add feature to unit (edit mode)
  const handleAddEditFeature = (featureId: string) => {
    if (!selectedUnit) return;
    const updatedFeatures = [...editFeatures, featureId];
    setEditFeatures(updatedFeatures);
    setUnitForm({ ...unitForm, unit_features: updatedFeatures });
  };

  // Remove feature from unit (edit mode)
  const handleRemoveEditFeature = (featureId: string) => {
    if (!selectedUnit) return;
    const updatedFeatures = editFeatures.filter(f => f !== featureId);
    setEditFeatures(updatedFeatures);
    setUnitForm({ ...unitForm, unit_features: updatedFeatures });
  };

  // Add image(s) while editing a unit
  const handleAddImage = async () => {
    if (!selectedUnit || editImageFiles.length === 0) return;
    try {
      for (let i = 0; i < editImageFiles.length; i++) {
        const file = editImageFiles[i];
        const fileName = `${Date.now()}_${i}_${file.name}`;
        const { error: uploadError } = await supabase.storage.from("unit-images").upload(fileName, file);

        if (uploadError) {
          console.error("Edit Image Upload Error:", uploadError);
          toast.error(`Image ${file.name} upload failed.`);
          continue;
        }

        const publicUrl = supabase.storage.from("unit-images").getPublicUrl(fileName).data?.publicUrl || "";

        const { data: assetData, error: assetError } = await supabase
          .from("assets")
          .insert([{
            storage_provider: "supabase",
            bucket: "unit-images",
            file_key: fileName,
            file_name: file.name,
            public_url: publicUrl,
            content_type: file.type,
            byte_size: file.size,
          }])
          .select()
          .single();

        if (assetError || !assetData) {
          console.error("Edit Asset Insert Error:", assetError);
          toast.error(`Failed to save metadata for ${file.name}.`);
          continue;
        }

        const isPrimary = !editImages.some((img: any) => img.is_primary) && i === 0;

        const { error: linkError } = await supabase.from("property_unit_images").insert([{
          unit_id: selectedUnit.id,
          asset_id: assetData.id,
          is_primary: isPrimary,
          sort_order: editImages.length + i,
        }]);

        if (linkError) console.error("Edit Image Link Error:", linkError);
      }

      toast.success("Image(s) added.");
      setEditImageFiles([]);
      await fetchUnitImages();
      const imagesForUnit = unitImages.filter((img: any) => img.unit_id === selectedUnit.id);
      setEditImages(imagesForUnit);
    } catch (err) {
      console.error("Unhandled Edit Image Error:", err);
      toast.error("Unexpected error uploading images.");
    }
  };

  // Remove image link
  const handleRemoveImage = async (imageId: string) => {
    const { error } = await supabase.from("property_unit_images").delete().eq("id", imageId);
    if (error) {
      console.error("Remove Image Error:", error);
      toast.error("Failed to remove image.");
      return;
    }
    toast.success("Image removed.");
    await fetchUnitImages();
    const imagesForUnit = unitImages.filter((img: any) => img.unit_id === selectedUnit?.id);
    setEditImages(imagesForUnit);
  };

  // Delete unit
  const handleDeleteUnit = async (unitId: string) => {
    const { error } = await supabase.from("property_units").delete().eq("id", unitId);
    if (error) {
      console.error("Delete Unit Error:", error);
      toast.error("Failed to delete unit.");
      return;
    }
    toast.success("Unit deleted.");
    await fetchUnits();
    await fetchUnitImages();
  };

  // Preview unit
  const openPreviewUnit = (unit: any) => {
    setSelectedUnit(unit);
    setShowPreviewUnit(true);
  };

  return (
    <>
      <SEO title="Admin Units - Domus Servitia" description="Manage property units and images." canonical="https://domusservitia.co.uk/admin-units" />
      <div className="min-h-screen bg-muted/30">
        <header className="bg-card border-b border-border sticky top-0 z-50 shadow-sm">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between h-16">
              <img src={logo} alt="Domus Servitia" className="h-10 rounded-lg" />
              <Button variant="default" className="flex items-center gap-1" onClick={() => setShowAddUnit(true)}>
                <Plus className="h-4 w-4" /> Add Unit
              </Button>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-2 sm:px-4 py-8">
          <div className="mb-4 flex items-center gap-2">
            <Input placeholder="Search units..." value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-xs" />
          </div>

          <Card className="border-border">
            <CardHeader>
              <CardTitle>Property Units</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="w-full overflow-x-auto">
                <table className="min-w-[900px] w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="py-2 px-2">Image</th>
                      <th className="py-2 px-2">Label</th>
                      <th className="py-2 px-2">Property</th>
                      <th className="py-2 px-2">Bedrooms</th>
                      <th className="py-2 px-2">Bathrooms</th>
                      <th className="py-2 px-2">Area (sqft)</th>
                      <th className="py-2 px-2">Furnished</th>
                      <th className="py-2 px-2">Rent</th>
                      <th className="py-2 px-2">Deposit</th>
                      <th className="py-2 px-2">Available From</th>
                      <th className="py-2 px-2">Status</th>
                      <th className="py-2 px-2">Featured</th>
                      <th className="py-2 px-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {units
                      .filter((u) => u.unit_label?.toLowerCase().includes(search.toLowerCase()))
                      .map((unit) => (
                        <tr key={unit.id} className="border-b border-border hover:bg-muted/40">
                          <td className="py-2 px-2">
                            {getPrimaryImageForUnit(unit.id) ? (
                              <img src={getPrimaryImageForUnit(unit.id)} alt="Unit" className="h-10 w-16 object-cover rounded" />
                            ) : (
                              <ImageIcon className="h-6 w-6 text-muted-foreground" />
                            )}
                          </td>
                          <td className="py-2 px-2">{unit.unit_label}</td>
                          <td className="py-2 px-2">{properties.find((p) => p.id === unit.property_id)?.title || ""}</td>
                          <td className="py-2 px-2">{unit.bedrooms}</td>
                          <td className="py-2 px-2">{unit.bathrooms}</td>
                          <td className="py-2 px-2">{unit.area_sqft}</td>
                          <td className="py-2 px-2">{unit.furnished ? "Yes" : "No"}</td>
                          <td className="py-2 px-2">
                            {unit.rent_amount ? `${unit.rent_amount.toLocaleString()} ${unit.rent_currency || "USD"}` : ""}
                          </td>
                          <td className="py-2 px-2">{unit.deposit_amount ? `${unit.deposit_amount.toLocaleString()}` : ""}</td>
                          <td className="py-2 px-2">{unit.available_from}</td>
                          <td className="py-2 px-2">{unit.status}</td>
                          <td className="py-2 px-2">{unit.is_featured ? "Yes" : "No"}</td>
                          <td className="py-2 px-2 flex gap-2">
                            <Button variant="outline" size="icon" aria-label="Preview" onClick={() => openPreviewUnit(unit)}>
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="icon" aria-label="Edit" onClick={() => openEditUnit(unit)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="destructive" size="icon" aria-label="Delete" onClick={() => handleDeleteUnit(unit.id)}>
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
        </div>

        {/* Add Unit Modal */}
        {showAddUnit && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="relative w-full max-w-lg mx-2 sm:mx-auto">
              <Card className="border-border shadow-lg rounded-lg bg-card">
                <CardHeader className="sticky top-0 bg-card z-10">
                  <CardTitle>Add Unit</CardTitle>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-4 right-4"
                    onClick={() => setShowAddUnit(false)}
                    aria-label="Close"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="max-h-[80vh] overflow-y-auto py-2 px-1">
                    <form className="space-y-4" onSubmit={handleAddUnit}>
                      {/* ...existing fields... */}
                      <label className="block mb-1 font-medium" htmlFor="property_id">Property</label>
                      <select
                        id="property_id"
                        className="w-full border rounded px-2 py-2"
                        value={unitForm.property_id}
                        onChange={e => setUnitForm({ ...unitForm, property_id: e.target.value })}
                        required
                      >
                        <option value="">Select Property</option>
                        {properties.map(p => (
                          <option key={p.id} value={p.id}>{p.title}</option>
                        ))}
                      </select>
                      <label className="block mb-1 font-medium" htmlFor="unit_label">Unit Label</label>
                      <Input
                        id="unit_label"
                        placeholder="Unit Label"
                        value={unitForm.unit_label}
                        onChange={e => setUnitForm({ ...unitForm, unit_label: e.target.value })}
                        required
                      />
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block mb-1 font-medium" htmlFor="bedrooms">Bedrooms</label>
                          <Input
                            id="bedrooms"
                            type="number"
                            placeholder="Bedrooms"
                            value={unitForm.bedrooms}
                            onChange={e => setUnitForm({ ...unitForm, bedrooms: Number(e.target.value) })}
                            required
                          />
                        </div>
                        <div>
                          <label className="block mb-1 font-medium" htmlFor="bathrooms">Bathrooms</label>
                          <Input
                            id="bathrooms"
                            type="number"
                            placeholder="Bathrooms"
                            value={unitForm.bathrooms}
                            onChange={e => setUnitForm({ ...unitForm, bathrooms: Number(e.target.value) })}
                            required
                          />
                        </div>
                      </div>
                      <label className="block mb-1 font-medium" htmlFor="area_sqft">Area (sqft)</label>
                      <Input
                        id="area_sqft"
                        type="number"
                        placeholder="Area (sqft)"
                        value={unitForm.area_sqft}
                        onChange={e => setUnitForm({ ...unitForm, area_sqft: Number(e.target.value) })}
                        required
                      />
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={unitForm.furnished}
                          onChange={e => setUnitForm({ ...unitForm, furnished: e.target.checked })}
                          id="furnished"
                        />
                        <label htmlFor="furnished">Furnished</label>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block mb-1 font-medium" htmlFor="rent_amount">Rent Amount</label>
                          <Input
                            id="rent_amount"
                            type="number"
                            placeholder="Rent Amount"
                            value={unitForm.rent_amount}
                            onChange={e => setUnitForm({ ...unitForm, rent_amount: e.target.value })}
                            required
                          />
                        </div>
                        <div>
                          <label className="block mb-1 font-medium" htmlFor="rent_currency">Rent Currency</label>
                          <Input
                            id="rent_currency"
                            placeholder="Rent Currency"
                            value={unitForm.rent_currency}
                            onChange={e => setUnitForm({ ...unitForm, rent_currency: e.target.value })}
                            required
                          />
                        </div>
                      </div>
                      <label className="block mb-1 font-medium" htmlFor="deposit_amount">Deposit</label>
                      <Input
                        id="deposit_amount"
                        type="number"
                        placeholder="Deposit"
                        value={unitForm.deposit_amount}
                        onChange={e => setUnitForm({ ...unitForm, deposit_amount: e.target.value })}
                        required
                      />
                      <label className="block mb-1 font-medium" htmlFor="available_from">Available From</label>
                      <Input
                        id="available_from"
                        type="date"
                        placeholder="Available From"
                        value={unitForm.available_from}
                        onChange={e => setUnitForm({ ...unitForm, available_from: e.target.value })}
                        required
                      />
                      <label className="block mb-1 font-medium" htmlFor="status">Status</label>
                      <select
                        id="status"
                        className="w-full border rounded px-2 py-2"
                        value={unitForm.status}
                        onChange={e => setUnitForm({ ...unitForm, status: e.target.value })}
                        required
                      >
                        <option value="draft">Draft</option>
                        <option value="published">Published</option>
                      </select>
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={unitForm.is_featured}
                          onChange={e => setUnitForm({ ...unitForm, is_featured: e.target.checked })}
                          id="is_featured"
                        />
                        <label htmlFor="is_featured">Featured (show on homepage)</label>
                      </div>
                      <label className="block mb-1 font-medium" htmlFor="unit_description">Description</label>
                      <textarea
                        id="unit_description"
                        className="w-full border rounded px-2 py-2"
                        placeholder="Description"
                        value={unitForm.unit_description}
                        onChange={e => setUnitForm({ ...unitForm, unit_description: e.target.value })}
                      />

                      {/* Features selection */}
                      <div>
                        <label className="block mb-1 font-medium" htmlFor="unit_features">Features</label>
                        <div className="flex flex-wrap gap-2 mb-2">
                          {unitForm.unit_features.map((fid: string) => {
                            const f = features.find((ft: any) => ft.id === fid);
                            return (
                              <span key={fid} className="flex items-center gap-1 bg-muted px-2 py-1 rounded">
                                {f?.name}
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() =>
                                    setUnitForm({
                                      ...unitForm,
                                      unit_features: unitForm.unit_features.filter((id: string) => id !== fid),
                                    })
                                  }
                                  aria-label="Remove Feature"
                                >
                                  <Trash className="h-4 w-4 text-destructive" />
                                </Button>
                              </span>
                            );
                          })}
                        </div>
                        <select
                          id="unit_features"
                          className="w-full border rounded px-2 py-2"
                          value=""
                          onChange={e => {
                            const val = e.target.value;
                            if (val && !unitForm.unit_features.includes(val)) {
                              setUnitForm({
                                ...unitForm,
                                unit_features: [...unitForm.unit_features, val],
                              });
                            }
                          }}
                        >
                          <option value="">Add Feature</option>
                          {features
                            .filter(f => !unitForm.unit_features.includes(f.id))
                            .map(f => (
                              <option key={f.id} value={f.id}>{f.name}</option>
                            ))}
                        </select>
                      </div>
                      {/* Images upload */}
                      <div>
                        <label className="block mb-1 font-medium" htmlFor="unit_images">Unit Images</label>
                        <input
                          id="unit_images"
                          type="file"
                          accept="image/*"
                          multiple
                          style={{ display: "none" }}
                          onChange={handleFileChange}
                        />
                        <Button
                          className="mt-2"
                          type="button"
                          onClick={() => document.getElementById("unit_images")?.click()}
                        >
                          Add Another Image
                        </Button>
                        {unitImageFiles.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {unitImageFiles.map((file, idx) => (
                              <span key={idx} className="text-xs bg-muted px-2 py-1 rounded">
                                {file.name}
                                {idx === 0 && (
                                  <span className="ml-2 text-xs text-accent font-bold">Primary</span>
                                )}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2 justify-end sticky bottom-0 bg-card py-2">
                        <Button variant="outline" type="button" onClick={() => setShowAddUnit(false)}>
                          Cancel
                        </Button>
                        <Button type="submit">Add Unit</Button>
                      </div>
                    </form>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Edit Unit Modal */}
        {showEditUnit && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="relative w-full max-w-lg mx-2 sm:mx-auto">
              <Card className="border-border shadow-lg rounded-lg bg-card">
                <CardHeader className="sticky top-0 bg-card z-10">
                  <CardTitle>Edit Unit</CardTitle>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-4 right-4"
                    onClick={() => setShowEditUnit(false)}
                    aria-label="Close"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="max-h-[80vh] overflow-y-auto py-2 px-1">
                    <form className="space-y-4" onSubmit={handleEditUnit}>
                      <label className="block mb-1 font-medium" htmlFor="property_id">Property</label>
                      <select
                        id="property_id"
                        className="w-full border rounded px-2 py-2"
                        value={unitForm.property_id}
                        onChange={e => setUnitForm({ ...unitForm, property_id: e.target.value })}
                        required
                      >
                        <option value="">Select Property</option>
                        {properties.map(p => (
                          <option key={p.id} value={p.id}>{p.title}</option>
                        ))}
                      </select>
                      <label className="block mb-1 font-medium" htmlFor="unit_label">Unit Label</label>
                      <Input
                        id="unit_label"
                        placeholder="Unit Label"
                        value={unitForm.unit_label}
                        onChange={e => setUnitForm({ ...unitForm, unit_label: e.target.value })}
                        required
                      />
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block mb-1 font-medium" htmlFor="bedrooms">Bedrooms</label>
                          <Input
                            id="bedrooms"
                            type="number"
                            placeholder="Bedrooms"
                            value={unitForm.bedrooms}
                            onChange={e => setUnitForm({ ...unitForm, bedrooms: Number(e.target.value) })}
                            required
                          />
                        </div>
                        <div>
                          <label className="block mb-1 font-medium" htmlFor="bathrooms">Bathrooms</label>
                          <Input
                            id="bathrooms"
                            type="number"
                            placeholder="Bathrooms"
                            value={unitForm.bathrooms}
                            onChange={e => setUnitForm({ ...unitForm, bathrooms: Number(e.target.value) })}
                            required
                          />
                        </div>
                      </div>
                      <label className="block mb-1 font-medium" htmlFor="area_sqft">Area (sqft)</label>
                      <Input
                        id="area_sqft"
                        type="number"
                        placeholder="Area (sqft)"
                        value={unitForm.area_sqft}
                        onChange={e => setUnitForm({ ...unitForm, area_sqft: Number(e.target.value) })}
                        required
                      />
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={unitForm.furnished}
                          onChange={e => setUnitForm({ ...unitForm, furnished: e.target.checked })}
                          id="furnished"
                        />
                        <label htmlFor="furnished">Furnished</label>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block mb-1 font-medium" htmlFor="rent_amount">Rent Amount</label>
                          <Input
                            id="rent_amount"
                            type="number"
                            placeholder="Rent Amount"
                            value={unitForm.rent_amount}
                            onChange={e => setUnitForm({ ...unitForm, rent_amount: e.target.value })}
                            required
                          />
                        </div>
                        <div>
                          <label className="block mb-1 font-medium" htmlFor="rent_currency">Rent Currency</label>
                          <Input
                            id="rent_currency"
                            placeholder="Rent Currency"
                            value={unitForm.rent_currency}
                            onChange={e => setUnitForm({ ...unitForm, rent_currency: e.target.value })}
                            required
                          />
                        </div>
                      </div>
                      <label className="block mb-1 font-medium" htmlFor="deposit_amount">Deposit</label>
                      <Input
                        id="deposit_amount"
                        type="number"
                        placeholder="Deposit"
                        value={unitForm.deposit_amount}
                        onChange={e => setUnitForm({ ...unitForm, deposit_amount: e.target.value })}
                        required
                      />
                      <label className="block mb-1 font-medium" htmlFor="available_from">Available From</label>
                      <Input
                        id="available_from"
                        type="date"
                        placeholder="Available From"
                        value={unitForm.available_from}
                        onChange={e => setUnitForm({ ...unitForm, available_from: e.target.value })}
                        required
                      />
                      <label className="block mb-1 font-medium" htmlFor="status">Status</label>
                      <select
                        id="status"
                        className="w-full border rounded px-2 py-2"
                        value={unitForm.status}
                        onChange={e => setUnitForm({ ...unitForm, status: e.target.value })}
                        required
                      >
                        <option value="draft">Draft</option>
                        <option value="published">Published</option>
                      </select>
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={unitForm.is_featured}
                          onChange={e => setUnitForm({ ...unitForm, is_featured: e.target.checked })}
                          id="is_featured"
                        />
                        <label htmlFor="is_featured">Featured (show on homepage)</label>
                      </div>
                      <label className="block mb-1 font-medium" htmlFor="unit_description">Description</label>
                      <textarea
                        id="unit_description"
                        className="w-full border rounded px-2 py-2"
                        placeholder="Description"
                        value={unitForm.unit_description}
                        onChange={e => setUnitForm({ ...unitForm, unit_description: e.target.value })}
                      />

                      {/* Features CRUD */}
                      <div>
                        <label className="block mb-1 font-medium" htmlFor="edit_unit_features">Features</label>
                        <div className="flex flex-wrap gap-2 mb-2">
                          {editFeatures.map((fid: string) => {
                            const f = features.find((ft: any) => ft.id === fid);
                            return (
                              <span key={fid} className="flex items-center gap-1 bg-muted px-2 py-1 rounded">
                                {f?.name}
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleRemoveEditFeature(fid)}
                                  aria-label="Remove Feature"
                                >
                                  <Trash className="h-4 w-4 text-destructive" />
                                </Button>
                              </span>
                            );
                          })}
                        </div>
                        <select
                          id="edit_unit_features"
                          className="w-full border rounded px-2 py-2"
                          value=""
                          onChange={e => {
                            const val = e.target.value;
                            if (val && !editFeatures.includes(val)) {
                              handleAddEditFeature(val);
                            }
                          }}
                        >
                          <option value="">Add Feature</option>
                          {features
                            .filter(f => !editFeatures.includes(f.id))
                            .map(f => (
                              <option key={f.id} value={f.id}>{f.name}</option>
                            ))}
                        </select>
                      </div>

                      {/* Images CRUD */}
                      <div>
                        <label className="block mb-1 font-medium" htmlFor="edit_unit_images">Unit Images</label>
                        <div className="flex flex-wrap gap-2 mb-2">
                          {editImages.map((img: any, idx: number) => (
                            <span key={img.id} className="flex items-center gap-1 bg-muted px-2 py-1 rounded">
                              <img src={img.public_url} alt="Unit" className="h-8 w-12 object-cover rounded" />
                              {img.is_primary && (
                                <span className="ml-2 text-xs text-accent font-bold">Primary</span>
                              )}
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleRemoveImage(img.id)}
                                aria-label="Remove Image"
                              >
                                <Trash className="h-4 w-4 text-destructive" />
                              </Button>
                            </span>
                          ))}
                        </div>
                        <input
                          id="edit_unit_images"
                          type="file"
                          accept="image/*"
                          multiple
                          style={{ display: "none" }}
                          onChange={handleEditImageChange}
                        />
                        <Button
                          className="mt-2"
                          type="button"
                          onClick={() => document.getElementById("edit_unit_images")?.click()}
                        >
                          Add Another Image
                        </Button>
                        {editImageFiles.length > 0 && (
                          <Button className="mt-2" type="button" onClick={handleAddImage}>
                            Upload Selected Image(s)
                          </Button>
                        )}
                      </div>

                      <div className="flex gap-2 justify-end sticky bottom-0 bg-card py-2">
                        <Button variant="outline" type="button" onClick={() => setShowEditUnit(false)}>
                          Cancel
                        </Button>
                        <Button type="submit">Save Changes</Button>
                      </div>
                    </form>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Responsive scrollable Preview Modal */}
        {showPreviewUnit && selectedUnit && (
          <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
            <div className="w-full max-w-2xl mx-auto">
              <Card className="rounded-lg shadow-lg">
                <CardHeader className="flex items-center justify-between sticky top-0 bg-card z-10">
                  <CardTitle>Preview Unit</CardTitle>
                  <Button variant="ghost" size="icon" onClick={() => setShowPreviewUnit(false)} aria-label="Close preview">
                    <X className="h-5 w-5" />
                  </Button>
                </CardHeader>

                <CardContent>
                  <div className="max-h-[75vh] overflow-y-auto p-4 space-y-4">
                    <div className="flex justify-center">
                      {getPrimaryImageForUnit(selectedUnit.id) ? (
                        <img src={getPrimaryImageForUnit(selectedUnit.id)} alt="Unit primary" className="w-full max-w-md h-48 object-cover rounded" />
                      ) : (
                        <ImageIcon className="h-16 w-16 text-muted-foreground" />
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                      <div><strong>Label:</strong> {selectedUnit.unit_label}</div>
                      <div><strong>Property:</strong> {properties.find((p) => p.id === selectedUnit.property_id)?.title || ""}</div>
                      <div><strong>Bedrooms:</strong> {selectedUnit.bedrooms}</div>
                      <div><strong>Bathrooms:</strong> {selectedUnit.bathrooms}</div>
                      <div><strong>Area (sqft):</strong> {selectedUnit.area_sqft}</div>
                      <div><strong>Furnished:</strong> {selectedUnit.furnished ? "Yes" : "No"}</div>
                      <div><strong>Rent:</strong> {selectedUnit.rent_amount ? `${selectedUnit.rent_amount.toLocaleString()} ${selectedUnit.rent_currency || "USD"}` : ""}</div>
                      <div><strong>Deposit:</strong> {selectedUnit.deposit_amount ? `${selectedUnit.deposit_amount.toLocaleString()}` : ""}</div>
                      <div><strong>Available From:</strong> {selectedUnit.available_from}</div>
                      <div><strong>Status:</strong> {selectedUnit.status}</div>
                      <div><strong>Featured:</strong> {selectedUnit.is_featured ? "Yes" : "No"}</div>
                      <div className="sm:col-span-2"><strong>Description:</strong> <div className="mt-1">{selectedUnit.unit_description || "None"}</div></div>
                      <div className="sm:col-span-2"><strong>Features:</strong> {selectedUnit.unit_features && selectedUnit.unit_features.length > 0 ? selectedUnit.unit_features.map((fid: string) => features.find((ft: any) => ft.id === fid)?.name || "").filter(Boolean).join(", ") : "None"}</div>
                    </div>

                    <div>
                      <strong>All Images:</strong>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {unitImages.filter((ui) => ui.unit_id === selectedUnit.id).sort((a: any,b:any)=>a.sort_order-b.sort_order).map((img:any) => (
                          <img key={img.id} src={img.public_url} alt="Unit" className="h-20 w-28 object-cover rounded" />
                        ))}
                        {unitImages.filter((ui) => ui.unit_id === selectedUnit.id).length === 0 && <div className="text-xs text-muted-foreground">No images</div>}
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <Button variant="outline" onClick={() => setShowPreviewUnit(false)}>Close</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default AdminUnits;