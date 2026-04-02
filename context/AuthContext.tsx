"use client";

import getCandidatesCount from "@/services/frontend/candidates-count";
import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";

interface User {
  id: string;
  name: string;
  email: string;
  isAdmin?: boolean;
  firstName?: string;
  lastName?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean; // 👈 important
  login: (user: User, token: string) => void;
  logout: () => void;
  totalCandidateCount: number;
  setCandidateCount: () => Promise<void>;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [totalCandidateCount, setTotalCandidateCount] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState<string>("");

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("token");

    if (storedUser) setUser(JSON.parse(storedUser));
    if (storedToken) setToken(storedToken);

    setLoading(false); // 👈 done loading
  }, []);

  const login = (userData: User, authToken: string) => {
    setUser(userData);
    setToken(authToken);

    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("token", authToken);
  };

  const setCandidateCount = async (): Promise<void> => {
    try {
      const res = await getCandidatesCount();
      // API returns { success: true, data: { count: number } }
      setTotalCandidateCount(res.data.count);
    } catch (err) {
      console.error("Failed to fetch candidate count", err);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);

    localStorage.removeItem("user");
    localStorage.removeItem("token");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        totalCandidateCount,
        setCandidateCount,
        login,
        logout,
        searchQuery,
        setSearchQuery,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
};
