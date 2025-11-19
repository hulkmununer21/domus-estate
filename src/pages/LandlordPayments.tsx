import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabaseClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Home, User } from "lucide-react";

const LandlordPayments = () => {
  const { user } = useAuth();
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPayments = async () => {
      setLoading(true);
      if (!user?.id) return;

      // 1. Fetch properties for landlord
      const { data: properties } = await supabase
        .from("properties")
        .select("id, title")
        .eq("landlord_user_id", user.id);

      const propertyIds = (properties || []).map(p => p.id);

      // 2. Fetch property units for these properties
      let units: any[] = [];
      if (propertyIds.length > 0) {
        const { data: unitsData } = await supabase
          .from("property_units")
          .select("id, property_id, unit_label, rent_amount")
          .in("property_id", propertyIds);
        units = unitsData || [];
      }

      // 3. Fetch leases for these units
      const unitIds = units.map(u => u.id);
      let leases: any[] = [];
      if (unitIds.length > 0) {
        const { data: leasesData } = await supabase
          .from("leases")
          .select("id, unit_id, lodger_user_id, rent_amount, start_date, end_date, status, updated_at")
          .in("unit_id", unitIds)
          .order("updated_at", { ascending: false });
        leases = leasesData || [];
      }

      // 4. Fetch lodger profiles
      const lodgerIds = Array.from(new Set(leases.map(l => l.lodger_user_id).filter(Boolean)));
      let lodgers: any[] = [];
      if (lodgerIds.length > 0) {
        const { data: lodgerData } = await supabase
          .from("lodger_profiles")
          .select("user_id, first_name, last_name")
          .in("user_id", lodgerIds);
        lodgers = lodgerData || [];
      }

      // 5. Fetch property_unit_images for units
      let unitImages: { [unitId: string]: string } = {};
      if (unitIds.length > 0) {
        const { data: images } = await supabase
          .from("property_unit_images")
          .select("unit_id, asset_id, is_primary")
          .in("unit_id", unitIds)
          .eq("is_primary", true);

        for (const img of images || []) {
          if (img.asset_id) {
            const { data: asset } = await supabase
              .from("assets")
              .select("public_url")
              .eq("id", img.asset_id)
              .single();
            if (asset?.public_url) {
              unitImages[img.unit_id] = asset.public_url;
            }
          }
        }
      }

      // 6. Merge data for display
      const paymentsList = leases.map(lease => {
        const unit = units.find(u => u.id === lease.unit_id);
        const property = properties.find(p => p.id === unit?.property_id);
        const lodger = lodgers.find(l => l.user_id === lease.lodger_user_id);
        return {
          leaseId: lease.id,
          propertyTitle: property?.title || unit?.unit_label || "Unknown",
          unitLabel: unit?.unit_label || "",
          rentAmount: lease.rent_amount ? `£${lease.rent_amount}` : "N/A",
          lodgerName: lodger ? `${lodger.first_name} ${lodger.last_name}` : "Unknown",
          startDate: lease.start_date ? new Date(lease.start_date).toLocaleDateString() : "",
          endDate: lease.end_date ? new Date(lease.end_date).toLocaleDateString() : "",
          status: lease.status,
          updatedAt: lease.updated_at ? new Date(lease.updated_at).toLocaleDateString() : "",
          image: unitImages[unit?.id] ||
            "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=200",
        };
      });

      setPayments(paymentsList);
      setLoading(false);
    };

    fetchPayments();
  }, [user]);

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="border-border mb-8">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Payments Received</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Loading payments...</div>
          ) : payments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No payments found.</div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {payments.map(payment => (
                <div
                  key={payment.leaseId}
                  className="bg-card border border-border rounded-lg shadow-sm hover:shadow-lg transition-all flex flex-col"
                >
                  <img
                    src={payment.image}
                    alt={payment.propertyTitle}
                    className="w-full h-40 object-cover rounded-t-lg"
                  />
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-semibold text-lg mb-1 flex items-center gap-2">
                        <Home className="h-5 w-5 text-accent" />
                        {payment.propertyTitle}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        Unit: {payment.unitLabel}
                      </p>
                      <p className="text-sm mb-2 flex items-center gap-2">
                        <User className="h-4 w-4 text-accent" />
                        {payment.lodgerName}
                      </p>
                      <p className="text-sm mb-2 flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-accent" />
                        {payment.startDate} - {payment.endDate}
                      </p>
                    </div>
                    <div className="flex items-center justify-between mt-4">
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          payment.status === "active"
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                      </span>
                      <span className="font-bold text-lg text-accent">
                        {payment.rentAmount}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-2 text-right">
                      Last updated: {payment.updatedAt}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      <Button variant="outline" onClick={() => window.history.back()}>
        Back to Dashboard
      </Button>
    </div>
  );
};

export default LandlordPayments;