import AsyncStorage from '@react-native-async-storage/async-storage';
//import { API_URL } from '@env';
//const API_URL = 'http://localhost:8001';
import Constants from 'expo-constants';


export const login = async (email: string, password: string) => {
  try {
    const response = await fetch(`${process.env.EXPO_PUBLIC_DJANGO_API_URL}/api/login/`, {
    //const response = await fetch(`http://192.168.87.1:8001/api/login/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: email, password }),
    });

    if (!response.ok) throw new Error('Invalid credentials');

    const data = await response.json();
    await AsyncStorage.setItem('accessToken', data.access);
    await AsyncStorage.setItem('refreshToken', data.refresh);
    
    return data;
  } catch (error) {
    console.error('Login failed:', error);
    return null;
  }
};

export const logout = async () => {
  await AsyncStorage.removeItem('accessToken');
  await AsyncStorage.removeItem('refreshToken');
};

export const getAccessToken = async () => {
  return await AsyncStorage.getItem('accessToken');
};

export const refreshAccessToken = async () => {
  const refreshToken = await AsyncStorage.getItem('refreshToken');

  if (!refreshToken) return null;

  try {
    const response = await fetch(`${process.env.EXPO_PUBLIC_DJANGO_API_URL}/token/refresh/`, {
    //const response = await fetch(`http://192.168.87.1:8001/token/refresh/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh: refreshToken }),
    });

    if (!response.ok) throw new Error('Failed to refresh token');

    const data = await response.json();
    await AsyncStorage.setItem('accessToken', data.access);
    return data.access;
  } catch (error) {
    console.error('Token refresh failed:', error);
    await logout();
    return null;
  }
};
