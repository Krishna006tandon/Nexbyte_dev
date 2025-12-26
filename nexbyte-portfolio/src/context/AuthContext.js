import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [user, setUser] = useState(null);

  const fetchUser = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const res = await axios.get('/api/profile', { headers: { 'x-auth-token': token } });
        setUser(res.data);
        if (res.data.role === 'admin') {
          setIsAdmin(true);
        }
      }
    } catch (error) {
      console.error('Error fetching user:', error);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <AuthContext.Provider value={{ isAdmin, isClient, setIsAdmin, setIsClient, user, fetchUser }}>
      {children}
    </AuthContext.Provider>
  );
};
export default useAuth;