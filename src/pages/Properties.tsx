import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { MapPin, Bed, Bath, Square, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/lib/supabaseClient";

type Unit = {
  id: string;
  unit_label: string;
  bedrooms: number;
  bathrooms: number;
  area_sqft: number;
  rent_amount: number;
  rent_currency: string;
  status: string;
  available_from: string;
  unit_description: string;
  property_id: string;
  property_title: string;
  property_city: string;
  property_address: string;
  image: string;
};

const Properties = () => {
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [priceFilter, setPriceFilter] = useState("");
  const [availabilityFilter, setAvailabilityFilter] = useState("");

  useEffect(() => {
    const fetchUnits = async () => {
      setLoading(true);

      // Fetch all published units
      const { data: unitsData, error: unitsError } = await supabase
        .from("property_units")
        .select(
          `
            id,
            unit_label,
            bedrooms,
            bathrooms,
            area_sqft,
            rent_amount,
            rent_currency,
            status,
            available_from,
            unit_description,
            property_id,
            property:properties (
              title,
              city,
              address
            ),
            images:property_unit_images (
              is_primary,
              asset:assets (
                public_url
              )
            )
          `
        )
        .eq("status", "published");

      if (unitsError || !unitsData) {
        setUnits([]);
        setLoading(false);
        return;
      }

      // Map units to include property info and primary image
      const mappedUnits: Unit[] = unitsData.map((unit: any) => {
        let image = "";
        if (unit.images && Array.isArray(unit.images)) {
          const primaryImg = unit.images.find((img: any) => img.is_primary && img.asset?.public_url);
          if (primaryImg) image = primaryImg.asset.public_url;
        }
        return {
          id: unit.id,
          unit_label: unit.unit_label,
          bedrooms: unit.bedrooms,
          bathrooms: unit.bathrooms,
          area_sqft: unit.area_sqft,
          rent_amount: unit.rent_amount,
          rent_currency: unit.rent_currency || "USD",
          status: unit.status,
          available_from: unit.available_from,
          unit_description: unit.unit_description,
          property_id: unit.property_id,
          property_title: unit.property?.title || "",
          property_city: unit.property?.city || "",
          property_address: unit.property?.address || "",
          image,
        };
      });

      setUnits(mappedUnits);
      setLoading(false);
    };

    fetchUnits();
  }, []);

  // Client-side filtering
  const filteredUnits = units.filter((unit) => {
    // Search by location or label
    const searchMatch =
      unit.unit_label?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      unit.property_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      unit.property_city?.toLowerCase().includes(searchTerm.toLowerCase());

    // Type filter (bedrooms)
    const typeMatch =
      !typeFilter ||
      (typeFilter === "Studio" && unit.bedrooms === 0) ||
      (typeFilter === "1 Bedroom" && unit.bedrooms === 1) ||
      (typeFilter === "2 Bedroom" && unit.bedrooms === 2) ||
      (typeFilter === "3+ Bedroom" && unit.bedrooms >= 3);

    // Price filter
    const price = Number(unit.rent_amount);
    const priceMatch =
      !priceFilter ||
      (priceFilter === "£500 - £800" && price >= 500 && price <= 800) ||
      (priceFilter === "£800 - £1200" && price > 800 && price <= 1200) ||
      (priceFilter === "£1200 - £1500" && price > 1200 && price <= 1500) ||
      (priceFilter === "£1500+" && price > 1500);

    // Availability filter
    const now = new Date();
    const availableDate = unit.available_from ? new Date(unit.available_from) : now;
    const availableMatch =
      !availabilityFilter ||
      (availabilityFilter === "Available Now" && availableDate <= now) ||
      (availabilityFilter === "Coming Soon" && availableDate > now);

    return searchMatch && typeMatch && priceMatch && availableMatch;
  });

  return (
    <>
      <SEO
        title="Available Properties - Domus Servitia | Quality UK Accommodation"
        description="Browse our selection of quality properties available for lodging across the UK. Studios, 1-3 bedroom apartments in Manchester, London, Birmingham, Edinburgh. Professional management, all inclusive options."
        keywords="properties for rent UK, lodging Manchester, apartments London, quality accommodation, property rentals, furnished apartments, city centre properties"
        canonical="https://domusservitia.co.uk/properties"
      />
      <div className="min-h-screen bg-background">
        <Navbar />

        {/* Header Section */}
        <section className="pt-32 pb-16 bg-gradient-primary text-primary-foreground">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="font-serif text-4xl md:text-5xl font-bold mb-6">
                Available Properties
              </h1>
              <p className="text-xl text-primary-foreground/90 mb-8">
                Browse our selection of quality properties available for lodging
              </p>

              {/* Search Bar */}
              <div className="bg-card/95 backdrop-blur-sm p-4 rounded-xl shadow-lifted">
                <div className="flex gap-3">
                  <Input
                    type="text"
                    placeholder="Search by location or label..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-1 h-12"
                  />
                  <Button className="h-12 px-8 bg-gradient-gold text-primary font-semibold">
                    <Search className="h-5 w-5 mr-2" />
                    Search
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Filters Section */}
        <section className="py-8 border-b border-border">
          <div className="container mx-auto px-4">
            <div className="flex flex-wrap gap-4 justify-center">
              <select
                className="h-10 px-4 rounded-md border border-border bg-background"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                <option value="">Property Type</option>
                <option value="Studio">Studio</option>
                <option value="1 Bedroom">1 Bedroom</option>
                <option value="2 Bedroom">2 Bedroom</option>
                <option value="3+ Bedroom">3+ Bedroom</option>
              </select>
              <select
                className="h-10 px-4 rounded-md border border-border bg-background"
                value={priceFilter}
                onChange={(e) => setPriceFilter(e.target.value)}
              >
                <option value="">Price Range</option>
                <option value="£500 - £800">£500 - £800</option>
                <option value="£800 - £1200">£800 - £1200</option>
                <option value="£1200 - £1500">£1200 - £1500</option>
                <option value="£1500+">£1500+</option>
              </select>
              <select
                className="h-10 px-4 rounded-md border border-border bg-background"
                value={availabilityFilter}
                onChange={(e) => setAvailabilityFilter(e.target.value)}
              >
                <option value="">Availability</option>
                <option value="Available Now">Available Now</option>
                <option value="Coming Soon">Coming Soon</option>
              </select>
              <Button
                variant="outline"
                className="h-10"
                onClick={() => {
                  setTypeFilter("");
                  setPriceFilter("");
                  setAvailabilityFilter("");
                  setSearchTerm("");
                }}
              >
                Reset Filters
              </Button>
            </div>
          </div>
        </section>

        {/* Properties Grid */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {loading ? (
                <div className="col-span-full text-center py-12 text-muted-foreground">
                  Loading properties...
                </div>
              ) : filteredUnits.length > 0 ? (
                filteredUnits.map((unit) => (
                  <Card
                    key={unit.id}
                    className="group overflow-hidden border-border hover:shadow-lifted transition-all duration-300"
                  >
                    <div className="relative overflow-hidden h-64">
                      {unit.image ? (
                        <img
                          src={unit.image}
                          alt={unit.unit_label}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-muted text-muted-foreground text-xs">
                          No Image
                        </div>
                      )}
                    </div>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="font-semibold text-lg text-foreground line-clamp-1">
                          {unit.unit_label}
                        </h3>
                        <span className="text-accent font-bold text-xl whitespace-nowrap ml-2">
                          {unit.rent_currency === "GBP" || unit.rent_currency === "£"
                            ? `£${unit.rent_amount?.toLocaleString()}`
                            : `${unit.rent_amount?.toLocaleString()} ${unit.rent_currency}`}
                          <span className="text-sm font-normal text-muted-foreground">
                            /mo
                          </span>
                        </span>
                      </div>
                      <div className="flex items-center text-muted-foreground text-sm mb-4">
                        <MapPin className="h-4 w-4 mr-1" />
                        <span className="line-clamp-1">
                          {unit.property_title}
                          {unit.property_city ? `, ${unit.property_city}` : ""}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                        <div className="flex items-center">
                          <Bed className="h-4 w-4 mr-1" />
                          <span>{unit.bedrooms}</span>
                        </div>
                        <div className="flex items-center">
                          <Bath className="h-4 w-4 mr-1" />
                          <span>{unit.bathrooms}</span>
                        </div>
                        <div className="flex items-center">
                          <Square className="h-4 w-4 mr-1" />
                          <span>{unit.area_sqft} sqft</span>
                        </div>
                      </div>
                      <div className="mb-4 text-muted-foreground text-sm">
                        {unit.unit_description}
                      </div>
                      <div className="mb-2 text-xs text-muted-foreground">
                        Address: {unit.property_address}
                      </div>
                      <Button
                        asChild
                        variant="outline"
                        className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300"
                        disabled={unit.status !== "published"}
                      >
                        <Link to={`/property/${unit.id}`}>
                          {unit.status === "published" ? "View Details" : "View Anyway"}
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="col-span-full text-center py-12 text-muted-foreground">
                  No published properties found.
                </div>
              )}
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
};

export default Properties;