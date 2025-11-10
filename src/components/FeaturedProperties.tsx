import { Link } from "react-router-dom";
import { MapPin, Bed, Bath, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const properties = [
  {
    id: 1,
    title: "Modern City Centre Studio",
    location: "Manchester City Centre",
    price: "£750",
    beds: 1,
    baths: 1,
    sqft: 450,
    image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800",
    featured: true,
  },
  {
    id: 2,
    title: "Luxury 2-Bed Apartment",
    location: "Canary Wharf, London",
    price: "£1,800",
    beds: 2,
    baths: 2,
    sqft: 850,
    image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800",
    featured: true,
  },
  {
    id: 3,
    title: "Spacious Family Home",
    location: "Birmingham Suburbs",
    price: "£1,200",
    beds: 3,
    baths: 2,
    sqft: 1200,
    image: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800",
    featured: false,
  },
  {
    id: 4,
    title: "Executive Penthouse",
    location: "Edinburgh New Town",
    price: "£2,500",
    beds: 3,
    baths: 3,
    sqft: 1500,
    image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800",
    featured: true,
  },
];

const FeaturedProperties = () => {
  return (
    <section className="py-12 sm:py-16 md:py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8 sm:mb-12 px-4">
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-3 sm:mb-4">
            Featured Properties
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
            Discover our handpicked selection of premium properties available
            for lodging across the UK.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8 sm:mb-10">
          {properties.map((property) => (
            <Card
              key={property.id}
              className="group overflow-hidden border-border hover:shadow-lifted transition-all duration-300"
            >
              <div className="relative overflow-hidden h-48 sm:h-56 md:h-64">
                <img
                  src={property.image}
                  alt={property.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                {property.featured && (
                  <div className="absolute top-3 sm:top-4 right-3 sm:right-4 bg-accent text-primary px-2 sm:px-3 py-1 rounded-full text-xs font-semibold">
                    Featured
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-primary/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-start justify-between mb-2 sm:mb-3 gap-2">
                  <h3 className="font-semibold text-base sm:text-lg text-foreground line-clamp-2 flex-1">
                    {property.title}
                  </h3>
                  <span className="text-accent font-bold text-lg sm:text-xl whitespace-nowrap">
                    {property.price}
                    <span className="text-xs sm:text-sm font-normal text-muted-foreground">
                      /mo
                    </span>
                  </span>
                </div>
                <div className="flex items-center text-muted-foreground text-xs sm:text-sm mb-3 sm:mb-4">
                  <MapPin className="h-3 w-3 sm:h-4 sm:w-4 mr-1 flex-shrink-0" />
                  <span className="line-clamp-1">{property.location}</span>
                </div>
                <div className="flex items-center justify-between text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">
                  <div className="flex items-center gap-1">
                    <Bed className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span>{property.beds}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Bath className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span>{property.baths}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Square className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="whitespace-nowrap">{property.sqft} sqft</span>
                  </div>
                </div>
                <Button
                  asChild
                  variant="outline"
                  className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300"
                >
                  <Link to={`/property/${property.id}`}>View Details</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <Button
            asChild
            size="lg"
            className="bg-gradient-gold text-primary font-semibold shadow-gold hover:shadow-lifted transition-all duration-300"
          >
            <Link to="/properties">View All Properties</Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProperties;
