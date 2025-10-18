import React, { createContext, useState } from 'react';

export const SrsContext = createContext();

export const SrsProvider = ({ children }) => {
  const [srsFullData, setSrsFullData] = useState(null);

  return (
    <SrsContext.Provider value={{ srsFullData, setSrsFullData }}>
      {children}
    </SrsContext.Provider>
  );
};