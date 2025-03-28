import React, { createContext, useContext, useEffect, useState } from 'react';
import { ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getAccessToken, refreshAccessToken, login, logout, getUserInfo } from '../lib/django';

type User = {
  id: number;
  username: string;
  email: string;
};

type Auth = {
  isAuthenticated: boolean;
  accessToken: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  user: User | null;
};

const AuthContext = createContext<Auth>({
  isAuthenticated: false,
  accessToken: null,
  login: async () => false,
  logout: () => {},
  user: null,
});

export default function AuthProvider({ children }:any) {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const initializeAuth = async () => {
      const token = await getAccessToken();
      if (token) {
        setAccessToken(token);
        await fetchUser(token);
      } else {
        const newToken = await refreshAccessToken();
        setAccessToken(newToken);
        await fetchUser(newToken); // ✅ Fetch user after refreshing token
      }
      setIsReady(true);
    };

    initializeAuth();
  }, []);

  const fetchUser = async (token: string) => {
    // Early return if no token is provided
    if (!token) {
      setUser(null);
      return;
    }
    try {
      const userInfo = await getUserInfo(token); // ✅ Fetch user from backend
      setUser(userInfo);
    } catch (error) {
      console.error("Failed to fetch user info:", error);
    }
  };

  const handleLogin = async (email: string, password: string) => {
    const data = await login(email, password);
    if (data) {
      setAccessToken(data.access);
      await fetchUser(data.access); // ✅ Fetch user after login
      return true;
    }
    return false;
  };

  const handleLogout = async () => {
    await logout();
    setAccessToken(null);
    setUser(null);
  };

  if (!isReady) {
    return <ActivityIndicator />;
  }

  return (
    <AuthContext.Provider
      value={{ isAuthenticated: !!accessToken, accessToken, login: handleLogin, logout: handleLogout, user }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
