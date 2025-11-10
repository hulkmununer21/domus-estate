import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { useState } from "react";

const SubmitComplaint = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    setTimeout(() => {
      toast({
        title: "Complaint Submitted Successfully",
        description: "We'll review your complaint and respond within 48 hours.",
        duration: 5000,
      });
      setIsSubmitting(false);
      (e.target as HTMLFormElement).reset();
    }, 1500);
  };

  return (
    <>
      <SEO
        title="Submit a Complaint - Domus Servitia Customer Service"
        description="Submit a formal complaint to Domus Servitia. We take all feedback seriously and aim to resolve issues within 48 hours. Your satisfaction is our priority."
        keywords="submit complaint, customer service, property complaint, maintenance issue, service feedback, Domus Servitia support"
        canonical="https://domusservitia.co.uk/submit-complaint"
      />
      <div className="min-h-screen bg-background">
        <Navbar />
        
        <main className="pt-28 pb-20">
          <div className="container mx-auto px-4 max-w-3xl">
            {/* Header */}
            <header className="text-center mb-12">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent/10 mb-6">
                <AlertCircle className="h-8 w-8 text-accent" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-text">
                Submit a Complaint
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                We value your feedback and take all complaints seriously. Please provide as much detail as possible so we can address your concerns effectively.
              </p>
            </header>

            {/* Info Box */}
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-6 mb-8">
              <div className="flex items-start gap-4">
                <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-lg mb-2">Our Commitment</h3>
                  <ul className="text-sm text-muted-foreground space-y-2">
                    <li>• We acknowledge all complaints within 24 hours</li>
                    <li>• Full investigation and response within 48 hours</li>
                    <li>• All complaints are treated confidentially</li>
                    <li>• We aim for complete resolution and satisfaction</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Complaint Form */}
            <form onSubmit={handleSubmit} className="space-y-6 bg-card border border-border rounded-lg p-8 shadow-sm">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input 
                    id="firstName" 
                    name="firstName" 
                    required 
                    placeholder="John"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input 
                    id="lastName" 
                    name="lastName" 
                    required 
                    placeholder="Smith"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input 
                  id="email" 
                  name="email" 
                  type="email" 
                  required 
                  placeholder="john.smith@example.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input 
                  id="phone" 
                  name="phone" 
                  type="tel" 
                  placeholder="+44 7700 900000"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="userType">I am a *</Label>
                <Select name="userType" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lodger">Lodger/Tenant</SelectItem>
                    <SelectItem value="landlord">Landlord/Property Owner</SelectItem>
                    <SelectItem value="contractor">Contractor/Supplier</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="propertyRef">Property Reference (if applicable)</Label>
                <Input 
                  id="propertyRef" 
                  name="propertyRef" 
                  placeholder="e.g., DS-MAN-001"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Complaint Category *</Label>
                <Select name="category" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select complaint type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="maintenance">Maintenance Issue</SelectItem>
                    <SelectItem value="service">Service Quality</SelectItem>
                    <SelectItem value="communication">Communication</SelectItem>
                    <SelectItem value="billing">Billing/Payment</SelectItem>
                    <SelectItem value="staff">Staff Conduct</SelectItem>
                    <SelectItem value="safety">Safety Concern</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject">Subject *</Label>
                <Input 
                  id="subject" 
                  name="subject" 
                  required 
                  placeholder="Brief description of the issue"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Detailed Description *</Label>
                <Textarea 
                  id="description" 
                  name="description" 
                  required 
                  rows={6}
                  placeholder="Please provide a detailed description of your complaint including dates, times, and any relevant circumstances..."
                  className="resize-none"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="resolution">Desired Resolution</Label>
                <Textarea 
                  id="resolution" 
                  name="resolution" 
                  rows={3}
                  placeholder="How would you like us to resolve this issue?"
                  className="resize-none"
                />
              </div>

              <div className="pt-4">
                <Button 
                  type="submit" 
                  className="w-full bg-gradient-gold text-primary font-bold shadow-gold hover:shadow-lifted transition-all duration-300"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Submitting..." : "Submit Complaint"}
                </Button>
              </div>

              <p className="text-sm text-muted-foreground text-center">
                By submitting this form, you agree to our{" "}
                <a href="/privacy" className="text-accent hover:underline">Privacy Policy</a> and{" "}
                <a href="/terms" className="text-accent hover:underline">Terms of Service</a>.
              </p>
            </form>

            {/* Alternative Contact */}
            <div className="mt-12 text-center">
              <p className="text-muted-foreground mb-4">
                Prefer to speak with someone directly?
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a 
                  href="tel:+441234567890" 
                  className="text-accent font-semibold hover:underline"
                >
                  Call: +44 (0) 123 456 7890
                </a>
                <span className="hidden sm:inline text-muted-foreground">|</span>
                <a 
                  href="mailto:complaints@domusservitia.co.uk" 
                  className="text-accent font-semibold hover:underline"
                >
                  Email: complaints@domusservitia.co.uk
                </a>
              </div>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default SubmitComplaint;
