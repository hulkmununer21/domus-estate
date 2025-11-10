import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { Wrench, Droplets, Leaf, Zap, Shield, Clock, Phone, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import serviceHero from "@/assets/service-hero.jpg";

const services = [
  {
    icon: Wrench,
    title: "Property Maintenance",
    description:
      "Comprehensive maintenance services to keep your property in pristine condition. From routine inspections to emergency repairs, our skilled team handles it all.",
    features: [
      "24/7 Emergency Repairs",
      "Scheduled Maintenance",
      "Quality Inspections",
      "Preventive Care",
    ],
  },
  {
    icon: Droplets,
    title: "Professional Cleaning",
    description:
      "Immaculate cleaning services ensuring every property meets the highest standards of cleanliness and hygiene.",
    features: [
      "Deep Cleaning",
      "Regular Housekeeping",
      "Move-in/Move-out Cleaning",
      "Eco-friendly Products",
    ],
  },
  {
    icon: Leaf,
    title: "Garden Maintenance",
    description:
      "Expert gardening services maintaining beautiful outdoor spaces throughout the year.",
    features: [
      "Lawn Care",
      "Hedge Trimming",
      "Seasonal Planting",
      "Garden Design",
    ],
  },
  {
    icon: Zap,
    title: "Electrical Services",
    description:
      "Licensed electricians providing safe and reliable electrical solutions for all property needs.",
    features: [
      "Safety Inspections",
      "Installation Services",
      "Fault Diagnosis",
      "Certification",
    ],
  },
  {
    icon: Shield,
    title: "Security Systems",
    description:
      "Advanced security solutions to protect your property and ensure peace of mind.",
    features: [
      "CCTV Installation",
      "Alarm Systems",
      "Access Control",
      "24/7 Monitoring",
    ],
  },
  {
    icon: Clock,
    title: "Property Inspections",
    description:
      "Regular property inspections ensuring everything runs smoothly and issues are identified early.",
    features: [
      "Scheduled Visits",
      "Detailed Reports",
      "Photographic Evidence",
      "Action Plans",
    ],
  },
];

const ServicesPage = () => {
  return (
    <>
      <SEO
        title="Professional Property Services - Domus Servitia | Maintenance & Care"
        description="Comprehensive property maintenance and management services. Professional cleaning, garden maintenance, electrical services, security systems, and 24/7 emergency support across the UK."
        keywords="property maintenance services, professional cleaning UK, garden maintenance, electrical services, property inspections, emergency repairs, security systems"
        canonical="https://domusservitia.co.uk/services"
      />
      <div className="min-h-screen bg-background">
        <Navbar />

      {/* Hero Section */}
      <section className="pt-32 pb-20 relative">
        <div className="absolute inset-0 z-0">
          <img
            src={serviceHero}
            alt="Professional Services"
            className="w-full h-full object-cover opacity-20"
          />
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-6">
              Professional Property Services
            </h1>
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              Comprehensive maintenance and management services tailored to meet
              your property needs
            </p>
            <Button
              asChild
              size="lg"
              className="bg-gradient-gold text-primary font-semibold shadow-gold hover:shadow-lifted"
            >
              <Link to="/contact">Request a Service</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-4">
              Our Services
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Professional solutions for all your property management needs
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, index) => (
              <Card
                key={index}
                className="border-border hover:shadow-elegant hover:border-accent/50 transition-all duration-300"
              >
                <CardContent className="p-8">
                  <div className="bg-gradient-gold rounded-full w-16 h-16 flex items-center justify-center mb-6">
                    <service.icon className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="font-semibold text-xl text-foreground mb-3">
                    {service.title}
                  </h3>
                  <p className="text-muted-foreground mb-6 leading-relaxed">
                    {service.description}
                  </p>
                  <ul className="space-y-2">
                    {service.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center text-sm">
                        <CheckCircle className="h-4 w-4 text-accent mr-2 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-4">
                Why Choose Domus Servitia?
              </h2>
              <p className="text-lg text-muted-foreground">
                Excellence in every service we provide
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="bg-accent/10 rounded-full w-12 h-12 flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="h-6 w-6 text-accent" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">
                      Experienced Professionals
                    </h3>
                    <p className="text-muted-foreground">
                      Our team consists of licensed, insured, and highly trained
                      professionals with years of experience.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="bg-accent/10 rounded-full w-12 h-12 flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="h-6 w-6 text-accent" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">
                      Quality Assured
                    </h3>
                    <p className="text-muted-foreground">
                      We maintain the highest standards in all our services with
                      regular quality checks and inspections.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="bg-accent/10 rounded-full w-12 h-12 flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="h-6 w-6 text-accent" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">
                      Transparent Pricing
                    </h3>
                    <p className="text-muted-foreground">
                      No hidden fees. Clear, upfront pricing for all our services
                      with detailed quotes.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="bg-accent/10 rounded-full w-12 h-12 flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="h-6 w-6 text-accent" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">
                      24/7 Emergency Support
                    </h3>
                    <p className="text-muted-foreground">
                      Round-the-clock availability for urgent property issues and
                      emergency repairs.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="bg-accent/10 rounded-full w-12 h-12 flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="h-6 w-6 text-accent" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">
                      Customer Satisfaction
                    </h3>
                    <p className="text-muted-foreground">
                      98% customer satisfaction rate with thousands of happy
                      clients across the UK.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="bg-accent/10 rounded-full w-12 h-12 flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="h-6 w-6 text-accent" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">
                      Eco-Friendly Practices
                    </h3>
                    <p className="text-muted-foreground">
                      Environmentally conscious solutions using sustainable
                      materials and methods.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-serif text-3xl md:text-4xl font-bold mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
            Contact us today to discuss your property service needs
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              asChild
              size="lg"
              className="bg-card text-foreground hover:bg-card/90 shadow-elegant"
            >
              <Link to="/contact">Get a Quote</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary"
            >
              <a href="tel:+447000000000">
                <Phone className="h-5 w-5 mr-2" />
                Call Us Now
              </a>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
    </>
  );
};

export default ServicesPage;
