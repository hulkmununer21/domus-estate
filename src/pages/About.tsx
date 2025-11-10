import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { Shield, Award, Users, Target } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const About = () => {
  return (
    <>
      <SEO
        title="About Us - Domus Servitia | 15+ Years Property Excellence"
        description="Learn about Domus Servitia's 15+ year history of excellence in UK property management. Our mission, values, leadership team, and commitment to quality service for landlords and lodgers."
        keywords="about domus servitia, property management company, UK property services, professional property care, experienced property managers"
        canonical="https://domusservitia.co.uk/about"
      />
      <div className="min-h-screen bg-background">
        <Navbar />

      {/* Hero Section */}
      <section className="pt-32 pb-16 bg-gradient-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h1 className="font-serif text-4xl md:text-5xl font-bold mb-6">
            About Domus Servitia
          </h1>
          <p className="text-xl text-primary-foreground/90 max-w-3xl mx-auto">
            Excellence in property management and maintenance services for over 15 years
          </p>
        </div>
      </section>

      {/* Mission & Values */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center mb-20">
            <div>
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-6">
                Our Mission
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                At Domus Servitia, we are committed to providing exceptional property
                maintenance and lodging services that exceed expectations. Our mission
                is to create comfortable, well-maintained living spaces while building
                lasting relationships with landlords and lodgers alike.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                We believe in transparency, professionalism, and quality service
                delivery. Every property under our management receives the attention
                and care it deserves, ensuring both landlords and lodgers have peace
                of mind.
              </p>
            </div>
            <div>
              <img
                src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800"
                alt="Modern Architecture"
                className="rounded-xl shadow-lifted w-full"
              />
            </div>
          </div>

          {/* Core Values */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Shield,
                title: "Integrity",
                description:
                  "We maintain the highest standards of honesty and ethical conduct",
              },
              {
                icon: Award,
                title: "Excellence",
                description:
                  "We strive for excellence in every aspect of our service delivery",
              },
              {
                icon: Users,
                title: "Client-Focused",
                description:
                  "Our clients' needs and satisfaction are at the heart of everything we do",
              },
              {
                icon: Target,
                title: "Reliability",
                description:
                  "We deliver on our promises with consistency and dependability",
              },
            ].map((value, index) => (
              <Card
                key={index}
                className="border-border hover:shadow-elegant transition-all duration-300"
              >
                <CardContent className="p-6 text-center">
                  <div className="bg-gradient-gold rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <value.icon className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg text-foreground mb-2">
                    {value.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {value.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-12">
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-6">
              Our Story
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed mb-6">
              Founded in 2009, Domus Servitia began with a simple vision: to
              revolutionize property management in the UK by combining traditional
              values with modern technology and practices.
            </p>
            <p className="text-lg text-muted-foreground leading-relaxed mb-6">
              Over the years, we've grown from managing a handful of properties to
              overseeing a diverse portfolio of over 500 properties across major UK
              cities. Our success is built on trust, transparency, and an unwavering
              commitment to quality.
            </p>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Today, we're proud to serve hundreds of landlords and lodgers,
              providing comprehensive property management and maintenance services
              that set the industry standard.
            </p>
          </div>

          {/* Stats */}
          <div className="grid md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            {[
              { number: "15+", label: "Years Experience" },
              { number: "500+", label: "Properties Managed" },
              { number: "98%", label: "Client Satisfaction" },
              { number: "24/7", label: "Support Available" },
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-accent mb-2">
                  {stat.number}
                </div>
                <div className="text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-4">
              Our Leadership Team
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                name: "Robert Thompson",
                role: "Managing Director",
                image:
                  "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400",
              },
              {
                name: "Catherine Williams",
                role: "Head of Operations",
                image:
                  "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400",
              },
              {
                name: "James Anderson",
                role: "Client Relations Director",
                image:
                  "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400",
              },
            ].map((member, index) => (
              <Card
                key={index}
                className="border-border overflow-hidden hover:shadow-elegant transition-all duration-300"
              >
                <div className="aspect-square overflow-hidden">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover"
                  />
                </div>
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

export default About;
