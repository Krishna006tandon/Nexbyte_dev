import React, { createContext, useState } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isClient, setIsClient] = useState(false);

  return (
    <AuthContext.Provider value={{ isAdmin, isClient, setIsAdmin, setIsClient }}>
      {children}
    </AuthContext.Provider>
  );
};
