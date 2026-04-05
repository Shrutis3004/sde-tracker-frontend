import React, { createContext, useState, useContext, useEffect } from 'react';
import { login as loginApi, register as registerApi, storage } from '../services/api';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const token = await storage.getItem('token');
      const userData = await storage.getItem('user');
      if (token && userData) {
        setUser(JSON.parse(userData));
      }
    } catch (error) {
      console.log('Failed to load user:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const response = await loginApi(email, password);
    const { token, user: userData } = response.data;
    await storage.setItem('token', token);
    await storage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const register = async (name, email, password) => {
    const response = await registerApi(name, email, password);
    const { token, user: userData } = response.data;
    await storage.setItem('token', token);
    await storage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = async () => {
    await storage.deleteItem('token');
    await storage.deleteItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
