import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";

const LodgerLeases = () => {
  const { user } = useAuth();
  const [leases, setLeases] = useState<any[]>([]);
  const [units, setUnits] = useState<any>({});
  const [unitImages, setUnitImages] = useState<any>({});
  const [signedDocs, setSignedDocs] = useState<{ [leaseId: string]: { url: string; name: string } }>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeasesAndUnits();
    // eslint-disable-next-line
  }, [user?.id]);

  const fetchLeasesAndUnits = async () => {
    setLoading(true);
    // 1. Fetch all leases for this lodger
    const { data: leaseRows } = await supabase
      .from("leases")
      .select("*")
      .eq("lodger_user_id", user?.id)
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

    // 4. Fetch signed documents for leases
    let signedDocsMap: { [leaseId: string]: { url: string; name: string } } = {};
    const signedDocIds = (leaseRows || [])
      .filter(l => l.signed_document_id)
      .map(l => l.signed_document_id);

    if (signedDocIds.length > 0) {
      const { data: docRows } = await supabase
        .from("assets")
        .select("id, public_url, file_name")
        .in("id", signedDocIds);

      (leaseRows || []).forEach(lease => {
        if (lease.signed_document_id) {
          const doc = docRows?.find((d: any) => d.id === lease.signed_document_id);
          if (doc) {
            signedDocsMap[lease.id] = { url: doc.public_url, name: doc.file_name };
          }
        }
      });
    }
    setSignedDocs(signedDocsMap);

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container mx-auto px-4 py-8">
        <Card className="border-border">
          <CardHeader>
            <CardTitle>My Leases</CardTitle>
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
                  const leaseStatus =
                    !lease.signed_at && !lease.signed_document_id
                      ? "Pending Signature"
                      : lease.status;
                  const signedDoc = signedDocs[lease.id];
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
                          <div className="text-sm mb-1">
                            <span className="font-semibold">Lease Status:</span>{" "}
                            <span className="px-2 py-1 rounded bg-muted-foreground/10">{leaseStatus}</span>
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            Start: {lease.start_date || "N/A"} | End: {lease.end_date || "N/A"}
                          </div>
                          {lease.signed_at && (
                            <div className="text-xs mt-2">
                              <span className="font-semibold">Signed At:</span>{" "}
                              {new Date(lease.signed_at).toLocaleString()}
                            </div>
                          )}
                          {signedDoc && (
                            <div className="mt-2 flex items-center gap-2">
                              <span className="font-semibold">Signed Document:</span>
                              <Button
                                size="sm"
                                variant="outline"
                                asChild
                              >
                                <a href={signedDoc.url} download={signedDoc.name} target="_blank" rel="noopener noreferrer">
                                  Download
                                </a>
                              </Button>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LodgerLeases;
// filepath: /home/hulkmununer/domus/src/pages/LodgerLeases.tsx