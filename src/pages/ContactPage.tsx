import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Contact from "@/components/Contact";
import SEO from "@/components/SEO";
import { MapPin, Phone, Mail, Clock } from "lucide-react";

const ContactPage = () => {
  return (
    <>
      <SEO
        title="Contact Domus Servitia - Property Services UK"
        description="Get in touch with Domus Servitia for property maintenance and lodging services. Available 24/7 for emergencies. Manchester, London, Birmingham offices. Call, email, or visit us."
        keywords="contact property services, Domus Servitia contact, property maintenance enquiry, UK property services contact, emergency property services"
        canonical="https://domusservitia.co.uk/contact"
      />
      <div className="min-h-screen bg-background">
        <Navbar />
        
        <main className="pt-28 pb-20">
          <div className="container mx-auto px-4">
            {/* Header */}
            <header className="text-center mb-16 max-w-3xl mx-auto">
              <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-text">
                Get in Touch
              </h1>
              <p className="text-lg text-muted-foreground">
                Have a question or need assistance? Our team is here to help. Contact us using the form below or reach out directly.
              </p>
            </header>

            {/* Contact Info Cards */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
              <div className="bg-card border border-border rounded-lg p-6 text-center shadow-sm hover:shadow-md transition-shadow">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4">
                  <Phone className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Phone</h3>
                <p className="text-sm text-muted-foreground mb-2">Mon-Fri: 8am-6pm</p>
                <a href="tel:+441234567890" className="text-accent font-semibold hover:underline">
                  +44 (0) 123 456 7890
                </a>
              </div>

              <div className="bg-card border border-border rounded-lg p-6 text-center shadow-sm hover:shadow-md transition-shadow">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-accent/10 mb-4">
                  <Mail className="h-6 w-6 text-accent" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Email</h3>
                <p className="text-sm text-muted-foreground mb-2">We respond within 24hrs</p>
                <a href="mailto:info@domusservitia.co.uk" className="text-accent font-semibold hover:underline">
                  info@domusservitia.co.uk
                </a>
              </div>

              <div className="bg-card border border-border rounded-lg p-6 text-center shadow-sm hover:shadow-md transition-shadow">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4">
                  <Clock className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Emergency</h3>
                <p className="text-sm text-muted-foreground mb-2">Available 24/7</p>
                <a href="tel:+447700900000" className="text-accent font-semibold hover:underline">
                  +44 7700 900000
                </a>
              </div>

              <div className="bg-card border border-border rounded-lg p-6 text-center shadow-sm hover:shadow-md transition-shadow">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-accent/10 mb-4">
                  <MapPin className="h-6 w-6 text-accent" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Main Office</h3>
                <p className="text-sm text-muted-foreground">
                  123 Property Lane<br />Manchester M1 1AA
                </p>
              </div>
            </div>

            {/* Contact Form */}
            <div className="max-w-4xl mx-auto">
              <Contact />
            </div>

            {/* Office Locations */}
            <div className="mt-20 max-w-5xl mx-auto">
              <h2 className="text-3xl font-bold text-center mb-12">Our Locations</h2>
              <div className="grid md:grid-cols-3 gap-8">
                <div className="bg-gradient-to-br from-primary/5 to-accent/5 border border-border rounded-lg p-6">
                  <h3 className="font-bold text-xl mb-3 text-primary">Manchester Office</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    123 Property Lane<br />
                    Manchester M1 1AA<br />
                    United Kingdom
                  </p>
                  <p className="text-sm">
                    <span className="font-semibold">Phone:</span>{" "}
                    <a href="tel:+441234567890" className="text-accent hover:underline">
                      +44 (0) 123 456 7890
                    </a>
                  </p>
                </div>

                <div className="bg-gradient-to-br from-primary/5 to-accent/5 border border-border rounded-lg p-6">
                  <h3 className="font-bold text-xl mb-3 text-primary">London Office</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    456 Estate Road<br />
                    London EC1A 1BB<br />
                    United Kingdom
                  </p>
                  <p className="text-sm">
                    <span className="font-semibold">Phone:</span>{" "}
                    <a href="tel:+442071234567" className="text-accent hover:underline">
                      +44 (0) 207 123 4567
                    </a>
                  </p>
                </div>

                <div className="bg-gradient-to-br from-primary/5 to-accent/5 border border-border rounded-lg p-6">
                  <h3 className="font-bold text-xl mb-3 text-primary">Birmingham Office</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    789 Maintenance Ave<br />
                    Birmingham B1 1CC<br />
                    United Kingdom
                  </p>
                  <p className="text-sm">
                    <span className="font-semibold">Phone:</span>{" "}
                    <a href="tel:+441214567890" className="text-accent hover:underline">
                      +44 (0) 121 456 7890
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default ContactPage;
