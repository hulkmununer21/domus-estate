import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQ = () => {
  const faqs = [
    {
      category: "General Information",
      questions: [
        {
          q: "What services does Domus Servitia provide?",
          a: "We provide comprehensive property maintenance services, professional lodging management, cleaning services, emergency repairs, property inspections, and full landlord support across the UK."
        },
        {
          q: "Which areas do you cover?",
          a: "We operate throughout major UK cities including Manchester, London, Birmingham, Edinburgh, Leeds, Bristol, and surrounding areas. Contact us to confirm coverage in your specific location."
        },
        {
          q: "How quickly can you respond to emergency maintenance?",
          a: "We offer 24/7 emergency response with typical arrival times of 2-4 hours for urgent issues. Our team prioritizes safety-critical repairs such as gas leaks, electrical faults, and water damage."
        }
      ]
    },
    {
      category: "For Lodgers",
      questions: [
        {
          q: "How do I report a maintenance issue?",
          a: "Log into your Lodger Portal or contact us via phone, email, or our complaint submission form. Include photos if possible and describe the issue in detail. We'll respond within 24 hours on weekdays."
        },
        {
          q: "What is included in my lodging agreement?",
          a: "Standard lodging agreements include regular property maintenance, 24/7 emergency support, routine inspections, cleaning services (where applicable), and access to our tenant portal for communications and requests."
        },
        {
          q: "Can I request specific services not in my agreement?",
          a: "Yes, additional services can be arranged. Contact your property manager through the portal or submit a request via our services page. We'll provide a quote and timeline for any additional work."
        }
      ]
    },
    {
      category: "For Landlords",
      questions: [
        {
          q: "What does your property management service include?",
          a: "Our comprehensive package includes tenant sourcing and vetting, rent collection, property maintenance coordination, regular inspections, compliance management, financial reporting, and 24/7 emergency response."
        },
        {
          q: "How often are property inspections conducted?",
          a: "Standard inspections are conducted quarterly with detailed reports provided within 48 hours. Additional inspections can be scheduled as needed or requested through your Landlord Portal."
        },
        {
          q: "What are your management fees?",
          a: "Our fees vary based on service level and property portfolio size. Contact us for a personalized quote. We offer competitive rates with transparent pricing and no hidden costs."
        }
      ]
    },
    {
      category: "Billing & Payments",
      questions: [
        {
          q: "What payment methods do you accept?",
          a: "We accept bank transfers, direct debit, credit/debit cards, and online payments through our secure portal. Automatic payment options are available for regular service packages."
        },
        {
          q: "When will I receive invoices?",
          a: "Invoices are issued monthly for ongoing services and immediately upon completion for one-off jobs. All invoices are available in your portal and sent via email."
        },
        {
          q: "What is your refund policy?",
          a: "We stand behind our work. If you're unsatisfied with any service, contact us within 7 days. We'll either rectify the issue at no cost or provide a full refund as per our Terms of Service."
        }
      ]
    },
    {
      category: "Compliance & Legal",
      questions: [
        {
          q: "Are you fully insured and certified?",
          a: "Yes, we maintain full public liability insurance, professional indemnity insurance, and all relevant industry certifications. Our technicians are Gas Safe registered, NICEIC approved, and DBS checked."
        },
        {
          q: "How do you ensure GDPR compliance?",
          a: "We follow strict data protection protocols in line with UK GDPR requirements. Personal data is encrypted, access is restricted, and we never share information without explicit consent. See our GDPR Compliance page for details."
        },
        {
          q: "What safety standards do you follow?",
          a: "We adhere to all UK building regulations, health and safety legislation, and industry best practices. This includes annual gas safety certificates, electrical safety standards (EICR), and fire safety compliance."
        }
      ]
    }
  ];

  return (
    <>
      <SEO
        title="Frequently Asked Questions - Domus Servitia Help Centre"
        description="Find answers to common questions about Domus Servitia's property maintenance and lodging services. Information for lodgers, landlords, and property managers across the UK."
        keywords="property services FAQ, maintenance questions, lodging help, landlord support, UK property management help, Domus Servitia support"
        canonical="https://domusservitia.co.uk/faq"
      />
      <div className="min-h-screen bg-background">
        <Navbar />
        
        <main className="pt-28 pb-20">
          <div className="container mx-auto px-4 max-w-4xl">
            {/* Header */}
            <header className="text-center mb-16">
              <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-text">
                Frequently Asked Questions
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Find answers to common questions about our services. Can't find what you're looking for? Contact our support team.
              </p>
            </header>

            {/* FAQ Categories */}
            <div className="space-y-12">
              {faqs.map((category, idx) => (
                <section key={idx}>
                  <h2 className="text-2xl font-bold mb-6 text-foreground">
                    {category.category}
                  </h2>
                  <Accordion type="single" collapsible className="space-y-4">
                    {category.questions.map((item, qIdx) => (
                      <AccordionItem 
                        key={qIdx} 
                        value={`${idx}-${qIdx}`}
                        className="border border-border rounded-lg px-6 bg-card shadow-sm hover:shadow-md transition-shadow"
                      >
                        <AccordionTrigger className="text-left font-semibold hover:text-accent">
                          {item.q}
                        </AccordionTrigger>
                        <AccordionContent className="text-muted-foreground leading-relaxed">
                          {item.a}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </section>
              ))}
            </div>

            {/* Contact CTA */}
            <div className="mt-16 text-center p-8 bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg border border-accent/20">
              <h3 className="text-2xl font-bold mb-4">Still have questions?</h3>
              <p className="text-muted-foreground mb-6">
                Our support team is here to help you with any queries.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a 
                  href="/#contact" 
                  className="inline-block px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Contact Us
                </a>
                <a 
                  href="/submit-complaint" 
                  className="inline-block px-6 py-3 bg-accent text-accent-foreground font-semibold rounded-lg hover:bg-accent/90 transition-colors"
                >
                  Submit a Complaint
                </a>
              </div>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default FAQ;
