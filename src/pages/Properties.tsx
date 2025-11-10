import { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { MapPin, Bed, Bath, Square, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
    available: true,
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
    available: true,
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
    available: true,
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
    available: false,
  },
  {
    id: 5,
    title: "Cozy 1-Bed Flat",
    location: "Leeds City Centre",
    price: "£650",
    beds: 1,
    baths: 1,
    sqft: 500,
    image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800",
    featured: false,
    available: true,
  },
  {
    id: 6,
    title: "Riverside Apartment",
    location: "Bristol Harbourside",
    price: "£950",
    beds: 2,
    baths: 1,
    sqft: 700,
    image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800",
    featured: false,
    available: true,
  },
];

const Properties = () => {
  const [searchTerm, setSearchTerm] = useState("");

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
                  placeholder="Search by location..."
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
            <select className="h-10 px-4 rounded-md border border-border bg-background">
              <option>Property Type</option>
              <option>Studio</option>
              <option>1 Bedroom</option>
              <option>2 Bedroom</option>
              <option>3+ Bedroom</option>
            </select>
            <select className="h-10 px-4 rounded-md border border-border bg-background">
              <option>Price Range</option>
              <option>£500 - £800</option>
              <option>£800 - £1200</option>
              <option>£1200 - £1500</option>
              <option>£1500+</option>
            </select>
            <select className="h-10 px-4 rounded-md border border-border bg-background">
              <option>Availability</option>
              <option>Available Now</option>
              <option>Coming Soon</option>
            </select>
            <Button variant="outline" className="h-10">
              Reset Filters
            </Button>
          </div>
        </div>
      </section>

      {/* Properties Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((property) => (
              <Card
                key={property.id}
                className="group overflow-hidden border-border hover:shadow-lifted transition-all duration-300"
              >
                <div className="relative overflow-hidden h-64">
                  <img
                    src={property.image}
                    alt={property.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  {property.featured && (
                    <div className="absolute top-4 left-4 bg-accent text-primary px-3 py-1 rounded-full text-xs font-semibold">
                      Featured
                    </div>
                  )}
                  {!property.available && (
                    <div className="absolute top-4 right-4 bg-destructive text-destructive-foreground px-3 py-1 rounded-full text-xs font-semibold">
                      Unavailable
                    </div>
                  )}
                </div>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-semibold text-lg text-foreground line-clamp-1">
                      {property.title}
                    </h3>
                    <span className="text-accent font-bold text-xl whitespace-nowrap ml-2">
                      {property.price}
                      <span className="text-sm font-normal text-muted-foreground">
                        /mo
                      </span>
                    </span>
                  </div>
                  <div className="flex items-center text-muted-foreground text-sm mb-4">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span className="line-clamp-1">{property.location}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                    <div className="flex items-center">
                      <Bed className="h-4 w-4 mr-1" />
                      <span>{property.beds}</span>
                    </div>
                    <div className="flex items-center">
                      <Bath className="h-4 w-4 mr-1" />
                      <span>{property.baths}</span>
                    </div>
                    <div className="flex items-center">
                      <Square className="h-4 w-4 mr-1" />
                      <span>{property.sqft} sqft</span>
                    </div>
                  </div>
                  <Button
                    asChild
                    variant="outline"
                    className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300"
                    disabled={!property.available}
                  >
                    <Link to={`/property/${property.id}`}>
                      {property.available ? "View Details" : "View Anyway"}
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
    </>
  );
};

export default Properties;
