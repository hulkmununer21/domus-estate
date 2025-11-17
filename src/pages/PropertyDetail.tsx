import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/contexts/AuthContext";
import SEO from "@/components/SEO";
import logo from "@/assets/logo.png";

const PropertyDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    moveDate: "",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState("");

  // Prefill form if user is a lodger
  useEffect(() => {
    const fetchLodgerProfile = async () => {
      if (user?.id) {
        // Check if user is a lodger
        const { data: lodgerProfile } = await supabase
          .from("lodger_profiles")
          .select("first_name, last_name, email, phone_number")
          .eq("user_id", user.id)
          .single();

        if (lodgerProfile) {
          setForm(prev => ({
            ...prev,
            name: `${lodgerProfile.first_name} ${lodgerProfile.last_name}`,
            email: lodgerProfile.email || "",
            phone: lodgerProfile.phone_number || "",
          }));
        }
      }
    };
    fetchLodgerProfile();
  }, [user]);

  // Handle form field changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.id]: e.target.value });
  };

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError("");
    setSubmitSuccess(false);

    const { error } = await supabase
      .from("lodge_requests")
      .insert([
        {
          property_id: id,
          lodger_user_id: user?.id || null,
          name: form.name,
          email: form.email,
          phone: form.phone,
          move_in_date: form.moveDate,
          message: form.message,
          created_at: new Date().toISOString(),
        },
      ]);

    if (error) {
      setSubmitError("Failed to submit request. Please try again.");
    } else {
      setSubmitSuccess(true);
      setForm({
        name: "",
        email: "",
        phone: "",
        moveDate: "",
        message: "",
      });
    }
    setSubmitting(false);
  };

  return (
    <>
      <SEO
        title="Property Details - Domus Servitia"
        description="View property details and request to lodge."
        canonical={`https://domusservitia.co.uk/property/${id}`}
      />
      <div className="min-h-screen bg-muted/30">
        {/* Navigation Bar */}
        <header className="bg-card border-b border-border sticky top-0 z-50 shadow-sm">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between h-16">
              <img src={logo} alt="Domus Servitia" className="h-10 rounded-lg" />
              <nav className="flex items-center gap-6">
                {/* Example navigation links */}
                <Button variant="ghost" size="sm">Home</Button>
                <Button variant="ghost" size="sm">Properties</Button>
                <Button variant="ghost" size="sm">Contact</Button>
              </nav>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8 grid lg:grid-cols-3 gap-8">
          {/* Main property details section (placeholder) */}
          <div className="lg:col-span-2">
            {/* ...existing property details UI... */}
            <Card className="border-border mb-8">
              <CardContent className="p-6">
                <h2 className="font-serif text-2xl font-bold mb-2">Property Details</h2>
                {/* Property details content goes here */}
                <p className="text-muted-foreground">Property information and images...</p>
              </CardContent>
            </Card>
          </div>

          {/* Request to Lodge Form */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24 border-border shadow-elegant">
              <CardContent className="p-6">
                <h3 className="font-serif text-xl font-bold text-foreground mb-4">
                  Request to Lodge
                </h3>
                <form className="space-y-4" onSubmit={handleSubmit}>
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input id="name" value={form.name} onChange={handleChange} required placeholder="John Doe" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" value={form.email} onChange={handleChange} required placeholder="john@example.com" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input id="phone" type="tel" value={form.phone} onChange={handleChange} required placeholder="+44 7000 000000" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="moveDate">Preferred Move-in Date</Label>
                    <Input id="moveDate" type="date" value={form.moveDate} onChange={handleChange} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="message">Message</Label>
                    <Textarea id="message" value={form.message} onChange={handleChange} required placeholder="Tell us about yourself..." rows={4} />
                  </div>
                  {submitError && <div className="text-red-600 text-sm">{submitError}</div>}
                  {submitSuccess && <div className="text-green-600 text-sm">Request submitted successfully!</div>}
                  <Button className="w-full bg-gradient-gold text-primary font-semibold shadow-gold hover:shadow-lifted" disabled={submitting}>
                    {submitting ? "Submitting..." : "Submit Request"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
};

export default PropertyDetail;
// filepath: /home/hulkmununer/domus/src/pages/PropertyDetail.tsx