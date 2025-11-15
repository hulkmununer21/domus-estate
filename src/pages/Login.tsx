import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth, Role } from "@/contexts/AuthContext";
import SEO from "@/components/SEO";
import logo from "@/assets/logo.png";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("lodger");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const result = await login(email, password, role);
    setLoading(false);

    if (result?.success) {
      // Redirect user based on role
      if (role === "admin") navigate("/admin-portal");
      else if (role === "landlord") navigate("/landlord-portal");
      else if (role === "staff") navigate("/staff-portal");
      else navigate("/lodger-portal");
    }
    // Errors are handled via toast in AuthContext
  };

  return (
    <>
      <SEO
        title="Login - Domus Servitia | Access Your Property Portal"
        description="Sign in to your Domus Servitia portal. Access property management tools, payments, documents, and communications. Secure login for lodgers, landlords, staff, and administrators."
        keywords="domus servitia login, property portal login, landlord login, lodger portal, property management login"
        canonical="https://domusservitia.co.uk/login"
      />

      <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Link to="/" className="inline-block mb-6">
              <img
                src={logo}
                alt="Domus Servitia"
                className="h-20 mx-auto rounded-xl shadow-md"
              />
            </Link>
            <h1 className="font-serif text-3xl font-bold text-foreground mb-2">
              Welcome Back
            </h1>
            <p className="text-muted-foreground">
              Sign in to access your portal
            </p>
          </div>

          <Card className="border-border shadow-elegant">
            <CardHeader>
              <CardTitle>Sign In</CardTitle>
              <CardDescription>
                Enter your credentials to access your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">

                {/* Role selection */}
                <div className="space-y-2">
                  <Label htmlFor="role">Login as</Label>
                  <select
                    id="role"
                    value={role}
                    onChange={(e) => setRole(e.target.value as Role)}
                    className="w-full h-10 px-3 rounded-md border border-input bg-background"
                  >
                    <option value="lodger">Lodger</option>
                    <option value="landlord">Landlord</option>
                    <option value="staff">Staff Member</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>

                {/* Email input */}
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="john.doe@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                {/* Password input */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    <Link
                      to="/forgot-password"
                      className="text-sm text-accent hover:underline"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>

                {/* Submit button */}
                <Button
                  type="submit"
                  className="w-full bg-gradient-gold text-primary font-semibold shadow-gold hover:shadow-lifted"
                  disabled={loading}
                >
                  {loading ? "Logging in..." : "Sign In"}
                </Button>
              </form>

              {/* Sign up link */}
              <div className="mt-6 text-center text-sm">
                <span className="text-muted-foreground">
                  Don't have an account?{" "}
                </span>
                <Link
                  to="/signup"
                  className="text-accent font-semibold hover:underline"
                >
                  Sign up
                </Link>
              </div>
            </CardContent>
          </Card>

          <div className="mt-6 text-center">
            <Link
              to="/"
              className="text-sm text-muted-foreground hover:text-accent"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;
