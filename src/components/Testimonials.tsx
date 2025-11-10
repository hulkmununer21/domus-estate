import { Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const testimonials = [
  {
    name: "Sarah Thompson",
    role: "Lodger",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400",
    content:
      "Exceptional service from start to finish. The property was exactly as described, and the maintenance team is incredibly responsive. Highly recommended!",
    rating: 5,
  },
  {
    name: "James Mitchell",
    role: "Landlord",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400",
    content:
      "Domus Servitia has transformed how I manage my properties. Professional, reliable, and they truly care about maintaining high standards.",
    rating: 5,
  },
  {
    name: "Emily Roberts",
    role: "Lodger",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400",
    content:
      "Finding a quality place to stay was effortless. The team is professional, and the property maintenance is top-notch. Couldn't be happier!",
    rating: 5,
  },
];

const Testimonials = () => {
  return (
    <section className="py-12 sm:py-16 md:py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8 sm:mb-12 px-4">
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-3 sm:mb-4">
            What Our Clients Say
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
            Trusted by landlords and lodgers across the UK for our commitment to
            excellence.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {testimonials.map((testimonial, index) => (
            <Card
              key={index}
              className="border-border hover:shadow-elegant transition-all duration-300"
            >
              <CardContent className="p-6 sm:p-8">
                <div className="flex items-center gap-1 mb-3 sm:mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star
                      key={i}
                      className="h-4 w-4 sm:h-5 sm:w-5 fill-accent text-accent"
                    />
                  ))}
                </div>
                <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6 leading-relaxed italic">
                  "{testimonial.content}"
                </p>
                <div className="flex items-center gap-3 sm:gap-4">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover flex-shrink-0"
                  />
                  <div className="min-w-0">
                    <div className="font-semibold text-foreground text-sm sm:text-base">
                      {testimonial.name}
                    </div>
                    <div className="text-xs sm:text-sm text-muted-foreground">
                      {testimonial.role}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
