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
      console.log('AuthContext: Fetching user, token exists:', !!token);
      if (token) {
        const res = await axios.get('/api/profile', { 
          headers: { 'x-auth-token': token } 
        });
        const userData = res.data;
        const role = userData.role ? userData.role.toLowerCase() : '';
        console.log('AuthContext: User data fetched:', { userData, role });
        setUser(userData);
        setIsAdmin(role === 'admin');
        setIsClient(role === 'client');
        setIsIntern(role === 'intern');
        console.log('AuthContext: User role set to:', role, 'isIntern:', role === 'intern');
      } else {
        console.log('AuthContext: No token found');
      }
    } catch (error) {
      console.error('AuthContext: Error fetching user:', error);
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