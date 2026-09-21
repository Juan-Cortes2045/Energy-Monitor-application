import { createContext, useContext, useState } from "react";

const HomeContext = createContext(null);

export const HomeProvider = ({ children }) => {
  const [homes, setHomes] = useState([]);

  const addHome = (home) => {
    setHomes((prev) => [home, ...prev]);
  };

  const setFavorite = (id, favorite) => {
    setHomes((prev) => prev.map((h) => (h.id === id ? { ...h, favorite } : h)));
  };

  return (
    <HomeContext.Provider value={{ homes, setHomes, addHome, setFavorite }}>
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
