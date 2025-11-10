import { Link } from "react-router-dom";
import { Facebook, Twitter, Instagram, Linkedin } from "lucide-react";
import logo from "@/assets/logo.png";

const Footer = () => {
  return (
    <footer className="bg-primary text-primary-foreground py-10 sm:py-12 md:py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 mb-8 sm:mb-12">
          {/* Brand */}
          <div className="text-center sm:text-left">
            <img src={logo} alt="Domus Servitia" className="h-12 sm:h-14 md:h-16 w-auto mb-3 sm:mb-4 rounded-xl shadow-md mx-auto sm:mx-0" />
            <p className="text-sm sm:text-base text-primary-foreground/80 leading-relaxed mb-4 sm:mb-0">
              Excellence in property maintenance and lodging services across the
              United Kingdom.
            </p>
            <div className="flex gap-3 sm:gap-4 mt-4 sm:mt-6 justify-center sm:justify-start">
              <a
                href="#"
                className="bg-primary-foreground/10 hover:bg-accent w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-colors touch-manipulation"
                aria-label="Facebook"
              >
                <Facebook className="h-4 w-4 sm:h-5 sm:w-5" />
              </a>
              <a
                href="#"
                className="bg-primary-foreground/10 hover:bg-accent w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-colors touch-manipulation"
                aria-label="Twitter"
              >
                <Twitter className="h-4 w-4 sm:h-5 sm:w-5" />
              </a>
              <a
                href="#"
                className="bg-primary-foreground/10 hover:bg-accent w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-colors touch-manipulation"
                aria-label="Instagram"
              >
                <Instagram className="h-4 w-4 sm:h-5 sm:w-5" />
              </a>
              <a
                href="#"
                className="bg-primary-foreground/10 hover:bg-accent w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-colors touch-manipulation"
                aria-label="LinkedIn"
              >
                <Linkedin className="h-4 w-4 sm:h-5 sm:w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="text-center sm:text-left">
            <h3 className="font-semibold text-base sm:text-lg mb-3 sm:mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/properties"
                  className="text-sm sm:text-base text-primary-foreground/80 hover:text-accent transition-colors inline-block py-1 touch-manipulation"
                >
                  Browse Properties
                </Link>
              </li>
              <li>
                <Link
                  to="/about"
                  className="text-sm sm:text-base text-primary-foreground/80 hover:text-accent transition-colors inline-block py-1 touch-manipulation"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  to="/services"
                  className="text-sm sm:text-base text-primary-foreground/80 hover:text-accent transition-colors inline-block py-1 touch-manipulation"
                >
                  Our Services
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="text-sm sm:text-base text-primary-foreground/80 hover:text-accent transition-colors inline-block py-1 touch-manipulation"
                >
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* For Clients */}
          <div className="text-center sm:text-left">
            <h3 className="font-semibold text-base sm:text-lg mb-3 sm:mb-4">For Clients</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/lodger-portal"
                  className="text-sm sm:text-base text-primary-foreground/80 hover:text-accent transition-colors inline-block py-1 touch-manipulation"
                >
                  Lodger Portal
                </Link>
              </li>
              <li>
                <Link
                  to="/landlord-portal"
                  className="text-sm sm:text-base text-primary-foreground/80 hover:text-accent transition-colors inline-block py-1 touch-manipulation"
                >
                  Landlord Portal
                </Link>
              </li>
              <li>
                <Link
                  to="/submit-complaint"
                  className="text-sm sm:text-base text-primary-foreground/80 hover:text-accent transition-colors inline-block py-1 touch-manipulation"
                >
                  Submit a Complaint
                </Link>
              </li>
              <li>
                <Link
                  to="/faq"
                  className="text-sm sm:text-base text-primary-foreground/80 hover:text-accent transition-colors inline-block py-1 touch-manipulation"
                >
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div className="text-center sm:text-left">
            <h3 className="font-semibold text-base sm:text-lg mb-3 sm:mb-4">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/privacy"
                  className="text-sm sm:text-base text-primary-foreground/80 hover:text-accent transition-colors inline-block py-1 touch-manipulation"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  to="/terms"
                  className="text-sm sm:text-base text-primary-foreground/80 hover:text-accent transition-colors inline-block py-1 touch-manipulation"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  to="/cookies"
                  className="text-sm sm:text-base text-primary-foreground/80 hover:text-accent transition-colors inline-block py-1 touch-manipulation"
                >
                  Cookie Policy
                </Link>
              </li>
              <li>
                <Link
                  to="/gdpr"
                  className="text-sm sm:text-base text-primary-foreground/80 hover:text-accent transition-colors inline-block py-1 touch-manipulation"
                >
                  GDPR Compliance
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-primary-foreground/20 pt-6 sm:pt-8 text-center text-primary-foreground/60">
          <p className="text-xs sm:text-sm">
            © {new Date().getFullYear()} Domus Servitia. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
