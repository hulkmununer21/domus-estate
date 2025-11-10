import { Wrench, Droplets, Leaf, Zap, Shield, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const services = [
  {
    icon: Wrench,
    title: "Property Maintenance",
    description:
      "Comprehensive maintenance services to keep your property in pristine condition.",
  },
  {
    icon: Droplets,
    title: "Cleaning Services",
    description:
      "Professional cleaning services ensuring immaculate living spaces for all lodgers.",
  },
  {
    icon: Leaf,
    title: "Garden Maintenance",
    description:
      "Expert gardening services maintaining beautiful outdoor spaces year-round.",
  },
  {
    icon: Zap,
    title: "Electrical Services",
    description:
      "Licensed electricians providing safe and reliable electrical solutions.",
  },
  {
    icon: Shield,
    title: "24/7 Emergency Support",
    description:
      "Round-the-clock emergency response for urgent property issues.",
  },
  {
    icon: Clock,
    title: "Regular Inspections",
    description:
      "Scheduled property inspections ensuring everything runs smoothly.",
  },
];

const Services = () => {
  return (
    <section className="py-12 sm:py-16 md:py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8 sm:mb-12 px-4">
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-3 sm:mb-4">
            Our Services
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
            Comprehensive property management and maintenance services tailored
            to meet your needs.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {services.map((service, index) => (
            <Card
              key={index}
              className="group border-border hover:shadow-elegant hover:border-accent/50 transition-all duration-300"
            >
              <CardContent className="p-6 sm:p-8">
                <div className="bg-gradient-gold rounded-full w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300">
                  <service.icon className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
                </div>
                <h3 className="font-semibold text-lg sm:text-xl text-foreground mb-2 sm:mb-3">
                  {service.title}
                </h3>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                  {service.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;
