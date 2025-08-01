import { useState, useEffect } from "react";
import { SimpleAuth } from "@/lib/simple-auth";

export function useAuth() {
  const [user, setUser] = useState(SimpleAuth.getUser());
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check for deep link on app start
    const handleAuth = () => {
      setUser(SimpleAuth.getUser());
    };

    // Listen for auth changes
    window.addEventListener('storage', handleAuth);
    return () => window.removeEventListener('storage', handleAuth);
  }, []);

  const login = (email: string, password: string) => {
    setIsLoading(true);
    const result = SimpleAuth.login(email, password);
    setUser(result.user);
    setIsLoading(false);
    return result;
  };

  const logout = () => {
    SimpleAuth.logout();
    setUser(null);
  };

  return {
    user,
    isLoading,
    isAuthenticated: SimpleAuth.isAuthenticated(),
    login,
    logout
  };
}