import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import FeaturedProperties from "@/components/FeaturedProperties";
import Services from "@/components/Services";
import Testimonials from "@/components/Testimonials";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";

const Index = () => {
  return (
    <>
      <SEO
        title="Domus Servitia - Premier Property Maintenance & Lodging Services UK"
        description="Leading UK property management company with 15+ years experience. Professional maintenance, quality lodging, and comprehensive services. 500+ properties managed, 98% client satisfaction. Manchester, London, Birmingham, Edinburgh."
        keywords="property maintenance UK, property management services, professional lodging UK, landlord services, property letting, maintenance services, UK property care, quality accommodation"
        canonical="https://domusservitia.co.uk/"
      />
      <div className="min-h-screen">
        <Navbar />
        <section id="home">
          <Hero />
        </section>
        <section id="properties">
          <FeaturedProperties />
        </section>
        <section id="services">
          <Services />
        </section>
        <section id="testimonials">
          <Testimonials />
        </section>
        <section id="contact">
          <Contact />
        </section>
        <Footer />
      </div>
    </>
  );
};

export default Index;
