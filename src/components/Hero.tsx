import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import heroImage from "@/assets/hero-property.jpg";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroImage}
          alt="Luxury Property"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-hero" />
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 pt-24 sm:pt-28 md:pt-32 pb-12 sm:pb-16 md:pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8 py-8 sm:py-10 md:py-12 text-center">
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold text-primary-foreground mb-6 sm:mb-8 leading-tight animate-fade-in">
            Excellence in Property
            <span className="block text-accent mt-2">Management & Lodging</span>
          </h1>
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-primary-foreground/90 mb-8 sm:mb-10 md:mb-12 leading-relaxed max-w-3xl mx-auto">
            Trusted by landlords and lodgers across the UK for professional
            maintenance and quality assured service.
          </p>

          {/* Search Box */}
          <div className="bg-card/95 backdrop-blur-sm p-6 sm:p-7 md:p-8 rounded-xl shadow-lifted max-w-3xl mx-auto mb-10 sm:mb-12 md:mb-14">
            <div className="flex flex-col gap-4 sm:gap-5">
              <Input
                type="text"
                placeholder="Search by location..."
                className="w-full h-12 sm:h-14 border-border text-base px-4"
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                <select className="h-12 sm:h-14 px-4 rounded-md border border-border bg-background text-base">
                  <option>Property Type</option>
                  <option>Rooms in HMO (Shared House)</option>
                  <option>Studio</option>
                  <option>Flat/Apartment</option>
                  <option>House</option>
                  <option>Bungalow</option>
                  <option>Townhouse</option>
                  <option>Detached</option>
                  <option>Semi-Detached</option>
                  <option>Terraced</option>
                </select>
                <select className="h-12 sm:h-14 px-4 rounded-md border border-border bg-background text-base">
                  <option>Price Range</option>
                  <option>£500 - £800</option>
                  <option>£800 - £1200</option>
                  <option>£1200 - £1500</option>
                  <option>£1500+</option>
                </select>
              </div>
              <Button className="w-full h-12 sm:h-14 px-8 bg-gradient-gold text-primary font-semibold shadow-gold hover:shadow-lifted transition-all duration-300 text-base">
                <Search className="h-5 w-5 mr-2" />
                Search
              </Button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="mt-10 sm:mt-14 md:mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
            <div className="text-center py-4">
              <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-accent mb-2 sm:mb-3">500+</div>
              <div className="text-primary-foreground/80 text-xs sm:text-sm leading-relaxed">Properties Managed</div>
            </div>
            <div className="text-center py-4">
              <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-accent mb-2 sm:mb-3">98%</div>
              <div className="text-primary-foreground/80 text-xs sm:text-sm leading-relaxed">Client Satisfaction</div>
            </div>
            <div className="text-center py-4">
              <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-accent mb-2 sm:mb-3">24/7</div>
              <div className="text-primary-foreground/80 text-xs sm:text-sm leading-relaxed">Support Available</div>
            </div>
            <div className="text-center py-4">
              <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-accent mb-2 sm:mb-3">15+</div>
              <div className="text-primary-foreground/80 text-xs sm:text-sm leading-relaxed">Years Experience</div>
            </div>
          </div>
        </div>
      </div>

    </section>
  );
};

export default Hero;
