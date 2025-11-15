import { ReactNode, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth, Role } from "@/contexts/AuthContext";

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: Role[];
}

const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      // Not logged in
      navigate("/login", { replace: true });
      return;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
      // Logged in but not authorized for this route
      const portalMap: Record<Role, string> = {
        lodger: "/lodger-portal",
        landlord: "/landlord-portal",
        staff: "/staff-portal",
        admin: "/admin-portal",
      };
      navigate(portalMap[user.role], { replace: true });
    }
  }, [user, allowedRoles, navigate]);

  if (!user || (allowedRoles && !allowedRoles.includes(user.role))) return null;

  return <>{children}</>;
};

export default ProtectedRoute;
