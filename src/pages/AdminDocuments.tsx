import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";

const AdminDocuments = () => {
  const [leases, setLeases] = useState<any[]>([]);
  const [units, setUnits] = useState<any>({});
  const [unitImages, setUnitImages] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [signModal, setSignModal] = useState<any>(null);
  const [signedAt, setSignedAt] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchLeasesAndUnits();
    // eslint-disable-next-line
  }, []);

  const fetchLeasesAndUnits = async () => {
    setLoading(true);
    // 1. Fetch all leases
    const { data: leaseRows } = await supabase
      .from("leases")
      .select("*")
      .order("created_at", { ascending: false });
    setLeases(leaseRows || []);

    // 2. Fetch units for these leases
    const unitIds = (leaseRows || []).map(lease => lease.unit_id).filter(Boolean);
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

  // Handle document upload and lease update
  const handleSignLease = async (e: any) => {
    e.preventDefault();
    if (!signModal || !file || !signedAt) {
      toast.error("Please select a file and date/time.");
      return;
    }
    setUploading(true);

    // 1. Upload document to assets table and storage
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${file.name}`;
    const filePath = `leases/${signModal.id}/${fileName}`;

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("public")
      .upload(filePath, file);

    if (uploadError) {
      toast.error("Failed to upload document.");
      setUploading(false);
      return;
    }

    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from("public")
      .getPublicUrl(filePath);

    // 2. Insert into assets table
    const { data: assetInsert, error: assetError } = await supabase
      .from("assets")
      .insert([{
        owner_user_id: signModal.lodger_user_id,
        storage_provider: "supabase",
        bucket: "public",
        file_key: filePath,
        file_name: file.name,
        public_url: publicUrlData?.publicUrl,
        content_type: file.type,
        byte_size: file.size,
        created_at: new Date().toISOString(),
      }])
      .select()
      .single();

    if (assetError || !assetInsert) {
      toast.error("Failed to save document metadata.");
      setUploading(false);
      return;
    }

    // 3. Update lease with signed_at and signed_document_id
    const { error: leaseUpdateError } = await supabase
      .from("leases")
      .update({
        signed_at: signedAt,
        signed_document_id: assetInsert.id,
        updated_at: new Date().toISOString(),
      })
      .eq("id", signModal.id);

    if (leaseUpdateError) {
      toast.error("Failed to update lease.");
      setUploading(false);
      return;
    }

    toast.success("Lease signed and document uploaded!");
    setUploading(false);
    setSignModal(null);
    setFile(null);
    setSignedAt("");
    fetchLeasesAndUnits();
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container mx-auto px-4 py-8">
        <Card className="border-border">
          <CardHeader>
            <CardTitle>Lease Documents</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div>Loading leases...</div>
            ) : leases.length === 0 ? (
              <div>No leases found.</div>
            ) : (
              <div className="space-y-6">
                {leases.map(lease => {
                  const unit = units[lease.unit_id];
                  const unitLabel = unit?.unit_label || "N/A";
                  const unitImage = unitImages[lease.unit_id] ||
                    "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400";
                  const isPendingSignature = !lease.signed_at && !lease.signed_document_id;
                  return (
                    <Card key={lease.id} className="border border-border">
                      <CardContent className="flex gap-4 items-center">
                        <img
                          src={unitImage}
                          alt={unitLabel}
                          className="w-20 h-20 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          <div className="font-semibold text-lg mb-1">{unitLabel}</div>
                          <div className="text-sm text-muted-foreground mb-1">
                            {unit?.unit_description || "No description"}
                          </div>
                          <div className="flex gap-4 text-sm mb-1">
                            <span>{unit?.bedrooms ?? 1} Bed</span>
                            <span>{unit?.bathrooms ?? 1} Bath</span>
                            <span>{unit?.area_sqft ?? 450} sqft</span>
                          </div>
                          <div className="text-sm">
                            <span className="font-semibold">Lease Status:</span>{" "}
                            <span className="px-2 py-1 rounded bg-muted-foreground/10">
                              {isPendingSignature ? "Pending Signature" : lease.status}
                            </span>
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            Start: {lease.start_date || "N/A"} | End: {lease.end_date || "N/A"}
                          </div>
                        </div>
                        {isPendingSignature && (
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => setSignModal(lease)}
                          >
                            Upload Signed Document
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
        {/* Sign Lease Modal */}
        {signModal && (
          <Dialog open={!!signModal} onOpenChange={() => setSignModal(null)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Upload Signed Lease Document</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSignLease} className="space-y-4">
                <div>
                  <label className="block mb-1 font-semibold">Signed At (Date & Time)</label>
                  <Input
                    type="datetime-local"
                    required
                    value={signedAt}
                    onChange={e => setSignedAt(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block mb-1 font-semibold">Signed Document (PDF)</label>
                  <Input
                    type="file"
                    accept=".pdf"
                    required
                    onChange={e => setFile(e.target.files?.[0] || null)}
                  />
                </div>
                <Button type="submit" disabled={uploading}>
                  {uploading ? "Uploading..." : "Submit"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
};

export default AdminDocuments;
// filepath: /home/hulkmununer/domus/src/pages/AdminDocuments.tsx