

import { createContext, useContext, useState } from "react";

const CityContext = createContext();

export const CityProvider = ({ children }) => {
  const [city, setCity] = useState(
    localStorage.getItem("selectedCity") || ""
  );

  const changeCity = (newCity) => {
    setCity(newCity);
    localStorage.setItem("selectedCity", newCity);
  };

  const clearCity = () => {
    setCity("");
    localStorage.removeItem("selectedCity");
  };

  return (
    <CityContext.Provider value={{ city, changeCity, clearCity }}>
      {children}
    </CityContext.Provider>
  );
};

export const useCity = () => useContext(CityContext);
