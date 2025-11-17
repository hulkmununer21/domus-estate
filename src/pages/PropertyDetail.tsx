import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { MapPin, Bed, Bath, Square, Calendar, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabaseClient";

const PropertyDetail = () => {
  const { id } = useParams();
  const [unit, setUnit] = useState<any>(null);
  const [property, setProperty] = useState<any>(null);
  const [images, setImages] = useState<string[]>([]);
  const [features, setFeatures] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);

      // 1. Fetch the unit
      const { data: unitData, error: unitError } = await supabase
        .from("property_units")
        .select("*")
        .eq("id", id)
        .eq("status", "published")
        .single();

      if (unitError || !unitData) {
        setUnit(null);
        setProperty(null);
        setImages([]);
        setFeatures([]);
        setLoading(false);
        return;
      }
      setUnit(unitData);

      // 2. Fetch the property
      let propertyData = null;
      if (unitData.property_id) {
        const { data: propData } = await supabase
          .from("properties")
          .select("*")
          .eq("id", unitData.property_id)
          .single();
        propertyData = propData || null;
      }
      setProperty(propertyData);

      // 3. Fetch images for this unit
      const { data: unitImages } = await supabase
        .from("property_unit_images")
        .select("is_primary, asset_id")
        .eq("unit_id", id);

      let imageUrls: string[] = [];
      if (unitImages && unitImages.length > 0) {
        // Fetch assets for each image
        const assetIds = unitImages.map((img: any) => img.asset_id).filter(Boolean);
        if (assetIds.length > 0) {
          const { data: assetsData } = await supabase
            .from("assets")
            .select("id, public_url")
            .in("id", assetIds);
          // Merge images with asset URLs, sort primary first
          imageUrls = unitImages
            .map((img: any) => {
              const asset = assetsData?.find((a: any) => a.id === img.asset_id);
              return { url: asset?.public_url, is_primary: img.is_primary };
            })
            .filter((img: any) => !!img.url)
            .sort((a: any, b: any) => (b.is_primary ? 1 : 0) - (a.is_primary ? 1 : 0))
            .map((img: any) => img.url);
        }
      }
      setImages(imageUrls);

      // 4. Fetch features for this unit
      let featureNames: string[] = [];
      if (Array.isArray(unitData.unit_features) && unitData.unit_features.length > 0) {
        const { data: featuresData } = await supabase
          .from("features")
          .select("id, name")
          .in("id", unitData.unit_features);
        featureNames = featuresData ? featuresData.map((f: any) => f.name) : [];
      }
      setFeatures(featureNames);

      setLoading(false);
    };

    if (id) fetchAll();
  }, [id]);

  // Merge all data for placeholders
  const merged = unit && property
    ? {
        title: unit.unit_label,
        location: `${property.title || ""}${property.city ? ", " + property.city : ""}${property.postal_code ? ", " + property.postal_code : ""}`,
        price: unit.rent_currency === "GBP" || unit.rent_currency === "£"
          ? `£${unit.rent_amount?.toLocaleString()}`
          : `${unit.rent_amount?.toLocaleString()} ${unit.rent_currency}`,
        beds: unit.bedrooms,
        baths: unit.bathrooms,
        sqft: unit.area_sqft,
        available: unit.available_from ? unit.available_from : "Immediately",
        description: unit.unit_description,
        features,
        images,
        address: property.address || "",
      }
    : null;

  return (
    <>
      <SEO
        title={merged ? `${merged.title} - Domus Servitia Property Details` : "Property Details - Domus Servitia"}
        description={merged ? `${merged.description?.substring(0, 155)}...` : ""}
        keywords={merged ? `property ${id}, ${merged.location}, ${merged.beds} bedroom, lodging, property rental` : ""}
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
              <span className="text-foreground">{merged ? merged.title : "Property"}</span>
            </div>

            {loading ? (
              <div className="text-center py-12 text-muted-foreground">Loading property details...</div>
            ) : !merged ? (
              <div className="text-center py-12 text-muted-foreground">Property not found or not published.</div>
            ) : (
              <div className="grid lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2">
                  {/* Image Gallery */}
                  <div className="mb-8">
                    <div className="grid grid-cols-2 gap-4">
                      {merged.images && merged.images.length > 0 ? (
                        <>
                          <img
                            src={merged.images[0]}
                            alt={merged.title}
                            className="col-span-2 w-full h-96 object-cover rounded-lg shadow-elegant"
                          />
                          {merged.images.slice(1).map((image: string, index: number) => (
                            <img
                              key={index}
                              src={image}
                              alt={`${merged.title} ${index + 2}`}
                              className="w-full h-48 object-cover rounded-lg shadow-elegant"
                            />
                          ))}
                        </>
                      ) : (
                        <div className="col-span-2 w-full h-96 flex items-center justify-center bg-muted text-muted-foreground text-xs rounded-lg shadow-elegant">
                          No Images Available
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Property Info */}
                  <div className="mb-8">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h1 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-2">
                          {merged.title}
                        </h1>
                        <div className="flex items-center text-muted-foreground">
                          <MapPin className="h-5 w-5 mr-2" />
                          <span>{merged.location}</span>
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          Address: {merged.address}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-bold text-accent">
                          {merged.price}
                        </div>
                        <div className="text-sm text-muted-foreground">per month</div>
                      </div>
                    </div>

                    <div className="flex gap-8 py-6 border-y border-border">
                      <div className="flex items-center gap-2">
                        <Bed className="h-5 w-5 text-muted-foreground" />
                        <span className="font-medium">{merged.beds} Bedroom</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Bath className="h-5 w-5 text-muted-foreground" />
                        <span className="font-medium">{merged.baths} Bathroom</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Square className="h-5 w-5 text-muted-foreground" />
                        <span className="font-medium">{merged.sqft} sqft</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-muted-foreground" />
                        <span className="font-medium">{merged.available}</span>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="mb-8">
                    <h2 className="font-serif text-2xl font-bold text-foreground mb-4">
                      Description
                    </h2>
                    <p className="text-muted-foreground leading-relaxed">
                      {merged.description}
                    </p>
                  </div>

                  {/* Features */}
                  <div>
                    <h2 className="font-serif text-2xl font-bold text-foreground mb-4">
                      Property Features
                    </h2>
                    <div className="grid md:grid-cols-2 gap-3">
                      {merged.features && merged.features.length > 0 ? (
                        merged.features.map((feature: string, index: number) => (
                          <div key={index} className="flex items-center gap-2">
                            <Check className="h-5 w-5 text-accent" />
                            <span className="text-muted-foreground">{feature}</span>
                          </div>
                        ))
                      ) : (
                        <div className="text-muted-foreground">No features listed.</div>
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
            )}
          </div>
        </div>

        <Footer />
      </div>
    </>
  );
};

export default PropertyDetail;