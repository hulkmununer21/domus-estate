import { useParams, Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { MapPin, Bed, Bath, Square, Calendar, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

const PropertyDetail = () => {
  const { id } = useParams();

  // Mock property data
  const property = {
    id: id,
    title: "Modern City Centre Studio",
    location: "Manchester City Centre, M1 1AA",
    price: "£750",
    beds: 1,
    baths: 1,
    sqft: 450,
    available: "Immediately",
    description:
      "A stunning modern studio apartment in the heart of Manchester city centre. Featuring contemporary design, high-quality finishes, and excellent natural light. Perfect for young professionals seeking convenient city living with all amenities within walking distance.",
    features: [
      "Fully furnished",
      "High-speed internet included",
      "24/7 concierge service",
      "Secure entry system",
      "Bills included",
      "Pet-friendly",
      "Parking available",
      "Near public transport",
    ],
    images: [
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800",
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800",
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800",
    ],
  };

  return (
    <>
      <SEO
        title={`${property.title} - Domus Servitia Property Details`}
        description={`${property.description.substring(0, 155)}...`}
        keywords={`property ${id}, ${property.location}, ${property.beds} bedroom, lodging, property rental`}
        canonical={`https://domusservitia.co.uk/property/${id}`}
      />
      <div className="min-h-screen bg-background">
        <Navbar />

      <div className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Breadcrumb */}
          <div className="mb-6 text-sm text-muted-foreground">
            <Link to="/" className="hover:text-accent">
              Home
            </Link>
            {" / "}
            <Link to="/properties" className="hover:text-accent">
              Properties
            </Link>
            {" / "}
            <span className="text-foreground">{property.title}</span>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {/* Image Gallery */}
              <div className="mb-8">
                <div className="grid grid-cols-2 gap-4">
                  <img
                    src={property.images[0]}
                    alt={property.title}
                    className="col-span-2 w-full h-96 object-cover rounded-lg shadow-elegant"
                  />
                  {property.images.slice(1).map((image, index) => (
                    <img
                      key={index}
                      src={image}
                      alt={`${property.title} ${index + 2}`}
                      className="w-full h-48 object-cover rounded-lg shadow-elegant"
                    />
                  ))}
                </div>
              </div>

              {/* Property Info */}
              <div className="mb-8">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h1 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-2">
                      {property.title}
                    </h1>
                    <div className="flex items-center text-muted-foreground">
                      <MapPin className="h-5 w-5 mr-2" />
                      <span>{property.location}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-accent">
                      {property.price}
                    </div>
                    <div className="text-sm text-muted-foreground">per month</div>
                  </div>
                </div>

                <div className="flex gap-8 py-6 border-y border-border">
                  <div className="flex items-center gap-2">
                    <Bed className="h-5 w-5 text-muted-foreground" />
                    <span className="font-medium">{property.beds} Bedroom</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Bath className="h-5 w-5 text-muted-foreground" />
                    <span className="font-medium">{property.baths} Bathroom</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Square className="h-5 w-5 text-muted-foreground" />
                    <span className="font-medium">{property.sqft} sqft</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                    <span className="font-medium">{property.available}</span>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="mb-8">
                <h2 className="font-serif text-2xl font-bold text-foreground mb-4">
                  Description
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  {property.description}
                </p>
              </div>

              {/* Features */}
              <div>
                <h2 className="font-serif text-2xl font-bold text-foreground mb-4">
                  Property Features
                </h2>
                <div className="grid md:grid-cols-2 gap-3">
                  {property.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Check className="h-5 w-5 text-accent" />
                      <span className="text-muted-foreground">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar - Enquiry Form */}
            <div className="lg:col-span-1">
              <Card className="sticky top-24 border-border shadow-elegant">
                <CardContent className="p-6">
                  <h3 className="font-serif text-xl font-bold text-foreground mb-4">
                    Request to Lodge
                  </h3>
                  <form className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input id="name" placeholder="John Doe" />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="john@example.com"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="+44 7000 000000"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="moveDate">Preferred Move-in Date</Label>
                      <Input id="moveDate" type="date" />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message">Message</Label>
                      <Textarea
                        id="message"
                        placeholder="Tell us about yourself..."
                        rows={4}
                      />
                    </div>

                    <Button className="w-full bg-gradient-gold text-primary font-semibold shadow-gold hover:shadow-lifted">
                      Submit Request
                    </Button>
                  </form>

                  <div className="mt-6 pt-6 border-t border-border">
                    <p className="text-sm text-muted-foreground text-center mb-4">
                      Or contact us directly
                    </p>
                    <Button variant="outline" className="w-full">
                      Call Us: +44 (0) 7000 000 000
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

        <Footer />
      </div>
    </>
  );
};

export default PropertyDetail;
