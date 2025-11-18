import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";
import { Mail, FileText, CheckCircle, Eye } from "lucide-react";

// Email sender using your Vercel API route and Resend
const sendEmail = async (to: string, subject: string, message: string) => {
  try {
    const res = await fetch("/api/send-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ to, subject, message }),
    });
    if (!res.ok) {
      throw new Error("Failed to send email");
    }
    return true;
  } catch (err) {
    toast.error("Email sending failed.");
    return false;
  }
};

const AdminRequests = () => {
  const [requests, setRequests] = useState<any[]>([]);
  const [units, setUnits] = useState<any>({});
  const [properties, setProperties] = useState<any>({});
  const [landlords, setLandlords] = useState<any>({});
  const [search, setSearch] = useState("");
  const [respondingId, setRespondingId] = useState<string | null>(null);
  const [responseMessage, setResponseMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [viewUnitId, setViewUnitId] = useState<string | null>(null);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    // 1. Fetch lodge requests
    const { data: lodgeRequests } = await supabase
      .from("lodge_requests")
      .select("*")
      .order("created_at", { ascending: false });

    setRequests(lodgeRequests || []);

    // 2. Fetch all property units referenced
    const unitIds = (lodgeRequests || []).map(r => r.property_id).filter(Boolean);
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

    // 3. Fetch all properties referenced
    const propertyIds = Object.values(unitsMap).map((u: any) => u.property_id).filter(Boolean);
    let propertiesMap: any = {};
    if (propertyIds.length > 0) {
      const { data: propertyRows } = await supabase
        .from("properties")
        .select("*")
        .in("id", propertyIds);
      propertyRows?.forEach(p => {
        propertiesMap[p.id] = p;
      });
    }
    setProperties(propertiesMap);

    // 4. Fetch all landlords referenced
    const landlordIds = Object.values(propertiesMap).map((p: any) => p.landlord_user_id).filter(Boolean);
    let landlordsMap: any = {};
    if (landlordIds.length > 0) {
      const { data: landlordRows } = await supabase
        .from("landlord_profiles")
        .select("*")
        .in("user_id", landlordIds);
      landlordRows?.forEach(l => {
        landlordsMap[l.user_id] = l;
      });
    }
    setLandlords(landlordsMap);
  };

  // Respond to request: send email to all, notification to authenticated lodgers
  const handleRespond = async (req: any) => {
    setSending(true);

    // Send email to requester (all cases)
    await sendEmail(
      req.email,
      "Response to Your Lodging Request",
      responseMessage
    );

    // If authenticated lodger, also send notification
    if (req.lodger_user_id) {
      await supabase.from("notifications").insert([
        {
          user_id: req.lodger_user_id,
          type: "lodge_response",
          title: "Lodging Request Response",
          body: responseMessage,
          channel: "web",
          sent_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
        },
      ]);
    }

    // Mark request as responded
    await supabase
      .from("lodge_requests")
      .update({ status: "responded" })
      .eq("id", req.id);

    toast.success("Response sent!");
    setRespondingId(null);
    setResponseMessage("");
    setSending(false);
    fetchAllData();
  };

  // Initiate invoice for authenticated users, fetch tax from settings
  const handleInitiateInvoice = async (req: any) => {
    // 1. Fetch tax rate from settings
    const { data: taxSetting } = await supabase
      .from("settings")
      .select("value")
      .eq("key", "tax_rate")
      .single();

    const taxPercent = taxSetting?.value?.percent || 0;

    // 2. Fetch invoice due days from settings
    const { data: dueDaysSetting } = await supabase
      .from("settings")
      .select("value")
      .eq("key", "invoice_due_days")
      .single();

    const dueDays = dueDaysSetting?.value?.days || 0;

    // 3. Get rent_amount from the property_units table
    const unit = units[req.property_id];
    const subtotal = unit?.rent_amount ? Number(unit.rent_amount) : 0;

    // 4. Calculate tax and total
    const tax = +(subtotal * (taxPercent / 100)).toFixed(2);
    const total = +(subtotal + tax).toFixed(2);
    const currency = "GBP";
    const notes = "Lodging invoice for your request";

    // 5. Calculate due_date
    const now = new Date();
    const due_date = new Date(now.getTime() + dueDays * 24 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 10); // Format as YYYY-MM-DD

    // Generate a random 9-digit number as a string
    const number = Math.floor(100000000 + Math.random() * 900000000).toString();

    // 6. Insert invoice
    await supabase.from("invoices").insert([
      {
        issued_to_user_id: req.lodger_user_id,
        unit_id: req.property_id,
        status: "issued",
        subtotal,
        tax,
        total,
        currency,
        notes,
        due_date,
        number,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ]);

    // 7. Notify the lodger
    await supabase.from("notifications").insert([
      {
        user_id: req.lodger_user_id,
        type: "invoice",
        title: "New Invoice Issued",
        body: `An invoice of £${total.toFixed(2)} (including £${tax.toFixed(2)} VAT) has been issued for your lodging request. Due date: ${due_date}`,
        channel: "web",
        sent_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
      },
    ]);

    toast.success("Invoice initiated!");
    fetchAllData();
  };

  const filteredRequests = requests.filter(
    req =>
      req.name?.toLowerCase().includes(search.toLowerCase()) ||
      req.email?.toLowerCase().includes(search.toLowerCase()) ||
      req.phone?.toLowerCase().includes(search.toLowerCase())
  );

  const selectedUnitRequest = requests.find(r => r.id === viewUnitId);
  const selectedUnit = selectedUnitRequest ? units[selectedUnitRequest.property_id] : null;
  const selectedProperty = selectedUnit ? properties[selectedUnit.property_id] : null;
  const selectedLandlord = selectedProperty ? landlords[selectedProperty.landlord_user_id] : null;

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container mx-auto px-4 py-8">
        <Card className="border-border">
          <CardHeader>
            <CardTitle>
              <FileText className="h-5 w-5 mr-2 inline" />
              Lodge Requests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4 flex items-center gap-2">
              <Input
                placeholder="Search requests by name, email, or phone..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="max-w-xs"
              />
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="py-2 px-2 text-left">Name</th>
                    <th className="py-2 px-2 text-left">Email</th>
                    <th className="py-2 px-2 text-left">Phone</th>
                    <th className="py-2 px-2 text-left">Move-in Date</th>
                    <th className="py-2 px-2 text-left">Message</th>
                    <th className="py-2 px-2 text-left">Unit</th>
                    <th className="py-2 px-2 text-left">Property</th>
                    <th className="py-2 px-2 text-left">Owner</th>
                    <th className="py-2 px-2 text-left">Status</th>
                    <th className="py-2 px-2 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRequests.map(req => {
                    const unit = units[req.property_id];
                    const property = unit ? properties[unit.property_id] : null;
                    const landlord = property ? landlords[property.landlord_user_id] : null;
                    return (
                      <tr key={req.id} className="border-b border-border hover:bg-muted/40">
                        <td className="py-2 px-2">{req.name}</td>
                        <td className="py-2 px-2">{req.email}</td>
                        <td className="py-2 px-2">{req.phone}</td>
                        <td className="py-2 px-2">{req.move_in_date}</td>
                        <td className="py-2 px-2">{req.message}</td>
                        <td className="py-2 px-2">{unit?.unit_label || "N/A"}</td>
                        <td className="py-2 px-2">{property?.title || "N/A"}</td>
                        <td className="py-2 px-2">
                          {landlord
                            ? `${landlord.first_name} ${landlord.last_name}`
                            : "N/A"}
                        </td>
                        <td className="py-2 px-2">{req.status}</td>
                        <td className="py-2 px-2 text-center">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setRespondingId(req.id)}
                            className="mr-2"
                          >
                            <Mail className="h-4 w-4 mr-1" />
                            Respond
                          </Button>
                          {req.lodger_user_id && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleInitiateInvoice(req)}
                              className="mr-2"
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Initiate Invoice
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setViewUnitId(req.id)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View Unit Details
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Respond Modal */}
            {respondingId && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
                <div className="bg-card rounded-lg shadow-lg w-full max-w-md relative">
                  <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                    <span className="font-semibold text-lg">Respond to Request</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setRespondingId(null)}
                      aria-label="Close"
                    >
                      ×
                    </Button>
                  </div>
                  <div className="px-6 py-4">
                    <form
                      className="space-y-4"
                      onSubmit={e => {
                        e.preventDefault();
                        const req = requests.find(r => r.id === respondingId);
                        if (req) handleRespond(req);
                      }}
                    >
                      <div>
                        <Textarea
                          id="responseMessage"
                          value={responseMessage}
                          onChange={e => setResponseMessage(e.target.value)}
                          required
                          rows={4}
                          placeholder="Type your response to the requester..."
                        />
                      </div>
                      <Button
                        type="submit"
                        className="bg-gradient-gold text-primary font-semibold w-full"
                        disabled={sending}
                      >
                        {sending ? "Sending..." : "Send Response"}
                      </Button>
                    </form>
                  </div>
                </div>
              </div>
            )}

            {/* View Unit Details Modal */}
            {viewUnitId && selectedUnitRequest && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
                <div className="bg-card rounded-lg shadow-lg w-full max-w-lg overflow-y-auto" style={{ maxHeight: "90vh" }}>
                  <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                    <span className="font-semibold text-lg">Unit Details</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setViewUnitId(null)}
                      aria-label="Close"
                    >
                      ×
                    </Button>
                  </div>
                  <div className="px-6 py-4 space-y-4">
                    <div>
                      <span className="font-semibold">Unit Label:</span>{" "}
                      {selectedUnit?.unit_label || "N/A"}
                    </div>
                    <div>
                      <span className="font-semibold">Bedrooms:</span>{" "}
                      {selectedUnit?.bedrooms ?? "N/A"}
                    </div>
                    <div>
                      <span className="font-semibold">Bathrooms:</span>{" "}
                      {selectedUnit?.bathrooms ?? "N/A"}
                    </div>
                    <div>
                      <span className="font-semibold">Area (sqft):</span>{" "}
                      {selectedUnit?.area_sqft ?? "N/A"}
                    </div>
                    <div>
                      <span className="font-semibold">Furnished:</span>{" "}
                      {selectedUnit?.furnished ? "Yes" : "No"}
                    </div>
                    <div>
                      <span className="font-semibold">Rent Amount:</span>{" "}
                      {selectedUnit?.rent_amount
                        ? `${selectedUnit?.rent_currency || "GBP"} ${selectedUnit?.rent_amount}`
                        : "N/A"}
                    </div>
                    <div>
                      <span className="font-semibold">Deposit Amount:</span>{" "}
                      {selectedUnit?.deposit_amount ?? "N/A"}
                    </div>
                    <div>
                      <span className="font-semibold">Available From:</span>{" "}
                      {selectedUnit?.available_from ?? "N/A"}
                    </div>
                    <div>
                      <span className="font-semibold">Unit Description:</span>
                      <div className="text-muted-foreground mt-1">
                        {selectedUnit?.unit_description || "N/A"}
                      </div>
                    </div>
                    <div>
                      <span className="font-semibold">Property Title:</span>{" "}
                      {selectedProperty?.title || "N/A"}
                    </div>
                    <div>
                      <span className="font-semibold">Property Address:</span>{" "}
                      {selectedProperty?.address || "N/A"}
                    </div>
                    <div>
                      <span className="font-semibold">Property City:</span>{" "}
                      {selectedProperty?.city || "N/A"}
                    </div>
                    <div>
                      <span className="font-semibold">Property Postal Code:</span>{" "}
                      {selectedProperty?.postal_code || "N/A"}
                    </div>
                    <div>
                      <span className="font-semibold">Owner Name:</span>{" "}
                      {selectedLandlord
                        ? `${selectedLandlord.first_name} ${selectedLandlord.last_name}`
                        : "N/A"}
                    </div>
                    <div>
                      <span className="font-semibold">Owner Company:</span>{" "}
                      {selectedLandlord?.company_name || "N/A"}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminRequests;
// filepath: /home/hulkmununer/domus/src/pages/AdminRequests.tsx