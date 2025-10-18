
import React, { createContext, useState } from 'react';

export const SrsContext = createContext();

export const SrsProvider = ({ children }) => {
  const [srsData, setSrsData] = useState(null);

  return (
    <SrsContext.Provider value={{ srsData, setSrsData }}>
      {children}
    </SrsContext.Provider>
  );
};
