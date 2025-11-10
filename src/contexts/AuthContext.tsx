import { createContext, useContext, useState } from "react";
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
  const [user, setUser] = useState<User | null>(null);

  const login = async (email: string, password: string, selectedRole: Role) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error || !data.user) {
      toast.error("Invalid email or password.");
      return { success: false };
    }
    const userId = data.user.id;

    // Check if user exists in the selected profile table
    let profileTable = "";
    if (selectedRole === "admin") profileTable = "admin_profiles";
    else if (selectedRole === "landlord") profileTable = "landlord_profiles";
    else if (selectedRole === "staff") profileTable = "staff_profiles";
    else if (selectedRole === "lodger") profileTable = "lodger_profiles";

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
    // Navigation should be handled in the page/component
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
