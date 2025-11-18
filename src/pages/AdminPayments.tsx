import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";
import { Eye, Trash2, FileText } from "lucide-react";

const AdminPayments = () => {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [lodgers, setLodgers] = useState<any>({});
  const [units, setUnits] = useState<any>({});
  const [viewInvoiceId, setViewInvoiceId] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    // 1. Fetch invoices
    const { data: invoiceRows } = await supabase
      .from("invoices")
      .select("*")
      .order("created_at", { ascending: false });
    setInvoices(invoiceRows || []);

    // 2. Fetch lodger profiles
    const lodgerIds = (invoiceRows || []).map(inv => inv.issued_to_user_id).filter(Boolean);
    let lodgerMap: any = {};
    if (lodgerIds.length > 0) {
      const { data: lodgerRows } = await supabase
        .from("lodger_profiles")
        .select("*")
        .in("user_id", lodgerIds);
      lodgerRows?.forEach(l => {
        lodgerMap[l.user_id] = l;
      });
    }
    setLodgers(lodgerMap);

    // 3. Fetch property units
    const unitIds = (invoiceRows || []).map(inv => inv.unit_id).filter(Boolean);
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
  };

  // Delete invoice
  const handleDeleteInvoice = async (id: string) => {
    await supabase.from("invoices").delete().eq("id", id);
    toast.success("Invoice deleted!");
    fetchInvoices();
  };

  const filteredInvoices = invoices.filter(
    inv =>
      inv.number?.includes(search) ||
      lodgers[inv.issued_to_user_id]?.first_name?.toLowerCase().includes(search.toLowerCase()) ||
      lodgers[inv.issued_to_user_id]?.last_name?.toLowerCase().includes(search.toLowerCase())
  );

  const selectedInvoice = invoices.find(inv => inv.id === viewInvoiceId);
  const selectedLodger = selectedInvoice ? lodgers[selectedInvoice.issued_to_user_id] : null;
  const selectedUnit = selectedInvoice ? units[selectedInvoice.unit_id] : null;

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container mx-auto px-4 py-8">
        <Card className="border-border">
          <CardHeader>
            <CardTitle>
              <FileText className="h-5 w-5 mr-2 inline" />
              Admin Payments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="invoices">
              <TabsList>
                <TabsTrigger value="invoices">Invoices</TabsTrigger>
                <TabsTrigger value="payments" disabled>Payments</TabsTrigger>
              </TabsList>
              <TabsContent value="invoices">
                <div className="mb-4 flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Search by invoice number or lodger name..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="max-w-xs border rounded px-2 py-1"
                  />
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="py-2 px-2 text-left">Number</th>
                        <th className="py-2 px-2 text-left">Lodger</th>
                        <th className="py-2 px-2 text-left">Unit</th>
                        <th className="py-2 px-2 text-left">Subtotal</th>
                        <th className="py-2 px-2 text-left">Tax</th>
                        <th className="py-2 px-2 text-left">Total</th>
                        <th className="py-2 px-2 text-left">Currency</th>
                        <th className="py-2 px-2 text-left">Due Date</th>
                        <th className="py-2 px-2 text-left">Status</th>
                        <th className="py-2 px-2 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredInvoices.map(inv => {
                        const lodger = lodgers[inv.issued_to_user_id];
                        const unit = units[inv.unit_id];
                        return (
                          <tr key={inv.id} className="border-b border-border hover:bg-muted/40">
                            <td className="py-2 px-2">{inv.number}</td>
                            <td className="py-2 px-2">
                              {lodger
                                ? `${lodger.first_name} ${lodger.last_name}`
                                : "N/A"}
                            </td>
                            <td className="py-2 px-2">{unit?.unit_label || "N/A"}</td>
                            <td className="py-2 px-2">£{inv.subtotal}</td>
                            <td className="py-2 px-2">£{inv.tax}</td>
                            <td className="py-2 px-2">£{inv.total}</td>
                            <td className="py-2 px-2">{inv.currency}</td>
                            <td className="py-2 px-2">{inv.due_date}</td>
                            <td className="py-2 px-2">{inv.status}</td>
                            <td className="py-2 px-2 text-center">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setViewInvoiceId(inv.id)}
                                className="mr-2"
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                View
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleDeleteInvoice(inv.id)}
                              >
                                <Trash2 className="h-4 w-4 mr-1" />
                                Delete
                              </Button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                {/* View Invoice Modal */}
                {viewInvoiceId && selectedInvoice && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
                    <div className="bg-card rounded-lg shadow-lg w-full max-w-lg overflow-y-auto" style={{ maxHeight: "90vh" }}>
                      <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                        <span className="font-semibold text-lg">Invoice Details</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setViewInvoiceId(null)}
                          aria-label="Close"
                        >
                          ×
                        </Button>
                      </div>
                      <div className="px-6 py-4 space-y-3">
                        <div>
                          <span className="font-semibold">Invoice Number:</span> {selectedInvoice.number}
                        </div>
                        <div>
                          <span className="font-semibold">Lodger:</span>{" "}
                          {selectedLodger
                            ? `${selectedLodger.first_name} ${selectedLodger.last_name} (${selectedLodger.email})`
                            : "N/A"}
                        </div>
                        <div>
                          <span className="font-semibold">Unit:</span>{" "}
                          {selectedUnit?.unit_label || "N/A"}
                        </div>
                        <div>
                          <span className="font-semibold">Subtotal:</span> £{selectedInvoice.subtotal}
                        </div>
                        <div>
                          <span className="font-semibold">Tax:</span> £{selectedInvoice.tax}
                        </div>
                        <div>
                          <span className="font-semibold">Total:</span> £{selectedInvoice.total}
                        </div>
                        <div>
                          <span className="font-semibold">Currency:</span> {selectedInvoice.currency}
                        </div>
                        <div>
                          <span className="font-semibold">Due Date:</span> {selectedInvoice.due_date}
                        </div>
                        <div>
                          <span className="font-semibold">Status:</span> {selectedInvoice.status}
                        </div>
                        <div>
                          <span className="font-semibold">Notes:</span> {selectedInvoice.notes || "N/A"}
                        </div>
                        <div>
                          <span className="font-semibold">Created At:</span> {selectedInvoice.created_at}
                        </div>
                        <div>
                          <span className="font-semibold">Updated At:</span> {selectedInvoice.updated_at}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </TabsContent>
              <TabsContent value="payments">
                {/* Payments tab will be implemented later */}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminPayments;
// filepath: /home/hulkmununer/domus/src/pages/AdminPayments.tsx