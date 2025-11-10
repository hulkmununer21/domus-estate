import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();

  // Determine dashboard route based on user role
  const dashboardRoute =
    user?.role === "admin"
      ? "/admin-portal"
      : user?.role === "landlord"
      ? "/landlord-portal"
      : user?.role === "staff"
      ? "/staff-portal"
      : "/lodger-portal";

  // Scroll effect for navbar styling
  // (optional, keep if you have scroll-based styling)
  // useEffect(() => {
  //   const handleScroll = () => setIsScrolled(window.scrollY > 10);
  //   window.addEventListener("scroll", handleScroll);
  //   return () => window.removeEventListener("scroll", handleScroll);
  // }, []);

  return (
    <nav className={`w-full bg-card border-b border-border sticky top-0 z-50 shadow-sm`}>
      <div className="container mx-auto px-4 flex items-center justify-between h-16">
        <Link to="/" className="font-bold text-xl text-accent">
          Domus Servitia
        </Link>
        <div className="hidden lg:flex items-center space-x-4">
          {!!user ? (
            <>
              <Button
                variant="outline"
                asChild
                className={`font-semibold text-accent hover:text-accent ${
                  isScrolled
                    ? "border-accent/50 hover:bg-accent/10"
                    : "border-accent/50 hover:bg-accent/10"
                }`}
              >
                <Link to={dashboardRoute}>Dashboard</Link>
              </Button>
              <Button
                variant="ghost"
                onClick={logout}
                className="font-semibold text-destructive hover:text-destructive"
              >
                Logout
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                asChild
                className={`font-semibold text-accent hover:text-accent ${
                  isScrolled
                    ? "border-accent/50 hover:bg-accent/10"
                    : "border-accent/50 hover:bg-accent/10"
                }`}
              >
                <Link to="/login">Login</Link>
              </Button>
              <Button
                asChild
                className="bg-gradient-gold text-primary font-bold shadow-gold hover:shadow-lifted transition-all duration-300 border-2 border-accent/30"
              >
                <Link to="/properties">View Properties</Link>
              </Button>
            </>
          )}
        </div>
        {/* Mobile menu button */}
        <button
          className="lg:hidden p-2"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle menu"
        >
          <span className="material-icons">{isMobileMenuOpen ? "close" : "menu"}</span>
        </button>
      </div>
      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-card border-t border-border px-4 py-2">
          <div className="flex flex-col space-y-3 pt-2 sm:pt-4">
            {!!user ? (
              <>
                <Button
                  variant="outline"
                  asChild
                  className="w-full h-11 text-base touch-manipulation"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Link to={dashboardRoute}>Dashboard</Link>
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    logout();
                  }}
                  className="w-full h-11 text-base text-destructive touch-manipulation"
                >
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  asChild
                  className="w-full h-11 text-base touch-manipulation"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Link to="/login">Login</Link>
                </Button>
                <Button
                  asChild
                  className="w-full h-11 bg-gradient-gold text-primary font-semibold text-base touch-manipulation"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Link to="/properties">View Properties</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
