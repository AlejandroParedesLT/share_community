import React, { createContext, useContext, useEffect, useState } from 'react';
import { ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getAccessToken, refreshAccessToken, login, logout } from '../lib/django';

type Auth = {
  isAuthenticated: boolean;
  accessToken: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
};

const AuthContext = createContext<Auth>({
  isAuthenticated: false,
  accessToken: null,
  login: async () => false,
  logout: () => {},
});

export default function AuthProvider({ children }:any) {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const initializeAuth = async () => {
      const token = await getAccessToken();
      if (token) {
        setAccessToken(token);
      } else {
        const newToken = await refreshAccessToken();
        setAccessToken(newToken);
      }
      setIsReady(true);
    };

    initializeAuth();
  }, []);

  const handleLogin = async (email: string, password: string) => {
    const data = await login(email, password);
    if (data) {
      setAccessToken(data.access);
      return true;
    }
    return false;
  };

  const handleLogout = async () => {
    await logout();
    setAccessToken(null);
  };

  if (!isReady) {
    return <ActivityIndicator />;
  }

  return (
    <AuthContext.Provider
      value={{ isAuthenticated: !!accessToken, accessToken, login: handleLogin, logout: handleLogout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
