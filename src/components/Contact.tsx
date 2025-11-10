import { Mail, Phone, MapPin, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const Contact = () => {
  const handleWhatsAppClick = () => {
    window.open("https://wa.me/447000000000", "_blank");
  };

  return (
    <section className="py-12 sm:py-16 md:py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-8 sm:gap-12">
          {/* Contact Information */}
          <div className="px-4">
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4 sm:mb-6">
              Get In Touch
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground mb-6 sm:mb-8 leading-relaxed">
              Whether you're a landlord looking for professional property
              management or a lodger seeking quality accommodation, we're here
              to help.
            </p>

            <div className="space-y-4 sm:space-y-6 mb-6 sm:mb-8">
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="bg-gradient-gold rounded-full w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center flex-shrink-0">
                  <Phone className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                </div>
                <div className="min-w-0">
                  <div className="font-semibold text-foreground mb-1 text-sm sm:text-base">
                    Phone
                  </div>
                  <a
                    href="tel:+447000000000"
                    className="text-sm sm:text-base text-muted-foreground hover:text-accent transition-colors break-all"
                  >
                    +44 (0) 7000 000 000
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3 sm:gap-4">
                <div className="bg-gradient-gold rounded-full w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center flex-shrink-0">
                  <Mail className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                </div>
                <div className="min-w-0">
                  <div className="font-semibold text-foreground mb-1 text-sm sm:text-base">
                    Email
                  </div>
                  <a
                    href="mailto:info@domusservitia.co.uk"
                    className="text-sm sm:text-base text-muted-foreground hover:text-accent transition-colors break-all"
                  >
                    info@domusservitia.co.uk
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3 sm:gap-4">
                <div className="bg-gradient-gold rounded-full w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center flex-shrink-0">
                  <MapPin className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                </div>
                <div>
                  <div className="font-semibold text-foreground mb-1 text-sm sm:text-base">
                    Office
                  </div>
                  <p className="text-sm sm:text-base text-muted-foreground">
                    123 Business Street
                    <br />
                    Manchester, M1 1AA
                    <br />
                    United Kingdom
                  </p>
                </div>
              </div>
            </div>

            <Button
              onClick={handleWhatsAppClick}
              size="lg"
              className="bg-[#25D366] hover:bg-[#20BD5A] text-white shadow-lg w-full md:w-auto text-sm sm:text-base h-12"
            >
              <MessageCircle className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
              Live Chat on WhatsApp
            </Button>
          </div>

          {/* Contact Form */}
          <div className="bg-card p-4 sm:p-6 md:p-8 rounded-xl shadow-elegant border border-border">
            <h3 className="font-serif text-xl sm:text-2xl font-bold text-foreground mb-4 sm:mb-6">
              Send us a Message
            </h3>
            <form className="space-y-3 sm:space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    First Name
                  </label>
                  <Input placeholder="John" className="h-10 sm:h-12 text-base" />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Last Name
                  </label>
                  <Input placeholder="Doe" className="h-10 sm:h-12 text-base" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Email Address
                </label>
                <Input type="email" placeholder="john.doe@example.com" className="h-10 sm:h-12 text-base" />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Phone Number
                </label>
                <Input type="tel" placeholder="+44 7000 000000" className="h-10 sm:h-12 text-base" />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  I am a...
                </label>
                <select className="w-full h-10 sm:h-12 px-3 rounded-md border border-input bg-background text-base">
                  <option>Select one</option>
                  <option>Potential Lodger</option>
                  <option>Landlord</option>
                  <option>Service Inquiry</option>
                  <option>Other</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Message
                </label>
                <Textarea
                  placeholder="Tell us how we can help you..."
                  rows={5}
                  className="resize-none text-base"
                />
              </div>
              <Button
                type="submit"
                className="w-full h-10 sm:h-12 bg-gradient-gold text-primary font-semibold shadow-gold hover:shadow-lifted transition-all duration-300 text-base"
              >
                Send Message
              </Button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
