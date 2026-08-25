import { createContext, useContext, useState } from "react";

const HomeContext = createContext(null);

export const HomeProvider = ({ children }) => {
  const [homes, setHomes] = useState([]);

  const addHome = (home) => {
    setHomes((prev) => [home, ...prev]);
  };

  return (
    <HomeContext.Provider value={{ homes, setHomes, addHome }}>
      {children}
    </HomeContext.Provider>
  );
};

export const useHomes = () => {
  const ctx = useContext(HomeContext);
  if (!ctx) throw new Error("useHomes debe usarse dentro de <HomeProvider>");
  return ctx;
};

export default HomeContext;
