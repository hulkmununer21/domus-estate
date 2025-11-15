import { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";

export type Role = "lodger" | "landlord" | "staff" | "admin";

interface User {
  id: string;
  email: string;
  role: Role;
  name: string;
}

interface AuthContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  login: (email: string, password: string, role: Role) => Promise<{ success: boolean; role?: Role }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(() => {
    // Load user from localStorage on initial load
    const storedUser = localStorage.getItem("domus-user");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  // Optional: Listen to Supabase auth changes
  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        setUser(null);
        localStorage.removeItem("domus-user");
      }
    });
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string, selectedRole: Role) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error || !data.user) {
      toast.error("Invalid email or password.");
      return { success: false };
    }

    const userId = data.user.id;

    // Determine profile table
    const profileTableMap: Record<Role, string> = {
      admin: "admin_profiles",
      landlord: "landlord_profiles",
      staff: "staff_profiles",
      lodger: "lodger_profiles",
    };

    const profileTable = profileTableMap[selectedRole];

    const { data: profile } = await supabase
      .from(profileTable)
      .select("user_id")
      .eq("user_id", userId)
      .single();

    if (!profile) {
      toast.error(`You do not have a ${selectedRole} account.`);
      return { success: false };
    }

    const userData: User = {
      id: userId,
      email,
      role: selectedRole,
      name: email.split("@")[0],
    };

    setUser(userData);
    localStorage.setItem("domus-user", JSON.stringify(userData));

    return { success: true, role: selectedRole };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("domus-user");
    supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
