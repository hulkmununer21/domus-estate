import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { MapPin, Bed, Bath, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/lib/supabaseClient";

type FeaturedUnit = {
  id: string;
  unit_label: string;
  bedrooms: number;
  bathrooms: number;
  area_sqft: number;
  rent_amount: number;
  rent_currency: string;
  property_title: string;
  property_city: string;
  property_address: string;
  primary_image_url: string;
};

const FeaturedProperties = () => {
  const [units, setUnits] = useState<FeaturedUnit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedUnits = async () => {
      setLoading(true);
      // Fetch featured units with their property info and primary image
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
            property_id,
            is_featured,
            status,
            property:properties (
              title,
              city,
              address
            ),
            images:property_unit_images (
              asset_id,
              is_primary,
              asset:assets (
                public_url
              )
            )
          `
        )
        .eq("is_featured", true)
        .eq("status", "published")
        .order("listing_priority", { ascending: false })
        .order("created_at", { ascending: false });

      if (unitsError) {
        setUnits([]);
        setLoading(false);
        return;
      }

      // Map and extract primary image and property info
      const featuredUnits: FeaturedUnit[] = (unitsData || []).map((unit: any) => {
        // Get primary image
        let primaryImageUrl = "";
        if (unit.images && Array.isArray(unit.images)) {
          const primaryImg = unit.images.find((img: any) => img.is_primary && img.asset?.public_url);
          if (primaryImg) {
            primaryImageUrl = primaryImg.asset.public_url;
          }
        }
        return {
          id: unit.id,
          unit_label: unit.unit_label,
          bedrooms: unit.bedrooms,
          bathrooms: unit.bathrooms,
          area_sqft: unit.area_sqft,
          rent_amount: unit.rent_amount,
          rent_currency: unit.rent_currency || "USD",
          property_title: unit.property?.title || "",
          property_city: unit.property?.city || "",
          property_address: unit.property?.address || "",
          primary_image_url: primaryImageUrl,
        };
      });

      setUnits(featuredUnits);
      setLoading(false);
    };

    fetchFeaturedUnits();
  }, []);

  return (
    <section className="py-12 sm:py-16 md:py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8 sm:mb-12 px-4">
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-3 sm:mb-4">
            Featured Properties
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
            Discover our handpicked selection of premium units available for lodging across the UK.
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12 text-muted-foreground">Loading featured units...</div>
        ) : units.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">No featured units available at the moment.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8 sm:mb-10">
            {units.map((unit) => (
              <Card
                key={unit.id}
                className="group overflow-hidden border-border hover:shadow-lifted transition-all duration-300"
              >
                <div className="relative overflow-hidden h-48 sm:h-56 md:h-64">
                  {unit.primary_image_url ? (
                    <img
                      src={unit.primary_image_url}
                      alt={unit.unit_label}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-muted text-muted-foreground text-xs">
                      No Image
                    </div>
                  )}
                  <div className="absolute top-3 sm:top-4 right-3 sm:right-4 bg-accent text-primary px-2 sm:px-3 py-1 rounded-full text-xs font-semibold">
                    Featured
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-start justify-between mb-2 sm:mb-3 gap-2">
                    <h3 className="font-semibold text-base sm:text-lg text-foreground line-clamp-2 flex-1">
                      {unit.unit_label}
                    </h3>
                    <span className="text-accent font-bold text-lg sm:text-xl whitespace-nowrap">
                      {unit.rent_currency === "GBP" || unit.rent_currency === "£"
                        ? `£${unit.rent_amount?.toLocaleString()}`
                        : `${unit.rent_amount?.toLocaleString()} ${unit.rent_currency}`}
                      <span className="text-xs sm:text-sm font-normal text-muted-foreground">
                        /mo
                      </span>
                    </span>
                  </div>
                  <div className="flex items-center text-muted-foreground text-xs sm:text-sm mb-3 sm:mb-4">
                    <MapPin className="h-3 w-3 sm:h-4 sm:w-4 mr-1 flex-shrink-0" />
                    <span className="line-clamp-1">
                      {unit.property_title}
                      {unit.property_city ? `, ${unit.property_city}` : ""}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">
                    <div className="flex items-center gap-1">
                      <Bed className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span>{unit.bedrooms}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Bath className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span>{unit.bathrooms}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Square className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span className="whitespace-nowrap">{unit.area_sqft} sqft</span>
                    </div>
                  </div>
                  <Button
                    asChild
                    variant="outline"
                    className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300"
                  >
                    <Link to={`/unit/${unit.id}`}>View Details</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <div className="text-center">
          <Button
            asChild
            size="lg"
            className="bg-gradient-gold text-primary font-semibold shadow-gold hover:shadow-lifted transition-all duration-300"
          >
            <Link to="/units">View All Units</Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProperties;