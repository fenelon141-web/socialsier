import { useState, useEffect } from "react";

interface User {
  id: string;
  email: string;
  name: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem('auth_user');
    return stored ? JSON.parse(stored) : null;
  });
  const [isLoading, setIsLoading] = useState(false);

  const login = (email: string, password: string) => {
    setIsLoading(true);
    
    // Simple authentication - works immediately
    const newUser = {
      id: Date.now().toString(),
      email,
      name: email.split('@')[0]
    };
    
    localStorage.setItem('auth_user', JSON.stringify(newUser));
    localStorage.setItem('auth_token', 'token_' + Date.now());
    setUser(newUser);
    setIsLoading(false);
    
    return newUser;
  };

  const logout = () => {
    localStorage.removeItem('auth_user');
    localStorage.removeItem('auth_token');
    setUser(null);
  };

  const handleDeepLink = (url: string) => {
    if (url.includes('auth/callback')) {
      const urlObj = new URL(url);
      const token = urlObj.searchParams.get('token');
      const email = urlObj.searchParams.get('email') || 'deeplink@example.com';
      
      if (token) {
        const newUser = {
          id: 'deeplink_' + Date.now(),
          email,
          name: 'Deep Link User'
        };
        
        localStorage.setItem('auth_user', JSON.stringify(newUser));
        localStorage.setItem('auth_token', token);
        setUser(newUser);
        return true;
      }
    }
    return false;
  };

  useEffect(() => {
    // Listen for deep links in mobile app
    if (typeof window !== 'undefined' && window.location.href.includes('auth/callback')) {
      handleDeepLink(window.location.href);
    }
  }, []);

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    handleDeepLink
  };
}