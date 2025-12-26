import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [isIntern, setIsIntern] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const res = await axios.get('/api/profile', { 
          headers: { 'x-auth-token': token } 
        });
        const userData = res.data;
        setUser(userData);
        setIsAdmin(userData.role === 'admin');
        setIsClient(userData.role === 'client');
        setIsIntern(userData.role === 'intern');
        console.log('User role set to:', userData.role);
      }
    } catch (error) {
      console.error('Error fetching user:', error);
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <AuthContext.Provider value={{ 
      isAdmin, 
      isClient, 
      isIntern,
      setIsAdmin, 
      setIsClient, 
      setIsIntern,
      user, 
      fetchUser,
      loading
    }}>
      {children}
    </AuthContext.Provider>
  );
};
export const useAuth = () => React.useContext(AuthContext);