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
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

const UnitDetail = () => {
  const { id } = useParams();
  const [unit, setUnit] = useState<any>(null);
  const [property, setProperty] = useState<any>(null);
  const [features, setFeatures] = useState<string[]>([]);
  const [images, setImages] = useState<string[]>([]);

  useEffect(() => {
    fetchUnit();
  }, [id]);

  const fetchUnit = async () => {
    // Fetch unit details
    const { data: unitData } = await supabase
      .from("property_units")
      .select("*")
      .eq("id", id)
      .single();

    if (!unitData) return;

    setUnit(unitData);

    // Fetch property info
    const { data: propertyData } = await supabase
      .from("properties")
      .select("id, title, address, city, postal_code")
      .eq("id", unitData.property_id)
      .single();

    setProperty(propertyData);

    // Fetch features
    const { data: featureLinks } = await supabase
      .from("property_unit_features")
      .select("feature_id, features(name)")
      .eq("unit_id", id);

    setFeatures(featureLinks?.map((f: any) => f.features?.name) || []);

    // Fetch images
    const { data: imageLinks } = await supabase
      .from("property_unit_images")
      .select("is_primary, assets(public_url)")
      .eq("unit_id", id);

    const sortedImages = imageLinks
      ?.sort((a: any, b: any) => (b.is_primary ? 1 : -1))
      .map((img: any) => img.assets?.public_url)
      .filter((url: string) => !!url);

    setImages(sortedImages || []);
  };

  if (!unit || !property) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="text-muted-foreground">Loading unit details...</span>
      </div>
    );
  }

  return (
    <>
      <SEO
        title={`${unit.unit_label} - Domus Servitia Unit Details`}
        description={unit.unit_description?.substring(0, 155) || ""}
        keywords={`unit ${id}, ${property.title}, ${unit.bedrooms} bedroom, lodging, property rental`}
        canonical={`https://domusservitia.co.uk/units/${id}`}
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
              <Link to={`/property/${property.id}`} className="hover:text-accent">
                {property.title}
              </Link>
              {" / "}
              <span className="text-foreground">{unit.unit_label}</span>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2">
                {/* Image Gallery */}
                <div className="mb-8">
                  <div className="grid grid-cols-2 gap-4">
                    {images.length > 0 ? (
                      <>
                        <img
                          src={images[0]}
                          alt={unit.unit_label}
                          className="col-span-2 w-full h-96 object-cover rounded-lg shadow-elegant"
                        />
                        {images.slice(1).map((image, index) => (
                          <img
                            key={index}
                            src={image}
                            alt={`${unit.unit_label} ${index + 2}`}
                            className="w-full h-48 object-cover rounded-lg shadow-elegant"
                          />
                        ))}
                      </>
                    ) : (
                      <div className="col-span-2 w-full h-96 flex items-center justify-center bg-muted rounded-lg">
                        <span className="text-muted-foreground">No images available</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Unit Info */}
                <div className="mb-8">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h1 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-2">
                        {unit.unit_label}
                      </h1>
                      <div className="flex items-center text-muted-foreground">
                        <MapPin className="h-5 w-5 mr-2" />
                        <span>
                          {property.address}, {property.city} {property.postal_code}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-accent">
                        {unit.rent_amount_cents
                          ? `£${(unit.rent_amount_cents / 100).toLocaleString()}`
                          : "N/A"}
                      </div>
                      <div className="text-sm text-muted-foreground">per month</div>
                    </div>
                  </div>

                  <div className="flex gap-8 py-6 border-y border-border">
                    <div className="flex items-center gap-2">
                      <Bed className="h-5 w-5 text-muted-foreground" />
                      <span className="font-medium">{unit.bedrooms} Bedroom</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Bath className="h-5 w-5 text-muted-foreground" />
                      <span className="font-medium">{unit.bathrooms} Bathroom</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Square className="h-5 w-5 text-muted-foreground" />
                      <span className="font-medium">{unit.area_sqft} sqft</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-muted-foreground" />
                      <span className="font-medium">
                        {unit.available_from
                          ? new Date(unit.available_from).toLocaleDateString()
                          : "N/A"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="mb-8">
                  <h2 className="font-serif text-2xl font-bold text-foreground mb-4">
                    Description
                  </h2>
                  <p className="text-muted-foreground leading-relaxed">
                    {unit.unit_description || "No description provided."}
                  </p>
                </div>

                {/* Features */}
                <div>
                  <h2 className="font-serif text-2xl font-bold text-foreground mb-4">
                    Unit Features
                  </h2>
                  <div className="grid md:grid-cols-2 gap-3">
                    {features.length > 0 ? (
                      features.map((feature, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <Check className="h-5 w-5 text-accent" />
                          <span className="text-muted-foreground">{feature}</span>
                        </div>
                      ))
                    ) : (
                      <span className="text-muted-foreground">No features listed.</span>
                    )}
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

export default UnitDetail;